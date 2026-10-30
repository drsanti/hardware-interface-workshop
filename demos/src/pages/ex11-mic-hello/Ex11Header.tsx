import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex11 — keep `index.tsx` free of long JSX. */
export function Ex11Header() {
  return (
    <LabHeader
      ex="ex11"
      focus="Mic hello"
      title="Turn on the mic"
      description="Enable capture with MicCmd and read AudioLevel numbers. Needs es3c28p."
    />
  );
}
