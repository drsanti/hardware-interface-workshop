import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex26 — keep `index.tsx` free of long JSX. */
export function Ex26Header() {
  return (
    <LabHeader
      ex="ex26"
      focus="Mic FFT"
      title="Live FFT from MicPcm"
      description="Stream board PCM into an in-process FFT and draw frequency bars. Needs es3c28p + USB."
    />
  );
}
