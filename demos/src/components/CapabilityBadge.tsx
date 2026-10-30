import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";

type Props = {
  label: string;
  ok: boolean;
  className?: string;
};

export function CapabilityBadge({ label, ok, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm",
        ok
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-danger/40 bg-danger/10 text-danger",
        className,
      )}
    >
      {ok ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      {label}
    </span>
  );
}
