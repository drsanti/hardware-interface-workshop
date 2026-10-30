import { useCallback, useEffect, useRef, useState } from "react";

import {
  bleUnsupportedReason,
  bleWrite,
  closeBleLink,
  openBleLink,
  type BleLink,
} from "@/lib/ble";
import { hasWebSerial, isSecureContext } from "@/lib/browser";
import { FrameDecoder, frameEncode, type DecodedFrame } from "@/lib/wire";
import { SERIAL_BAUD, SERIAL_SETTLE_MS, type SerialPortStatus } from "@/hooks/useSerialPort";

/** BLE needs no USB settle reset — short pause for GATT notify race. */
export const BLE_SETTLE_MS = 400;

export type LinkTransport = "serial" | "ble";

export type SerialSessionState = {
  status: SerialPortStatus;
  message: string | null;
  /** True if at least one transport is available in this browser. */
  supported: boolean;
  serialSupported: boolean;
  bleSupported: boolean;
  /** Active pipe, or null when idle. */
  transport: LinkTransport | null;
  /** USB port when transport === "serial"; otherwise null. */
  port: SerialPort | null;
  ready: boolean;
  /** Prefer USB (kept for older call sites / ex02-style single button). */
  connect: () => Promise<void>;
  connectSerial: () => Promise<void>;
  connectBle: () => Promise<void>;
  disconnect: () => Promise<void>;
  writeFrame: (msgType: number, payload: Uint8Array) => Promise<number>;
  subscribe: (handler: (frame: DecodedFrame) => void) => () => void;
};

/** Fields labs pass into `SerialPortCard` for USB / BLE buttons. */
export type LinkCardProps = Pick<
  SerialSessionState,
  | "status"
  | "message"
  | "supported"
  | "serialSupported"
  | "bleSupported"
  | "transport"
  | "connect"
  | "connectSerial"
  | "connectBle"
  | "disconnect"
>;

export function linkCardProps(s: SerialSessionState): LinkCardProps {
  return {
    status: s.status,
    message: s.message,
    supported: s.supported,
    serialSupported: s.serialSupported,
    bleSupported: s.bleSupported,
    transport: s.transport,
    connect: s.connect,
    connectSerial: s.connectSerial,
    connectBle: s.connectBle,
    disconnect: s.disconnect,
  };
}

function serialUnsupportedReason(): string | null {
  if (!isSecureContext()) {
    return "Web Serial needs a secure context (localhost or HTTPS).";
  }
  if (!hasWebSerial()) {
    return "Web Serial is not available — use Chrome or Edge.";
  }
  return null;
}

/**
 * Shared board session over USB Serial **or** Web Bluetooth.
 * Same COBS frames on both pipes — labs stay transport-agnostic.
 */
