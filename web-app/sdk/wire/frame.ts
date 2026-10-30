import { cobsDecode, cobsEncode } from "./cobs";
import { crc16 } from "./crc16";

/** Board identity message (MCU → host). */
export const MSG_BOARD_INFO = 0x28;

export type DecodedFrame = {
  msgType: number;
  seq: number;
  payload: Uint8Array;
};

/** Build one on-wire frame. */
export function frameEncode(msgType: number, seq: number, payload: Uint8Array): Uint8Array {
  const body = new Uint8Array(7 + payload.length);
  body[0] = msgType;
  body[1] = seq & 0xff;
  body[2] = (seq >> 8) & 0xff;
  body[3] = payload.length & 0xff;
  body[4] = (payload.length >> 8) & 0xff;
  body.set(payload, 5);
  const crc = crc16(body.subarray(0, 5 + payload.length));
  body[5 + payload.length] = crc & 0xff;
  body[6 + payload.length] = crc >> 8;
  const enc = cobsEncode(body);
  const out = new Uint8Array(enc.length + 2);
  out[0] = 0;
  out.set(enc, 1);
  out[enc.length + 1] = 0;
  return out;
}

/**
 * Streaming frame splitter. Feed USB/BLE chunks as they arrive; complete
 * valid frames are returned (noise between frames is ignored).
 */
export class FrameDecoder {
  private buf: number[] = [];
  private inFrame = false;

  feed(data: Uint8Array): DecodedFrame[] {
    const frames: DecodedFrame[] = [];
    for (const byte of data) {
      if (byte === 0) {
        const had = this.inFrame ? this.buf.length : 0;
        this.inFrame = true;
        if (had > 0) {
          const f = this.tryDecode();
          if (f) frames.push(f);
        }
        this.buf = [];
        continue;
      }
      if (!this.inFrame) continue;
      if (this.buf.length >= 1038) {
        this.inFrame = false;
        this.buf = [];
        continue;
      }
      this.buf.push(byte);
    }
    return frames;
  }

  private tryDecode(): DecodedFrame | null {
    const body = cobsDecode(new Uint8Array(this.buf));
    if (!body || body.length < 7) return null;
    const plen = body[3]! | (body[4]! << 8);
    if (body.length !== 7 + plen) return null;
    const want = body[5 + plen]! | (body[6 + plen]! << 8);
    if (crc16(body.subarray(0, 5 + plen)) !== want) return null;
    return {
      msgType: body[0]!,
      seq: body[1]! | (body[2]! << 8),
      payload: body.subarray(5, 5 + plen),
    };
  }
}
