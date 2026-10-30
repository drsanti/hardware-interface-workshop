import { SerialPortCard } from "@/components/SerialPortCard";
import { SfxMelodyCard } from "@/components/sfx/SfxMelodyCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSfx } from "@/hooks/useSfx";

import { Ex09Header } from "./Ex09Header";

/**
 * Ex09 — SFX melody (user slot).
 *
 * Two-step UI: Upload (SfxProg) then Play user slot (SfxCmd preset 3).
 * Chime is only for A/B compare — no sirens / params / loops.
 */
export function Ex09SfxMelody() {
  const sfx = useSfx();

  return (
    <LabPage width="lg">
      <Ex09Header />
      <SerialPortCard
        {...sfx}
      />
      {/* ── FOCUS: Upload (store) → Play user slot (preset 3) ────────── */}
      <SfxMelodyCard
        ready={sfx.ready}
        portOpen={sfx.status === "open"}
        volume={sfx.volume}
        lastPreset={sfx.lastPreset}
        sfxMessage={sfx.sfxMessage}
        onVolume={sfx.setVolume}
        onPlay={(preset) => void sfx.play(preset)}
        onStop={() => void sfx.stop()}
        onUploadMelody={() => void sfx.uploadMelody()}
        onPlayUser={() => void sfx.playUser()}
      />
    </LabPage>
  );
}
