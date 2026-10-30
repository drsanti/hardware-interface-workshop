import { BatteryCard } from "@/components/BatteryCard";
import { ClassifyCard } from "@/components/ClassifyCard";
import { KeyEventCard } from "@/components/KeyEventCard";
import { MicControlCard } from "@/components/MicControlCard";
import { SenseApplianceCard } from "@/components/SenseApplianceCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSenseAppliance } from "@/hooks/useSenseAppliance";

import { Ex34Header } from "./Ex34Header";

/**
 * Ex34 — Capstone appliance: classify + button + battery → actuators.
 */
export function Ex34SenseAppliance() {
  const app = useSenseAppliance();

  return (
    <LabPage width="lg">
      <Ex34Header />
      <SerialPortCard {...app} serialOnly />
      {/* ── FOCUS: mode + mappings ───────────────────────────────────── */}
      <SenseApplianceCard
        reacting={app.reacting}
        ledSupported={app.ledSupported}
        sfxSupported={app.sfxSupported}
        btnSupported={app.btnSupported}
        battLow={app.battLow}
        battWarnBelow={app.battWarnBelow}
        lastAction={app.lastAction}
        onReacting={app.setReacting}
      />
      <MicControlCard
        micSupported={app.micSupported}
        ready={app.ready}
        portOpen={app.status === "open"}
        enabled={app.enabled}
        muted={app.muted}
        streaming={app.streaming}
        gainPct={app.gainPct}
        level={app.level}
        waveform={app.waveform}
        micMessage={app.micMessage}
        // ── FOCUS: Stream PCM feeds the classifier ───────────────────
        features={{ vu: true, stream: true }}
        onEnable={(on) => void app.enable(on)}
        onMute={(on) => void app.setMute(on)}
        onStream={(on) => void app.setStream(on)}
        onGain={app.setGainPct}
        onApplyGain={() => void app.applyGain()}
      />
      <ClassifyCard
        features={app.features}
        label={app.label}
        scores={app.scores}
        mode={app.mode}
        counts={app.counts}
        streaming={app.streaming}
        classifyReady={app.classifyReady}
        micSupported={app.micSupported}
        classifyMessage={app.classifyMessage}
        onMark={app.mark}
        onClearTraining={app.clearTraining}
      />
      {/* ── FOCUS: BOOT overrides React / emergency stop ─────────────── */}
      <KeyEventCard
        btnSupported={app.btnSupported}
        ready={app.ready}
        portOpen={app.status === "open"}
        last={app.lastKey}
        events={app.keyEvents}
        keyMessage={
          app.status !== "open"
            ? null
            : "SHORT=toggle React · DOUBLE=Chime · LONG=Stop"
        }
        actionHint={app.keyHint}
        onClear={app.clearKeys}
      />
      {/* ── FOCUS: low batt mutes SFX ────────────────────────────────── */}
      <BatteryCard
        battSupported={app.battSupported}
        ready={app.ready}
        portOpen={app.status === "open"}
        battery={app.battery}
        updatedAt={app.battUpdatedAt}
        battMessage={
          app.battLow
            ? `≤${app.battWarnBelow}% — SFX muted.`
            : app.battery
              ? "Battery ok — SFX allowed."
              : "Waiting for BatteryStatus (~10 s)…"
        }
        warnBelow={app.battWarnBelow}
      />
    </LabPage>
  );
}
