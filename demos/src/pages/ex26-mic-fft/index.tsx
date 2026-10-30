import { FftSpectrumCard } from "@/components/FftSpectrumCard";
import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicFft } from "@/hooks/useMicFft";

import { Ex26Header } from "./Ex26Header";

/**
 * Ex26 — Mic FFT.
 *
 * MicPcm chunks feed an in-process FFT → bar spectrum.
 * First audio-analysis lab after the mic strip (ex11–ex15).
 */
export function Ex26MicFft() {
  const mic = useMicFft();

  return (
    <LabPage width="lg">
      <Ex26Header />
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
        // ── FOCUS: Stream PCM → FFT card (VU for level check) ────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)} // ← starts FFT bridge
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: AnalyserNode byte-frequency bars ──────────────────── */}
      <FftSpectrumCard
        spectrum={mic.spectrum}
        peakHz={mic.peakHz}
        sampleRate={mic.sampleRate}
        streaming={mic.streaming}
        fftReady={mic.fftReady}
        micSupported={mic.micSupported}
      />
    </LabPage>
  );
}
