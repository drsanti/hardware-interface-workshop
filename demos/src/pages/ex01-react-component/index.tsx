import { CounterCard } from "@/components/CounterCard";
import { LabPage } from "@/components/lab/LabPage";
import { useCounter } from "@/hooks/useCounter";

import { Ex01Header } from "./Ex01Header";

/**
 * ex01 — tiny React component practice (props, state, Tailwind).
 *
 * No hardware. Hook owns state; card is a dumb view — same pattern as later labs.
 */
export function Ex01ReactComponent() {
  // ── FOCUS: hook = state + actions; card = props only ──────────────
  const { count, increment, reset } = useCounter();

  return (
    <LabPage width="lg">
      <Ex01Header />
      <CounterCard title="Click counter" count={count} onIncrement={increment} onReset={reset} />
    </LabPage>
  );
}
