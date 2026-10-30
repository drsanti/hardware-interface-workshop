import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Tailwind max-width token without the `max-w-` prefix. */
  width?: "lg" | "3xl";
  className?: string;
};

/** Shared page shell for every exNN lab. */
export function LabPage({ children, width = "3xl", className }: Props) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-full flex-col gap-8 px-6 py-10",
        width === "lg" ? "max-w-lg" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
