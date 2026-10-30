import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex30 — keep `index.tsx` free of long JSX. */
export function Ex30Header() {
  return (
    <LabHeader
      ex="ex30"
      focus="Mic features"
      title="Live feature extraction"
      description="RMS, zero-crossing rate, spectral centroid, flatness, and rolloff from MicPcm — building blocks for classifiers. Needs es3c28p + USB."
    />
  );
}