export function useSerialSession(): SerialSessionState {
  const [status, setStatus] = useState<SerialPortStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [transport, setTransport] = useState<LinkTransport | null>(null);
  const [port, setPort] = useState<SerialPort | null>(null);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(0);

  const serialUnsupported = serialUnsupportedReason();
  const bleUnsupported = bleUnsupportedReason();
  const serialSupported = serialUnsupported === null;
  const bleSupported = bleUnsupported === null;
  const supported = serialSupported || bleSupported;

  const portRef = useRef<SerialPort | null>(null);
  const bleRef = useRef<BleLink | null>(null);
  const transportRef = useRef<LinkTransport | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const stopRef = useRef(false);
  const seqRef = useRef(0);
  const handlersRef = useRef(new Set<(frame: DecodedFrame) => void>());
  const notifyHandlerRef = useRef<((ev: Event) => void) | null>(null);

  useEffect(() => {
    portRef.current = port;
  }, [port]);

  useEffect(() => {
    transportRef.current = transport;
  }, [transport]);

  const releaseSerialReader = useCallback(async () => {
    stopRef.current = true;
    const reader = readerRef.current;
    readerRef.current = null;
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
  }, []);

  const detachBleNotify = useCallback(() => {
    const link = bleRef.current;
    const handler = notifyHandlerRef.current;
    if (link && handler) {
      try {
        link.tx.removeEventListener("characteristicvaluechanged", handler);
      } catch {
        /* ok */
      }
    }
    notifyHandlerRef.current = null;
  }, []);

  const subscribe = useCallback((handler: (frame: DecodedFrame) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  const writeFrame = useCallback(async (msgType: number, payload: Uint8Array) => {
    const seq = seqRef.current++ & 0xffff;
    const frame = frameEncode(msgType, seq, payload);
    const kind = transportRef.current;

    if (kind === "serial") {
      const current = portRef.current;
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

    if (kind === "ble") {
      const link = bleRef.current;
      if (!link) throw new Error("Bluetooth link is not open for writing.");
      await bleWrite(link.rx, frame);
      return seq;
    }

    throw new Error("No link open.");
  }, []);

  const disconnect = useCallback(async () => {
    stopRef.current = true;
    await releaseSerialReader();
    detachBleNotify();

    const serial = portRef.current;
    portRef.current = null;
    setPort(null);
    if (serial) {
      try {
        await serial.close();
      } catch {
        /* ok */
      }
    }

    const ble = bleRef.current;
    bleRef.current = null;
    await closeBleLink(ble);

    transportRef.current = null;
    setTransport(null);
    setReady(false);
    setStatus("idle");
    setMessage("Disconnected.");
  }, [detachBleNotify, releaseSerialReader]);

  const connectSerial = useCallback(async () => {
    const reason = serialUnsupportedReason();
    if (reason) {
      setStatus("error");
      setMessage(reason);
      return;
    }
    const serial = navigator.serial;
    if (!serial) {
      setStatus("error");
      setMessage("Web Serial is not available — use Chrome or Edge.");
      return;
    }

    await disconnect();
    setStatus("picking");
    setMessage("Choose the USB board in the browser picker…");

    try {
      const next = await serial.requestPort();
      await next.open({ baudRate: SERIAL_BAUD });
      portRef.current = next;
      bleRef.current = null;
      transportRef.current = "serial";
      setPort(next);
      setTransport("serial");
      setStatus("open");
      setMessage("USB serial open.");
      seqRef.current = 0;
      setSession((n) => n + 1);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError") {
        setStatus("idle");
        setMessage("USB picker cancelled.");
        return;
      }
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to open serial port.");
    }
  }, [disconnect]);

  const connectBle = useCallback(async () => {
    const reason = bleUnsupportedReason();
    if (reason) {
      setStatus("error");
      setMessage(reason);
      return;
    }

    await disconnect();
    setStatus("picking");
    setMessage("Choose the board in the Bluetooth picker…");

    try {
      const link = await openBleLink();
      bleRef.current = link;
      portRef.current = null;
      transportRef.current = "ble";
      setPort(null);
      setTransport("ble");
      setStatus("open");
      setMessage(link.name ? `Bluetooth open — ${link.name}` : "Bluetooth open.");
      seqRef.current = 0;
      setSession((n) => n + 1);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError") {
        setStatus("idle");
        setMessage("Bluetooth picker cancelled.");
        return;
      }
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to open Bluetooth.");
    }
  }, [disconnect]);

  /* USB reader loop */
  useEffect(() => {
    if (status !== "open" || transport !== "serial" || !port?.readable) return;

    stopRef.current = false;
    const decoder = new FrameDecoder();
    const reader = port.readable.getReader();
    readerRef.current = reader;

    void (async () => {
      await new Promise((r) => setTimeout(r, SERIAL_SETTLE_MS));
      if (stopRef.current) return;
      setReady(true);
      try {
        while (!stopRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          for (const frame of decoder.feed(value)) {
            for (const handler of handlersRef.current) handler(frame);
          }
        }
      } catch {
        /* disconnect / cancel */
      }
    })();

    return () => {
      void releaseSerialReader();
      setReady(false);
    };
  }, [status, transport, port, session, releaseSerialReader]);

  /* BLE notify loop */
  useEffect(() => {
    if (status !== "open" || transport !== "ble") return;
    const link = bleRef.current;
    if (!link) return;

    stopRef.current = false;
    const decoder = new FrameDecoder();
    const onNotify = (ev: Event) => {
      const v = (ev.target as BluetoothRemoteGATTCharacteristic).value;
      if (!v?.byteLength) return;
      const copy = new Uint8Array(v.byteLength);
      copy.set(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
      for (const frame of decoder.feed(copy)) {
        for (const handler of handlersRef.current) handler(frame);
      }
    };
    notifyHandlerRef.current = onNotify;
    link.tx.addEventListener("characteristicvaluechanged", onNotify);

    const onGone = () => {
      void disconnect();
    };
    link.device.addEventListener("gattserverdisconnected", onGone);

    const t = window.setTimeout(() => {
      if (!stopRef.current) setReady(true);
    }, BLE_SETTLE_MS);

    return () => {
      window.clearTimeout(t);
      stopRef.current = true;
      setReady(false);
      try {
        link.tx.removeEventListener("characteristicvaluechanged", onNotify);
      } catch {
        /* ok */
      }
      try {
        link.device.removeEventListener("gattserverdisconnected", onGone);
      } catch {
        /* ok */
      }
      notifyHandlerRef.current = null;
    };
  }, [status, transport, session, disconnect]);

  return {
    status,
    message:
      message ??
      (!supported
        ? "Neither Web Serial nor Web Bluetooth is available in this browser."
        : null),
    supported,
    serialSupported,
    bleSupported,
    transport,
    port,
    ready,
    connect: connectSerial,
    connectSerial,
    connectBle,
    disconnect,
    writeFrame,
    subscribe,
  };
}
