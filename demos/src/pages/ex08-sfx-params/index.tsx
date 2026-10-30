import { SerialPortCard } from "@/components/SerialPortCard";
import { SfxParamsCard } from "@/components/sfx/SfxParamsCard";
import { SfxParamsInfo } from "@/components/SfxParamsInfo";
import { LabPage } from "@/components/lab/LabPage";
import { useSfx } from "@/hooks/useSfx";

import { Ex08Header } from "./Ex08Header";

/**
 * Ex08 — SFX live params.
 *
 * Start one loop, then drag Master / Echo / Release (SfxParam). No preset
 * wall, volume/loops, or upload — those belong to other labs.
 */
export function Ex08SfxParams() {
  const sfx = useSfx();

  return (
    <LabPage width="lg">
      <Ex08Header />
      <SerialPortCard
        {...sfx}
      />
      {/* ── FOCUS: live SfxParam knobs while a loop runs ─────────────── */}
      <SfxParamsCard
        ready={sfx.ready}
        portOpen={sfx.status === "open"}
        lastPreset={sfx.lastPreset}
        sfxMessage={sfx.sfxMessage}
        onPlay={(preset) => void sfx.play(preset)}
        onStop={() => void sfx.stop()}
        onMasterVolume={(v) => void sfx.setMasterVolume(v)}
        onEchoMix={(v) => void sfx.setEchoMix(v)}
        onReleaseMs={(v) => void sfx.setReleaseMs(v)}
      />
      <SfxParamsInfo />
    </LabPage>
  );
}
