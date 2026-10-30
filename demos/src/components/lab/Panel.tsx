import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Bordered content panel used across labs. */
export function Panel({ children, className }: Props) {
  return (
    <section className={cn("space-y-3 rounded-xl border border-line bg-panel p-5", className)}>
      {children}
    </section>
  );
}
