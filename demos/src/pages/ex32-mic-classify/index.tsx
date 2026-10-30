import { ClassifyCard } from "@/components/ClassifyCard";
import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicClassify } from "@/hooks/useMicClassify";

import { Ex32Header } from "./Ex32Header";

/**
 * Ex32 — Sound class from MicPcm features (baseline + k-NN).
 */
export function Ex32MicClassify() {
  const mic = useMicClassify();

  return (
    <LabPage width="lg">
      <Ex32Header />
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
        // ── FOCUS: Stream → feature vector → class ───────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: predict + mark exemplars ──────────────────────────── */}
      <ClassifyCard
        features={mic.features}
        label={mic.label}
        scores={mic.scores}
        mode={mic.mode}
        counts={mic.counts}
        streaming={mic.streaming}
        classifyReady={mic.classifyReady}
        micSupported={mic.micSupported}
        classifyMessage={mic.classifyMessage}
        onMark={mic.mark}
        onClearTraining={mic.clearTraining}
      />
    </LabPage>
  );
}
