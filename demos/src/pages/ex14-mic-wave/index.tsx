import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMic } from "@/hooks/useMic";

import { Ex14Header } from "./Ex14Header";

/**
 * Ex14 — Mic waveform.
 *
 * Stream PCM samples (MicPcm) from the board and draw a simple wave.
 * Start stream after Enable; stop stream before disconnecting.
 */
export function Ex14MicWave() {
  const mic = useMic();

  return (
    <LabPage width="lg">
      <Ex14Header />
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
        // ── FOCUS: Stream on → MicPcm fills `waveform` ────────────────
        // VU still useful as a quick level check beside the canvas.
        features={{ vu: true, wave: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)} // ← start/stop PCM
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
    </LabPage>
  );
}
