import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex06 — keep `index.tsx` free of long JSX. */
export function Ex06Header() {
  return (
    <LabHeader
      ex="ex06"
      focus="SFX play"
      title="Play a board sound"
      description="First speaker lab: send SfxCmd presets (Chime / Alarm / Beep / Bird) and Stop. Starts quiet — raise Volume if needed. Works on both boards."
    />
  );
}
