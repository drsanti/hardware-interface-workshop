import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex08 — keep `index.tsx` free of long JSX. */
export function Ex08Header() {
  return (
    <LabHeader
      ex="ex08"
      focus="SFX params"
      title="Live sound knobs"
      description="Play a looping preset, then twist live SfxParam knobs. See the info box below for what each control does."
    />
  );
}
