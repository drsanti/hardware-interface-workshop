import { FftSpectrumCard } from "@/components/FftSpectrumCard";
import { FilterCard } from "@/components/FilterCard";
import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicFilter } from "@/hooks/useMicFilter";

import { Ex29Header } from "./Ex29Header";

/**
 * Ex29 — Live MicPcm biquad filter.
 *
 * Wet path → FFT (+ optional speaker monitor).
 */
export function Ex29MicFilter() {
  const mic = useMicFilter();

  return (
    <LabPage width="lg">
      <Ex29Header />
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
        // ── FOCUS: Stream feeds the biquad ───────────────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: filter type / cutoff / Q / monitor ───────────────── */}
      <FilterCard
        micSupported={mic.micSupported}
        ready={mic.ready}
        portOpen={mic.status === "open"}
        streaming={mic.streaming}
        filterKind={mic.filterKind}
        cutoffHz={mic.cutoffHz}
        q={mic.q}
        monitor={mic.monitor}
        volume={mic.volume}
        filterMessage={mic.filterMessage}
        onKind={mic.setFilterKind}
        onCutoff={mic.setCutoffHz}
        onQ={mic.setQ}
        onMonitor={(on) => void mic.setMonitor(on)}
        onVolume={mic.setVolume}
      />
      {/* ── FOCUS: FFT of wet (filtered) signal ─────────────────────── */}
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
