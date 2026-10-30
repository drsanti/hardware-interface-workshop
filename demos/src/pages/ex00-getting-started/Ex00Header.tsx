import { LabHeader } from "@/components/lab/LabHeader";
import { WORKSHOP_BOARD } from "@/lib/workshop";

/** Lab copy for ex00 — keep `index.tsx` free of long JSX. */
export function Ex00Header() {
  return (
    <LabHeader
      ex="ex00"
      focus="Getting started"
      title={
        <>
          Drive <span className="text-accent">{WORKSHOP_BOARD.id}</span> from the browser
        </>
      }
      description={
        <>
          Labs for <strong className="font-medium text-white">Web Serial</strong> and{" "}
          <strong className="font-medium text-white">Web Bluetooth</strong> against the board
          firmware. This target: {WORKSHOP_BOARD.blurb}. USB cable and wireless use the same message
          format — later labs only enable features your board actually has.
        </>
      }
    />
  );
}
