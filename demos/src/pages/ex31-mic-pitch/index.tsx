import { MicControlCard } from "@/components/MicControlCard";
import { PitchCard } from "@/components/PitchCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicPitch } from "@/hooks/useMicPitch";

import { Ex31Header } from "./Ex31Header";

/**
 * Ex31 — Live YIN pitch from MicPcm.
 */
export function Ex31MicPitch() {
  const mic = useMicPitch();

  return (
    <LabPage width="lg">
      <Ex31Header />
      <SerialPortCard {...mic} serialOnly />
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
        // ── FOCUS: Stream PCM → YIN ──────────────────────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: note / Hz / cents ─────────────────────────────────── */}
      <PitchCard
        pitch={mic.pitch}
        hzHistory={mic.hzHistory}
        sampleRate={mic.sampleRate}
        streaming={mic.streaming}
        pitchReady={mic.pitchReady}
        micSupported={mic.micSupported}
      />
    </LabPage>
  );
}
