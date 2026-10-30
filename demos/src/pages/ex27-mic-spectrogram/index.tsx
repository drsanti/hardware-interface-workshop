import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { SpectrogramCard } from "@/components/SpectrogramCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicSpectrogram } from "@/hooks/useMicSpectrogram";

import { Ex27Header } from "./Ex27Header";

/**
 * Ex27 — Mic spectrogram.
 *
 * Hopped FFT columns scroll left→right so you see time×frequency energy.
 */
export function Ex27MicSpectrogram() {
  const mic = useMicSpectrogram();

  return (
    <LabPage width="lg">
      <Ex27Header />
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
        // ── FOCUS: Stream PCM → spectrogram hop columns ──────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: time×freq canvas (right = newest) ─────────────────── */}
      <SpectrogramCard
        column={mic.column}
        columnSeq={mic.columnSeq}
        binCount={mic.binCount}
        sampleRate={mic.sampleRate}
        streaming={mic.streaming}
        fftReady={mic.fftReady}
        micSupported={mic.micSupported}
      />
    </LabPage>
  );
}
