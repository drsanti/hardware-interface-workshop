import { RtcCard } from "@/components/RtcCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useRtc } from "@/hooks/useRtc";

import { Ex22Header } from "./Ex22Header";

/**
 * Ex22 — RTC / TimeSync.
 *
 * ── FOCUS: encode TimeSync → CmdAck; read BoardInfo unix_ns.
 */
export function Ex22RtcSync() {
  const rtc = useRtc();

  return (
    <LabPage width="lg">
      <Ex22Header />
      <SerialPortCard
        {...rtc}
      />
      <RtcCard
        rtcSupported={rtc.rtcSupported}
        ready={rtc.ready}
        portOpen={rtc.status === "open"}
        info={rtc.info}
        rtcMessage={rtc.rtcMessage}
        onSync={() => void rtc.syncNow()}
      />
    </LabPage>
  );
}
