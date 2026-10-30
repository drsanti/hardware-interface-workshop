import { Volume2 } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import {
  SfxGate,
  SfxPresetGrid,
  SfxSlider,
  SfxStatus,
  SfxStopButton,
  isStopActive,
} from "@/components/sfx/SfxParts";
import { SFX_CHIRP_PRESETS, SFX_PLAY_PRESETS } from "@/lib/wire/sfx";

type Props = {
  ready: boolean;
  portOpen: boolean;
  volume: number;
  lastPreset: number | null;
  sfxMessage: string | null;
  onVolume: (v: number) => void;
  onPlay: (preset: number) => void;
  onStop: () => void;
};

/**
 * ex06 — play only.
 * Big one-shot pads + chirp pair. No loops, params, sirens, or upload.
 */
export function SfxPlayCard({
  ready,
  portOpen,
  volume,
  lastPreset,
  sfxMessage,
  onVolume,
  onPlay,
  onStop,
}: Props) {
  const live = portOpen && ready;

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Volume2 className="size-4 text-serial" aria-hidden />
        Tap a sound
      </div>

      <SfxGate portOpen={portOpen} ready={ready} idleHint="Then tap a pad to hear SfxCmd.">
        <SfxPresetGrid
          presets={SFX_PLAY_PRESETS}
          cols={3}
          lastPreset={lastPreset}
          onPlay={onPlay}
          size="lg"
        />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Chirp pair (same notes, opposite order)
          </p>
          <SfxPresetGrid
            presets={SFX_CHIRP_PRESETS}
            cols={2}
            lastPreset={lastPreset}
            onPlay={onPlay}
            size="lg"
          />
        </div>

        <SfxSlider
          label="Volume"
          value={volume}
          display={String(volume)}
          min={1}
          max={100}
          onChange={onVolume}
        />

        <div className="flex justify-center">
          <SfxStopButton
            active={isStopActive(lastPreset)}
            disabled={!live}
            onStop={onStop}
            className="w-36"
          />
        </div>
      </SfxGate>

      <SfxStatus message={sfxMessage} />
    </Panel>
  );
}
