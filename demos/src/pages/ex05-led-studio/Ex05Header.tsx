import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex05 — keep `index.tsx` free of long JSX. */
export function Ex05Header() {
  return (
    <LabHeader
      ex="ex05"
      focus="LED studio"
      title="Mix colors and play effects"
      description="Build on ex04: drag RGB sliders for continuous solid colors, tap solid swatches, then try Blink / Fade / Rainbow (LedFx). Needs es3c28p."
    />
  );
}
