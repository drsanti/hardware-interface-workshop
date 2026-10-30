import { Bluetooth, Cable, PlugZap, Unplug } from "lucide-react";

import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import type { LinkTransport } from "@/hooks/useSerialSession";
import type { SerialPortStatus } from "@/hooks/useSerialPort";

type Props = {
  status: SerialPortStatus;
  message: string | null;
  disconnect: () => void | Promise<void>;
  /** Dual-transport session (ex03+). */
  serialSupported?: boolean;
  bleSupported?: boolean;
  transport?: LinkTransport | null;
  connectSerial?: () => void | Promise<void>;
  connectBle?: () => void | Promise<void>;
  /** Legacy single-button mode (ex02 / useSerialPort). */
  supported?: boolean;
  connect?: () => void | Promise<void>;
  /** Mic PCM / heavy streams — USB only. */
  serialOnly?: boolean;
  /** Extra hint under the buttons. */
  hint?: string | null;
};

/** Connect UI — USB Serial and/or Web Bluetooth. */
export function SerialPortCard({
  status,
  message,
  disconnect,
  serialSupported,
  bleSupported,
  transport = null,
  connectSerial,
  connectBle,
  supported,
  connect,
  serialOnly = false,
  hint = null,
}: Props) {
  const open = status === "open";
  const busy = status === "picking";
  const dual = typeof connectSerial === "function" || typeof connectBle === "function";
  const canSerial = dual ? Boolean(serialSupported && connectSerial) : Boolean(supported && connect);
  const canBle = dual && !serialOnly && Boolean(bleSupported && connectBle);
  const usbActive = open && transport === "serial";
  const bleActive = open && transport === "ble";

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {bleActive ? (
            <Bluetooth className="size-4 text-ble" aria-hidden />
          ) : (
            <Cable className="size-4 text-serial" aria-hidden />
          )}
          {dual ? "Board link" : "Serial port"}
          {open && transport ? (
            <span className="text-xs font-normal text-muted">
              · {transport === "ble" ? "Bluetooth" : "USB"}
            </span>
          ) : null}
        </div>
        <ConnectionStatus status={status} />
      </div>

      <p className="min-h-10 text-sm text-muted">
        {message ??
          (dual
            ? serialOnly
              ? "Connect over USB (this lab needs Web Serial)."
              : "Connect over USB or Bluetooth."
            : "Click Connect to open the port picker.")}
      </p>

      {serialOnly && dual ? (
        <p className="text-[11px] text-muted">
          Microphone PCM needs USB — Bluetooth stays disabled for this lab.
        </p>
      ) : null}
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}

      <div className="flex flex-wrap justify-center gap-2">
        {dual ? (
          <>
            <button
              type="button"
              onClick={() => void connectSerial?.()}
              disabled={!canSerial || busy || usbActive}
              className={cn(
                "inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
                "border-serial/40 bg-serial/15 text-serial hover:bg-serial/25",
                "disabled:cursor-not-allowed disabled:opacity-40",
                usbActive && "ring-1 ring-serial/50",
              )}
            >
              <Cable className="size-4" aria-hidden />
              {busy && !bleActive ? "Picking…" : "USB Serial"}
            </button>
            <button
              type="button"
              onClick={() => void connectBle?.()}
              disabled={!canBle || busy || bleActive}
              className={cn(
                "inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
                "border-ble/40 bg-ble/15 text-ble hover:bg-ble/25",
                "disabled:cursor-not-allowed disabled:opacity-40",
                bleActive && "ring-1 ring-ble/50",
              )}
            >
              <Bluetooth className="size-4" aria-hidden />
              {busy && !usbActive ? "Picking…" : "Bluetooth"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void connect?.()}
            disabled={!canSerial || busy || open}
            className={cn(
              "inline-flex w-36 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
              "border-serial/40 bg-serial/15 text-serial hover:bg-serial/25",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <PlugZap className="size-4" aria-hidden />
            {busy ? "Picking…" : "Connect"}
          </button>
        )}
        <button
          type="button"
          onClick={() => void disconnect()}
          disabled={!open}
          className={cn(
            "inline-flex w-36 items-center justify-center gap-2 rounded-md border border-line",
            "px-3 py-2 text-sm text-muted hover:border-muted hover:text-white",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Unplug className="size-4" aria-hidden />
          Disconnect
        </button>
      </div>
    </Panel>
  );
}
