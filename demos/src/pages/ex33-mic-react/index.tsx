import { ClassifyCard } from "@/components/ClassifyCard";
import { MicControlCard } from "@/components/MicControlCard";
import { ReactCard } from "@/components/ReactCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicReact } from "@/hooks/useMicReact";

import { Ex33Header } from "./Ex33Header";

/**
 * Ex33 — Capstone: classify MicPcm → board LED / SFX.
 */
export function Ex33MicReact() {
  const mic = useMicReact();

  return (
    <LabPage width="lg">
      <Ex33Header />
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
        // ── FOCUS: Stream PCM feeds the classifier ───────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: enable reactions + mapping ────────────────────────── */}
      <ReactCard
        reacting={mic.reacting}
        ledSupported={mic.ledSupported}
        sfxSupported={mic.sfxSupported}
        lastAction={mic.lastAction}
        onReacting={mic.setReacting}
      />
      {/* ── FOCUS: live class + optional k-NN marks ──────────────────── */}
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
