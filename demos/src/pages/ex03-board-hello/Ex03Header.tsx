import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex03 — keep `index.tsx` free of long JSX. */
export function Ex03Header() {
  return (
    <LabHeader
      ex="ex03"
      focus="Board hello"
      title="Hear the board introduce itself"
      description="Connect over USB, wait a moment for the board to settle, then read the identity message it sends on its own. No commands from the browser yet."
    />
  );
}
