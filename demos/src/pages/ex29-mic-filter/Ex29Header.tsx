import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex29 — keep `index.tsx` free of long JSX. */
export function Ex29Header() {
  return (
    <LabHeader
      ex="ex29"
      focus="Mic filter"
      title="Live biquad on MicPcm"
      description="Low-pass, high-pass, or band-pass the board mic in the browser. Watch the FFT and optionally monitor on PC speakers. Needs es3c28p + USB."
    />
  );
}
