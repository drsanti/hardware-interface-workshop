import { bleWrite, closeBleLink, openBleLink, type BleLink } from "./ble";
import { bleUnsupportedReason, serialUnsupportedReason } from "./browser";
import { FrameDecoder, frameEncode, type DecodedFrame } from "./wire/frame";
import { MSG_CMD_ACK, decodeCmdAck } from "./wire/led";
import { MSG_CMD_ROUTE, UPLINK_ROUTE_ALL, encodeRouteCfg } from "./wire/route";

/** Host open rate. USB-Serial/JTAG ignores baud on the MCU; keep 921600. */
export const SERIAL_BAUD = 921_600;
/** Wait after USB open — reopen can reset the board. */
export const SERIAL_SETTLE_MS = 2_500;
/** BLE needs no USB settle — short pause for GATT notify race. */
export const BLE_SETTLE_MS = 400;

export type LinkStatus = "idle" | "picking" | "open" | "error";
export type LinkTransport = "serial" | "ble";

export type FrameHandler = (frame: DecodedFrame) => void;
export type SessionChangeHandler = () => void;

type PendingAck = {
  seq: number;
  msgType: number;
  resolve: (rc: number) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Framework-agnostic board link over **Web Serial** or **Web Bluetooth**.
 * Same COBS frames on both pipes.
 *
 * ```ts
 * const board = new BoardSession();
 * board.onChange(() => updateUi(board));
 * await board.connectSerial(); // user gesture
 * await board.writeAcked(MSG_LED_FX, encodeLedSolid({ r: 255, g: 0, b: 0 }));
 * ```
 */
export class BoardSession {
  status: LinkStatus = "idle";
  message: string | null = null;
  transport: LinkTransport | null = null;
  ready = false;

  private port: SerialPort | null = null;
  private ble: BleLink | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private stop = false;
  private seq = 0;
  private sessionGen = 0;
  private readonly handlers = new Set<FrameHandler>();
  private readonly changeHandlers = new Set<SessionChangeHandler>();
  private notifyHandler: ((ev: Event) => void) | null = null;
  private gattserverHandler: (() => void) | null = null;
  private pendingAck: PendingAck | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  get serialSupported(): boolean {
    return serialUnsupportedReason() === null;
  }

  get bleSupported(): boolean {
    return bleUnsupportedReason() === null;
  }

  get supported(): boolean {
    return this.serialSupported || this.bleSupported;
  }

  /** Subscribe to decoded board frames. Returns unsubscribe. */
  subscribe(handler: FrameHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /** UI status / ready / message changes. Returns unsubscribe. */
  onChange(handler: SessionChangeHandler): () => void {
    this.changeHandlers.add(handler);
    return () => {
      this.changeHandlers.delete(handler);
    };
  }

  /** Prefer USB (same as `connectSerial`). */
  connect(): Promise<void> {
    return this.connectSerial();
  }

  async connectSerial(): Promise<void> {
    const reason = serialUnsupportedReason();
    if (reason) {
      this.setState({ status: "error", message: reason });
      return;
    }
    const serial = navigator.serial;
    if (!serial) {
      this.setState({
        status: "error",
        message: "Web Serial is not available — use Chrome or Edge.",
      });
      return;
    }

    await this.disconnect();
    this.setState({ status: "picking", message: "Choose the USB board in the browser picker…" });

    try {
      const next = await serial.requestPort();
      await next.open({ baudRate: SERIAL_BAUD });
      this.port = next;
      this.ble = null;
      this.transport = "serial";
      this.seq = 0;
      this.sessionGen += 1;
      this.setState({ status: "open", message: "USB serial open.", ready: false });
      void this.startSerialLoop(this.sessionGen);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError") {
        this.setState({ status: "idle", message: "USB picker cancelled." });
        return;
      }
      this.setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to open serial port.",
      });
    }
  }

  async connectBle(): Promise<void> {
    const reason = bleUnsupportedReason();
    if (reason) {
      this.setState({ status: "error", message: reason });
      return;
    }

    await this.disconnect();
    this.setState({
      status: "picking",
      message: "Choose the board in the Bluetooth picker…",
    });

    try {
      const link = await openBleLink();
      this.ble = link;
      this.port = null;
      this.transport = "ble";
      this.seq = 0;
      this.sessionGen += 1;
      this.setState({
        status: "open",
        message: link.name ? `Bluetooth open — ${link.name}` : "Bluetooth open.",
        ready: false,
      });
      void this.startBleLoop(this.sessionGen);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError") {
        this.setState({ status: "idle", message: "Bluetooth picker cancelled." });
        return;
      }
      this.setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to open Bluetooth.",
      });
    }
  }

  async disconnect(): Promise<void> {
    this.stop = true;
    this.clearSettleTimer();
    this.clearPendingAck();
    await this.releaseSerialReader();
    this.detachBleNotify();

    const serial = this.port;
    this.port = null;
    if (serial) {
      try {
        await serial.close();
      } catch {
        /* ok */
      }
    }

    const ble = this.ble;
    this.ble = null;
    await closeBleLink(ble);

    this.transport = null;
    this.setState({ status: "idle", message: "Disconnected.", ready: false });
  }

  /** Send a framed command; returns outbound seq. */
  async writeFrame(msgType: number, payload: Uint8Array): Promise<number> {
    const seq = this.seq++ & 0xffff;
    const frame = frameEncode(msgType, seq, payload);

    if (this.transport === "serial") {
      const current = this.port;
      if (!current?.writable) throw new Error("Serial port is not open for writing.");
      const writer = current.writable.getWriter();
      try {
        await writer.ready;
        await writer.write(frame.slice());
      } finally {
        writer.releaseLock();
      }
      return seq;
    }

    if (this.transport === "ble") {
      const link = this.ble;
      if (!link) throw new Error("Bluetooth link is not open for writing.");
      await bleWrite(link.rx, frame);
      return seq;
    }

    throw new Error("No link open.");
  }

  /**
   * Send a command and wait for matching `CmdAck` (msg_type + seq).
   * Newer calls replace older pending waits.
   */
  async writeAcked(msgType: number, payload: Uint8Array, timeoutMs = 2500): Promise<number> {
    const seq = await this.writeFrame(msgType, payload);
    return new Promise<number>((resolve, reject) => {
      if (this.pendingAck) {
        clearTimeout(this.pendingAck.timer);
        this.pendingAck.reject(new Error("Replaced by a newer command."));
      }
      const timer = setTimeout(() => {
        this.pendingAck = null;
        reject(new Error("No reply from board — is serial-bridge firmware on the board?"));
      }, timeoutMs);
      this.pendingAck = { seq, msgType, resolve, reject, timer };
    });
  }

  private emitFrames(frames: DecodedFrame[]): void {
    for (const frame of frames) {
      if (frame.msgType === MSG_CMD_ACK && this.pendingAck) {
        const ack = decodeCmdAck(frame.payload);
        const pending = this.pendingAck;
        if (ack.msgType === pending.msgType && (ack.reqSeq & 0xffff) === (pending.seq & 0xffff)) {
          clearTimeout(pending.timer);
          this.pendingAck = null;
          pending.resolve(ack.rc);
        }
      }
      for (const handler of this.handlers) handler(frame);
    }
  }

  private async startSerialLoop(gen: number): Promise<void> {
    const port = this.port;
    if (!port?.readable) return;

    this.stop = false;
    const decoder = new FrameDecoder();
    const reader = port.readable.getReader();
    this.reader = reader;

    await new Promise((r) => setTimeout(r, SERIAL_SETTLE_MS));
    if (this.stop || gen !== this.sessionGen) return;
    this.setState({ ready: true });

    try {
      while (!this.stop && gen === this.sessionGen) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        this.emitFrames(decoder.feed(value));
      }
    } catch {
      /* disconnect / cancel */
    }
  }

  private async startBleLoop(gen: number): Promise<void> {
    const link = this.ble;
    if (!link) return;

    this.stop = false;
    const decoder = new FrameDecoder();
    const onNotify = (ev: Event) => {
      const v = (ev.target as BluetoothRemoteGATTCharacteristic).value;
      if (!v?.byteLength) return;
      const copy = new Uint8Array(v.byteLength);
      copy.set(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
      this.emitFrames(decoder.feed(copy));
    };
    this.notifyHandler = onNotify;
    link.tx.addEventListener("characteristicvaluechanged", onNotify);

    const onGone = () => {
      void this.disconnect();
    };
    this.gattserverHandler = onGone;
    link.device.addEventListener("gattserverdisconnected", onGone);

    try {
      await link.tx.startNotifications();
    } catch (err) {
      if (!this.stop && gen === this.sessionGen) {
        this.setState({
          status: "error",
          message: err instanceof Error ? err.message : "BLE notify setup failed.",
          ready: false,
        });
      }
      return;
    }
    if (this.stop || gen !== this.sessionGen) return;

    /* Enable BLE in the MCU uplink mask; firmware also auto-ORs this on
     * subscribe and republishes BoardInfo when bit 0x04 rises. */
    try {
      await this.writeFrame(MSG_CMD_ROUTE, encodeRouteCfg(UPLINK_ROUTE_ALL));
    } catch {
      /* link may already be gone */
    }
    if (this.stop || gen !== this.sessionGen) return;

    this.settleTimer = setTimeout(() => {
      if (!this.stop && gen === this.sessionGen) this.setState({ ready: true });
    }, BLE_SETTLE_MS);
  }

  private async releaseSerialReader(): Promise<void> {
    this.stop = true;
    const reader = this.reader;
    this.reader = null;
    if (!reader) return;
    try {
      await reader.cancel();
    } catch {
      /* ok */
    }
    try {
      reader.releaseLock();
    } catch {
      /* ok */
    }
  }

  private detachBleNotify(): void {
    const link = this.ble;
    const handler = this.notifyHandler;
    if (link && handler) {
      try {
        link.tx.removeEventListener("characteristicvaluechanged", handler);
      } catch {
        /* ok */
      }
    }
    if (link && this.gattserverHandler) {
      try {
        link.device.removeEventListener("gattserverdisconnected", this.gattserverHandler);
      } catch {
        /* ok */
      }
    }
    this.notifyHandler = null;
    this.gattserverHandler = null;
  }

  private clearSettleTimer(): void {
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
  }

  private clearPendingAck(): void {
    if (!this.pendingAck) return;
    clearTimeout(this.pendingAck.timer);
    this.pendingAck = null;
  }

  private setState(partial: {
    status?: LinkStatus;
    message?: string | null;
    ready?: boolean;
  }): void {
    if (partial.status !== undefined) this.status = partial.status;
    if (partial.message !== undefined) this.message = partial.message;
    if (partial.ready !== undefined) this.ready = partial.ready;
    for (const h of this.changeHandlers) h();
  }
}
