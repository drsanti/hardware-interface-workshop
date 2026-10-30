import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex31 — keep `index.tsx` free of long JSX. */
export function Ex31Header() {
  return (
    <LabHeader
      ex="ex31"
      focus="Mic pitch"
      title="YIN pitch from MicPcm"
      description="Estimate fundamental frequency with YIN, show note name and cents. Whistle or hum — speech is harder. Needs es3c28p + USB."
    />
  );
}
