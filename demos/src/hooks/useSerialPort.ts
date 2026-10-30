import { useCallback, useRef, useState } from "react";

import { hasWebSerial, isSecureContext } from "@/lib/browser";

/**
 * Host open rate. USB-Serial/JTAG ignores baud on the MCU, but keep
 * 921600 to match the firmware / other host tools.
 */
export const SERIAL_BAUD = 921_600;

/** Wait after open — USB reopen can reset the board. */
export const SERIAL_SETTLE_MS = 2_500;

export type SerialPortStatus = "idle" | "picking" | "open" | "error";

export type SerialPortState = {
  status: SerialPortStatus;
  /** Short human message (error / cancel / hint). */
  message: string | null;
  /** True when the browser can show a serial picker. */
  supported: boolean;
  /** Open port handle — null when idle. */
  port: SerialPort | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

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
 * Request + open a serial port (picker needs a user gesture).
 * Callers that read must release the readable stream before disconnect.
 */
export function useSerialPort(baudRate = SERIAL_BAUD): SerialPortState {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [status, setStatus] = useState<SerialPortStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const portRef = useRef<SerialPort | null>(null);

  const unsupported = serialUnsupportedReason();
  const supported = unsupported === null;

  const disconnect = useCallback(async () => {
    const current = portRef.current;
    portRef.current = null;
    setPort(null);
    if (current) {
      try {
        await current.close();
      } catch {
        // Port may already be closed by the OS / unplug.
      }
    }
    setStatus("idle");
    setMessage("Disconnected.");
  }, []);

  const connect = useCallback(async () => {
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

    setStatus("picking");
    setMessage("Choose the board in the browser picker…");

    try {
      const next = await serial.requestPort();
      await next.open({ baudRate });
      portRef.current = next;
      setPort(next);
      setStatus("open");
      setMessage("Port open. You can disconnect when you are done.");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotFoundError") {
        setStatus("idle");
        setMessage("Picker cancelled — no port selected.");
        return;
      }
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to open serial port.");
    }
  }, [baudRate]);

  return {
    status,
    message: message ?? unsupported,
    supported,
    port,
    connect,
    disconnect,
  };
}
