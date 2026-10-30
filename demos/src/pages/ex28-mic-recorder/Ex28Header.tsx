import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex28 — keep `index.tsx` free of long JSX. */
export function Ex28Header() {
  return (
    <LabHeader
      ex="ex28"
      focus="Mic recorder"
      title="Record MicPcm to WAV"
      description="Capture board PCM over USB, play it on the PC speakers, or download a 16 kHz mono WAV. Needs es3c28p."
    />
  );
}
