import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex09 — keep `index.tsx` free of long JSX. */
export function Ex09Header() {
  return (
    <LabHeader
      ex="ex09"
      focus="SFX prog"
      title="Upload a melody"
      description="1) Connect and wait until Ready. 2) Upload melody (custom tune → slot 3). 3) Play user slot — it should NOT sound like Chime. Compare: tap Chime, then Play user slot again."
    />
  );
}
