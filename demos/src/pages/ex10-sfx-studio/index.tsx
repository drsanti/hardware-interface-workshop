import { SerialPortCard } from "@/components/SerialPortCard";
import { SfxStudioCard } from "@/components/sfx/SfxStudioCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSfx } from "@/hooks/useSfx";

import { Ex10Header } from "./Ex10Header";

/**
 * Ex10 — SFX studio.
 *
 * Only lab that mounts the full studio card (presets + volume/loops +
 * live knobs + upload/play user). Earlier labs use focused cards instead.
 */
export function Ex10SfxStudio() {
  const sfx = useSfx();

  return (
    <LabPage width="lg">
      <Ex10Header />
      <SerialPortCard
        {...sfx}
      />
      {/* ── FOCUS: compose ex06–ex09 tools in one studio ─────────────── */}
      <SfxStudioCard
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
        onMasterVolume={(v) => void sfx.setMasterVolume(v)}
        onEchoMix={(v) => void sfx.setEchoMix(v)}
        onReleaseMs={(v) => void sfx.setReleaseMs(v)}
        onUploadMelody={() => void sfx.uploadMelody()}
        onPlayUser={() => void sfx.playUser()}
      />
    </LabPage>
  );
}
