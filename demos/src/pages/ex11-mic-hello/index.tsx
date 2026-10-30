import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMic } from "@/hooks/useMic";

import { Ex11Header } from "./Ex11Header";

/**
 * Ex11 — Mic hello.
 *
 * First mic lab: enable the board mic path and mute/unmute. VU / gain /
 * waveform stay hidden (`features={{}}`) until later labs.
 */
export function Ex11MicHello() {
  const mic = useMic();

  return (
    <LabPage width="lg">
      <Ex11Header />
      <SerialPortCard
        {...mic}
        serialOnly
      />
      <MicControlCard
        micSupported={mic.micSupported}
        ready={mic.ready}
        portOpen={mic.status === "open"}
        enabled={mic.enabled}
        muted={mic.muted}
        streaming={mic.streaming}
        gainPct={mic.gainPct}
        level={mic.level}
        waveform={mic.waveform}
        micMessage={mic.micMessage}
        // ── FOCUS: enable + mute only ─────────────────────────────────
        // Empty features = no VU / gain / wave UI yet.
        // Board must advertise CAP.MIC or controls stay disabled.
        features={{}}
        onEnable={(on) => void mic.enable(on)} // ← MicCmd enable
        onMute={(on) => void mic.setMute(on)} // ← MicCmd mute
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
    </LabPage>
  );
}
