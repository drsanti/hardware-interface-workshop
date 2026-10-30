import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex14 — keep `index.tsx` free of long JSX. */
export function Ex14Header() {
  return (
    <LabHeader
      ex="ex14"
      focus="Mic wave"
      title="Mic waveform"
      description="Opt in to MicPcm stream and draw a scrolling scope. Needs es3c28p."
    />
  );
}
