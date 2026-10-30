import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import {
  SfxGate,
  SfxSlider,
  SfxStatus,
  SfxStopButton,
  isStopActive,
} from "@/components/sfx/SfxParts";
import { SFX_PRESET, SFX_SIREN_PRESETS } from "@/lib/wire/sfx";

type Props = {
  ready: boolean;
  portOpen: boolean;
  lastPreset: number | null;
  sfxMessage: string | null;
  onPlay: (preset: number) => void;
  onStop: () => void;
  onMasterVolume: (v: number) => void;
  onEchoMix: (v: number) => void;
  onReleaseMs: (v: number) => void;
};

/**
 * ex08 — live SfxParam knobs.
 * Start one looping source, then tweak Master / Echo / Release — no preset wall.
 */
export function SfxParamsCard({
  ready,
  portOpen,
  lastPreset,
  sfxMessage,
  onPlay,
  onStop,
  onMasterVolume,
  onEchoMix,
  onReleaseMs,
}: Props) {
  const live = portOpen && ready;
  const [master, setMaster] = useState(15);
  const [echo, setEcho] = useState(30);
  const [release, setRelease] = useState(120);
  const [source, setSource] = useState<number>(SFX_PRESET.ALARM);

  const looping =
    lastPreset != null &&
    lastPreset !== SFX_PRESET.STOP &&
    (lastPreset === SFX_PRESET.ALARM ||
      SFX_SIREN_PRESETS.some((p) => p.id === lastPreset));

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4 text-serial" aria-hidden />
        Live knobs
      </div>

      <SfxGate
        portOpen={portOpen}
        ready={ready}
        idleHint="Start a loop, then drag the knobs — sound changes without re-play."
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-muted">
            Loop source
            <select
              value={source}
              onChange={(e) => setSource(Number(e.target.value))}
              className="rounded-md border border-line bg-panel px-2 py-2 text-sm text-white"
            >
              <option value={SFX_PRESET.ALARM}>Alarm</option>
              {SFX_SIREN_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => onPlay(source)}
            className="rounded-md border border-serial/50 bg-serial/15 px-4 py-2 text-sm text-white hover:bg-serial/25"
          >
            Start loop
          </button>
          <SfxStopButton
            active={isStopActive(lastPreset)}
            disabled={!live}
            onStop={onStop}
          />
        </div>

        <p className="text-[11px] text-muted">
          {looping
            ? "Loop running — drag knobs below (SfxParam)."
            : "No loop yet — press Start loop first."}
        </p>

        <div className="space-y-4 rounded-md border border-line p-4">
          <SfxSlider
            label="Master %"
            value={master}
            display={`${master}`}
            min={1}
            max={100}
            onChange={(v) => {
              setMaster(v);
              onMasterVolume(v);
            }}
          />
          <SfxSlider
            label="Echo mix"
            value={echo}
            display={`${echo}%`}
            min={0}
            max={100}
            onChange={(v) => {
              setEcho(v);
              onEchoMix(v / 100);
            }}
          />
          <SfxSlider
            label="Release"
            value={release}
            display={`${release} ms`}
            min={20}
            max={800}
            onChange={(v) => {
              setRelease(v);
              onReleaseMs(v);
            }}
          />
        </div>
      </SfxGate>

      <SfxStatus message={sfxMessage} />
    </Panel>
  );
}
