import { useState } from "react";

/** Tiny local counter — good first hook before hardware state. */
export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  return {
    count,
    increment: () => setCount((n) => n + 1),
    reset: () => setCount(initial),
  };
}
