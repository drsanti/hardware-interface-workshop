import { Disc3, Upload } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import {
  SfxGate,
  SfxPresetGrid,
  SfxSlider,
  SfxStatus,
  SfxStopButton,
  isStopActive,
} from "@/components/sfx/SfxParts";
import { cn } from "@/lib/cn";
import {
  SFX_CHIRP_PRESETS,
  SFX_MACHINE_PRESETS,
  SFX_PLAY_PRESETS,
  SFX_PRESET,
  SFX_SIREN_PRESETS,
} from "@/lib/wire/sfx";

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
  onMasterVolume: (v: number) => void;
  onEchoMix: (v: number) => void;
  onReleaseMs: (v: number) => void;
  onUploadMelody: () => void;
  onPlayUser: () => void;
};

/**
 * ex10 — full studio.
 * Only lab that composes play + volume/loops + live knobs + user melody.
 */
export function SfxStudioCard({
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
  onMasterVolume,
  onEchoMix,
  onReleaseMs,
  onUploadMelody,
  onPlayUser,
}: Props) {
  const live = portOpen && ready;

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Disc3 className="size-4 text-serial" aria-hidden />
        Sound studio
      </div>

      <SfxGate
        portOpen={portOpen}
        ready={ready}
        idleHint="All SFX tools from ex06–ex09 on one page."
      >
        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Presets</h3>
          <SfxPresetGrid
            presets={SFX_PLAY_PRESETS}
            cols={3}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
          <SfxPresetGrid
            presets={SFX_CHIRP_PRESETS}
            cols={2}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
          <SfxPresetGrid
            presets={SFX_SIREN_PRESETS}
            cols={3}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
          <SfxPresetGrid
            presets={SFX_MACHINE_PRESETS}
            cols={2}
            lastPreset={lastPreset}
            onPlay={onPlay}
          />
        </section>

        <section className="space-y-3 rounded-md border border-line p-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
            Next play (SfxCmd)
          </h3>
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
        </section>

        <section className="space-y-3 rounded-md border border-line p-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
            Live (SfxParam)
          </h3>
          <label className="grid grid-cols-[5rem_1fr] items-center gap-3">
            <span className="text-xs text-muted">Master %</span>
            <input
              type="range"
              min={1}
              max={100}
              defaultValue={volume}
              onChange={(e) => onMasterVolume(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#a371f7" }}
            />
          </label>
          <label className="grid grid-cols-[5rem_1fr] items-center gap-3">
            <span className="text-xs text-muted">Echo mix</span>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={30}
              onChange={(e) => onEchoMix(Number(e.target.value) / 100)}
              className="w-full"
              style={{ accentColor: "#a371f7" }}
            />
          </label>
          <label className="grid grid-cols-[5rem_1fr] items-center gap-3">
            <span className="text-xs text-muted">Release</span>
            <input
              type="range"
              min={20}
              max={800}
              defaultValue={120}
              onChange={(e) => onReleaseMs(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#a371f7" }}
            />
          </label>
        </section>

        <section className="flex flex-wrap justify-center gap-2">
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
          <button
            type="button"
            onClick={onPlayUser}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              lastPreset === SFX_PRESET.USER
                ? "border-serial/60 bg-serial/10 text-white"
                : "border-line text-muted hover:border-muted hover:text-white",
            )}
          >
            Play user slot
          </button>
        </section>

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
