import { LabHeader } from "@/components/lab/LabHeader";

export function Ex22Header() {
  return (
    <LabHeader
      ex="ex22"
      focus="RTC / TimeSync"
      title="Sync the board clock"
      description="Send TimeSync (0x8b) with the browser’s Unix time. BoardInfo shows unix_ns + synced. Hardware persist needs ws28p (CAP.RTC)."
    />
  );
}
