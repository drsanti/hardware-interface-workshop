import { SerialPortCard } from "@/components/SerialPortCard";
import { SfxVolumeCard } from "@/components/sfx/SfxVolumeCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSfx } from "@/hooks/useSfx";

import { Ex07Header } from "./Ex07Header";

/**
 * Ex07 — SFX volume + loops.
 *
 * Sliders are the lesson; presets are only enough to try loop counts.
 * No live knobs, machines, or upload UI.
 */
export function Ex07SfxVolume() {
  const sfx = useSfx();

  return (
    <LabPage width="lg">
      <Ex07Header />
      <SerialPortCard
        {...sfx}
      />
      {/* ── FOCUS: Volume + Loops packed into the next SfxCmd play ───── */}
      <SfxVolumeCard
        ready={sfx.ready}
        portOpen={sfx.status === "open"}
        volume={sfx.volume}
        loops={sfx.loops}
        lastPreset={sfx.lastPreset}
        sfxMessage={sfx.sfxMessage}
        onVolume={sfx.setVolume}
        onLoops={sfx.setLoops}
        onPlay={(preset) => void sfx.play(preset)}
        onStop={() => void sfx.stop()}
      />
    </LabPage>
  );
}
