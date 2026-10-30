import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex33 — keep `index.tsx` free of long JSX. */
export function Ex33Header() {
  return (
    <LabHeader
      ex="ex33"
      focus="Mic react"
      title="Classify → LED / SFX"
      description="Close the loop: MicPcm features become a sound class, then the board LED and speaker react. Needs es3c28p + USB."
    />
  );
}
