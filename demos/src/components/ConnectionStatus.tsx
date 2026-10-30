import { cn } from "@/lib/cn";
import type { SerialPortStatus } from "@/hooks/useSerialPort";

const LABELS: Record<SerialPortStatus, string> = {
  idle: "Idle",
  picking: "Picking…",
  open: "Connected",
  error: "Error",
};

type Props = {
  status: SerialPortStatus;
  className?: string;
};

/** Neutral connection pill — Idle is muted, not red. */
export function ConnectionStatus({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        status === "open" && "border-accent/35 bg-accent/10 text-accent",
        status === "picking" && "border-warn/35 bg-warn/10 text-warn",
        status === "error" && "border-danger/35 bg-danger/10 text-danger",
        status === "idle" && "border-line bg-ink/40 text-muted",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "open" && "bg-accent",
          status === "picking" && "animate-pulse bg-warn",
          status === "error" && "bg-danger",
          status === "idle" && "bg-muted/70",
        )}
        aria-hidden
      />
      {LABELS[status]}
    </span>
  );
}
