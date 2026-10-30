import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMic } from "@/hooks/useMic";

import { Ex15Header } from "./Ex15Header";

/**
 * Ex15 — Mic studio.
 *
 * Same `useMic` + `MicControlCard` as ex11–ex14. The only lab-specific
 * change is turning **every** feature flag on (see FOCUS below).
 */
export function Ex15MicStudio() {
  const mic = useMic();

  return (
    <LabPage width="lg">
      <Ex15Header />
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
        // ── FOCUS: all prior mic labs in one card ─────────────────────
        // ex11 hello → enable / mute always on
        // ex12 vu    → vu
        // ex13 gain  → gain (+ Apply)
        // ex14 wave  → wave (+ Stream)
        // Toggle any flag to `false` to hide that UI section.
        features={{ vu: true, gain: true, wave: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)} // MicCmd stream
        onGain={mic.setGainPct} // UI only
        onApplyGain={() => void mic.applyGain()} // MicCmd gain
      />
    </LabPage>
  );
}
