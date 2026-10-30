import { Box, MousePointerClick } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
};

/** Click counter brick used by early React labs. */
export function CounterCard({ title, count, onIncrement, onReset }: Props) {
  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Box className="size-4 text-accent" aria-hidden />
        {title}
      </div>
      <p className="text-center font-mono text-4xl tabular-nums text-white">{count}</p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={onIncrement}
          className={cn(
            "inline-flex w-36 items-center justify-center gap-2 rounded-md border border-accent/40",
            "bg-accent/15 px-3 py-2 text-sm font-medium text-accent",
            "hover:bg-accent/25",
          )}
        >
          <MousePointerClick className="size-4" aria-hidden />
          Increment
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-36 items-center justify-center rounded-md border border-line px-3 py-2 text-sm text-muted hover:border-muted hover:text-white"
        >
          Reset
        </button>
      </div>
    </Panel>
  );
}
