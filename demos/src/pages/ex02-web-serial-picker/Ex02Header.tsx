import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex02 — keep `index.tsx` free of long JSX. */
export function Ex02Header() {
  return (
    <LabHeader
      ex="ex02"
      focus="USB or Bluetooth link"
      title="Claim a board link"
      description="Open the board over USB Serial or Web Bluetooth. This lab only connects and disconnects — no board messages yet."
    />
  );
}
