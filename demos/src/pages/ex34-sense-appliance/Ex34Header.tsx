import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex34 — keep `index.tsx` free of long JSX. */
export function Ex34Header() {
  return (
    <LabHeader
      ex="ex34"
      focus="Sense appliance"
      title="Classify + key + batt"
      description="Capstone product: MicPcm class drives LED/SFX, BOOT overrides mode, low battery mutes the speaker. Needs es3c28p + USB."
    />
  );
}
