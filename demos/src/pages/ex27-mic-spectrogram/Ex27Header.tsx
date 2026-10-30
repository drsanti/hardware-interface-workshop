import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex27 — keep `index.tsx` free of long JSX. */
export function Ex27Header() {
  return (
    <LabHeader
      ex="ex27"
      focus="Mic spectrogram"
      title="Scrolling spectrogram"
      description="Same MicPcm FFT as ex26, hopped over time — frequency up the Y axis, newest column on the right. Needs es3c28p + USB."
    />
  );
}
