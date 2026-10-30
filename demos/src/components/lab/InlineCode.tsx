import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Monospace chip used in lab copy. */
export function InlineCode({ children, className }: Props) {
  return (
    <code className={cn("rounded bg-panel px-1.5 py-0.5 font-mono text-sm text-serial", className)}>
      {children}
    </code>
  );
}
