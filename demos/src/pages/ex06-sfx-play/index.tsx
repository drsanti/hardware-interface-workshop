import { SerialPortCard } from "@/components/SerialPortCard";
import { SfxPlayCard } from "@/components/sfx/SfxPlayCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSfx } from "@/hooks/useSfx";

import { Ex06Header } from "./Ex06Header";

/**
 * Ex06 — SFX play.
 *
 * First speaker lab: pick a built-in preset and hear it. Only play pads,
 * chirps, a safety volume, and Stop — no loops / params / upload.
 */
export function Ex06SfxPlay() {
  const sfx = useSfx();

  return (
    <LabPage width="lg">
      <Ex06Header />
      <SerialPortCard
        {...sfx}
      />
      {/* ── FOCUS: SfxPlayCard — tap pads → SfxCmd play / stop ───────── */}
      <SfxPlayCard
        ready={sfx.ready}
        portOpen={sfx.status === "open"}
        volume={sfx.volume}
        lastPreset={sfx.lastPreset}
        sfxMessage={sfx.sfxMessage}
        onVolume={sfx.setVolume}
        onPlay={(preset) => void sfx.play(preset)}
        onStop={() => void sfx.stop()}
      />
    </LabPage>
  );
}
