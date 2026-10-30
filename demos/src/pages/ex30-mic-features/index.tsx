import { FeaturesCard } from "@/components/FeaturesCard";
import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicFeatures } from "@/hooks/useMicFeatures";

import { Ex30Header } from "./Ex30Header";

/**
 * Ex30 — Live MIR features from MicPcm.
 */
export function Ex30MicFeatures() {
  const mic = useMicFeatures();

  return (
    <LabPage width="lg">
      <Ex30Header />
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
        // ── FOCUS: Stream PCM → feature tap ──────────────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: meters + sparklines ───────────────────────────────── */}
      <FeaturesCard
        features={mic.features}
        centroidHistory={mic.centroidHistory}
        rmsHistory={mic.rmsHistory}
        sampleRate={mic.sampleRate}
        streaming={mic.streaming}
        featuresReady={mic.featuresReady}
        micSupported={mic.micSupported}
      />
    </LabPage>
  );
}
