import { Repeat2 } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import {
  SfxGate,
  SfxPresetGrid,
  SfxSlider,
  SfxStatus,
  SfxStopButton,
  isStopActive,
} from "@/components/sfx/SfxParts";
import { SFX_PLAY_PRESETS, SFX_SIREN_PRESETS } from "@/lib/wire/sfx";

type Props = {
  ready: boolean;
  portOpen: boolean;
  volume: number;
  loops: number;
  lastPreset: number | null;
  sfxMessage: string | null;
  onVolume: (v: number) => void;
  onLoops: (n: number) => void;
  onPlay: (preset: number) => void;
  onStop: () => void;
};

/**
 * ex07 — volume + loops.
 * Sliders are the hero; presets are a short list for trying loop counts.
 */
export function SfxVolumeCard({
  ready,
  portOpen,
  volume,
  loops,
  lastPreset,
  sfxMessage,
  onVolume,
  onLoops,
  onPlay,
  onStop,
}: Props) {
  const live = portOpen && ready;

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Repeat2 className="size-4 text-serial" aria-hidden />
        Volume & loops
      </div>

      <SfxGate
        portOpen={portOpen}
        ready={ready}
        idleHint="Set Volume / Loops, then play — values ride with the next SfxCmd."
      >
        <div className="space-y-4 rounded-md border border-serial/25 bg-serial/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-serial">
            Packed into the next play
          </p>
          <SfxSlider
            label="Volume"
            value={volume}
            display={String(volume)}
            min={1}
            max={100}
            onChange={onVolume}
          />
          <SfxSlider
            label="Loops"
            value={loops}
            display={loops === 0 ? "def" : String(loops)}
            min={0}
            max={8}
            onChange={onLoops}
          />
          <p className="text-[11px] text-muted">
            0 = board default (sirens keep going until Stop). Try 2–3 on Alarm.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            One-shots
          </p>
          <SfxPresetGrid
            presets={SFX_PLAY_PRESETS}
            cols={3}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Sirens — raise Loops or leave 0, then Stop
          </p>
          <SfxPresetGrid
            presets={SFX_SIREN_PRESETS}
            cols={3}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
        </div>

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
