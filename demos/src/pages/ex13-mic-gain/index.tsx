import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMic } from "@/hooks/useMic";

import { Ex13Header } from "./Ex13Header";

/**
 * Ex13 — Mic gain.
 *
 * Drag the gain slider (local UI state), then Apply to send MicCmd gain.
 * VU stays on so you can see the level change after Apply.
 */
export function Ex13MicGain() {
  const mic = useMic();

  return (
    <LabPage width="lg">
      <Ex13Header />
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
        // ── FOCUS: slider is local; Apply sends MicCmd gain ───────────
        // Workflow: Enable → drag gain → Apply → watch VU react.
        features={{ vu: true, gain: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct} // ← UI only
        onApplyGain={() => void mic.applyGain()} // ← MicCmd
      />
    </LabPage>
  );
}
