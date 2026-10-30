import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex04 — keep `index.tsx` free of long JSX. */
export function Ex04Header() {
  return (
    <LabHeader
      ex="ex04"
      focus="RGB LED"
      title="Send a color to the board"
      description="First host → board command: open the USB port, wait for settle, then set the RGB LED. Needs the es3c28p board (ws28p has no LED)."
    />
  );
}
