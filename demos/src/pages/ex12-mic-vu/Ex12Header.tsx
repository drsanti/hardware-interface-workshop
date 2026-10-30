import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex12 — keep `index.tsx` free of long JSX. */
export function Ex12Header() {
  return (
    <LabHeader
      ex="ex12"
      focus="Mic VU"
      title="Mic VU meter"
      description="Same AudioLevel stream drawn as a bar with peak hold. Needs es3c28p."
    />
  );
}
