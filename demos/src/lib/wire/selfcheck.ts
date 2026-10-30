import { FrameDecoder } from "@/lib/wire/frame";

/** Golden empty-payload frame from the firmware wire test vectors. */
const GOLDEN_EMPTY_HEX = "00022001010103b40800";

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Returns true when the local decoder matches the known good frame. */
export function wireSelfCheck(): boolean {
  const frames = new FrameDecoder().feed(hexToBytes(GOLDEN_EMPTY_HEX));
  if (frames.length !== 1) return false;
  const f = frames[0];
  return f.msgType === 0x20 && f.seq === 0 && f.payload.length === 0;
}
