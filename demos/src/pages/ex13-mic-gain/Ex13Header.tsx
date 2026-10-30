import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex13 — keep `index.tsx` free of long JSX. */
export function Ex13Header() {
  return (
    <LabHeader
      ex="ex13"
      focus="Mic gain"
      title="Gain and mute"
      description="Adjust MicCmd gain_pct and mute while watching the VU. Needs es3c28p."
    />
  );
}
