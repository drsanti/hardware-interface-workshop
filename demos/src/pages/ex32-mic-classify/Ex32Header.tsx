import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex32 — keep `index.tsx` free of long JSX. */
export function Ex32Header() {
  return (
    <LabHeader
      ex="ex32"
      focus="Mic classify"
      title="Classify silence / speech / whistle"
      description="Baseline rules on MIR features, then train a tiny k-NN with your own labeled frames. Needs es3c28p + USB."
    />
  );
}
