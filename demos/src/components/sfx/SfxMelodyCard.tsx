import { Music2, Upload } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import {
  SfxGate,
  SfxPresetButton,
  SfxSlider,
  SfxStatus,
  SfxStopButton,
  isStopActive,
} from "@/components/sfx/SfxParts";
import { cn } from "@/lib/cn";
import { SFX_PLAY_PRESETS, SFX_PRESET } from "@/lib/wire/sfx";

type Props = {
  ready: boolean;
  portOpen: boolean;
  volume: number;
  lastPreset: number | null;
  sfxMessage: string | null;
  onVolume: (v: number) => void;
  onPlay: (preset: number) => void;
  onStop: () => void;
  onUploadMelody: () => void;
  onPlayUser: () => void;
};

const CHIME = SFX_PLAY_PRESETS.find((p) => p.id === SFX_PRESET.CHIME)!;

/**
 * ex09 — upload / play user slot.
 * Two-step workflow; Chime is only for A/B compare — no siren grid.
 */
export function SfxMelodyCard({
  ready,
  portOpen,
  volume,
  lastPreset,
  sfxMessage,
  onVolume,
  onPlay,
  onStop,
  onUploadMelody,
  onPlayUser,
}: Props) {
  const live = portOpen && ready;

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Music2 className="size-4 text-serial" aria-hidden />
        Custom melody
      </div>

      <SfxGate
        portOpen={portOpen}
        ready={ready}
        idleHint="Upload stores notes in slot 3; Play user runs that slot."
      >
        <ol className="space-y-3">
          <li className="rounded-md border border-line p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-serial">
              Step 1 — store
            </p>
            <p className="mb-3 text-sm text-muted">
              Sends <span className="font-mono text-xs">SfxProg</span> into board slot 3.
              No sound yet.
            </p>
            <button
              type="button"
              onClick={onUploadMelody}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm",
                "text-muted hover:border-muted hover:text-white",
              )}
            >
              <Upload className="size-4" aria-hidden />
              Upload melody
            </button>
          </li>

          <li className="rounded-md border border-line p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-serial">
              Step 2 — play slot 3
            </p>
            <p className="mb-3 text-sm text-muted">
              Should sound different from built-in Chime.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onPlayUser}
                className={cn(
                  "rounded-md border px-3 py-4 text-left text-sm",
                  lastPreset === SFX_PRESET.USER
                    ? "border-serial/60 bg-serial/10 text-white"
                    : "border-line text-muted hover:border-muted hover:text-white",
                )}
              >
                <div className="font-medium text-inherit">Play user slot</div>
                <div className="text-[11px] text-muted">preset 3 via SfxCmd</div>
              </button>
              <SfxPresetButton
                preset={{ ...CHIME, detail: "Built-in compare" }}
                selected={lastPreset === SFX_PRESET.CHIME}
                onPlay={onPlay}
                size="lg"
              />
            </div>
          </li>
        </ol>

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
