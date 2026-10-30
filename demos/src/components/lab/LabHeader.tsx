import type { ReactNode } from "react";

type Props = {
  /** Short lab id, e.g. `ex00`. */
  ex: string;
  /** Human title under the eyebrow. */
  title: ReactNode;
  /** One-line focus shown in the eyebrow after the lab id. */
  focus: string;
  description?: ReactNode;
};

/** Standard lab title block — keep page files free of layout chrome. */
export function LabHeader({ ex, title, focus, description }: Props) {
  return (
    <header className="space-y-3">
      <p className="text-sm font-medium tracking-wide text-muted uppercase">
        {ex} · {focus}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      {description ? <div className="max-w-2xl text-muted">{description}</div> : null}
    </header>
  );
}
