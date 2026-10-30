import { MicControlCard } from "@/components/MicControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMic } from "@/hooks/useMic";

import { Ex12Header } from "./Ex12Header";

/**
 * Ex12 — Mic VU meter.
 *
 * Same enable/mute as ex11, plus a live level bar fed by AudioLevel
 * frames from the board while the mic is on.
 */
export function Ex12MicVu() {
  const mic = useMic();

  return (
    <LabPage width="lg">
      <Ex12Header />
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
        // ── FOCUS: live AudioLevel → VU bar (`level` prop) ────────────
        // Enable mic, speak near the board, watch the bar move.
        features={{ vu: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
    </LabPage>
  );
}
