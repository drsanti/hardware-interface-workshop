import type { CSSProperties } from "react";
import { Lightbulb, Power, Sparkles } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import type { LedStudioMode } from "@/hooks/useLedStudio";
import { cn } from "@/lib/cn";
import {
  LED_FX_PRESETS,
  LED_STUDIO_COLORS,
  type LedFxPresetId,
  type Rgb,
} from "@/lib/wire/led";

type Props = {
  ledSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  rgb: Rgb;
  commanded: Rgb | null;
  echoed: Rgb | null;
  mode: LedStudioMode | null;
  ledMessage: string | null;
  onChannel: (channel: keyof Rgb, value: number) => void;
  onSolidPreset: (rgb: Rgb) => void;
  onFx: (id: LedFxPresetId) => void;
  onOff: () => void;
};

function swatchStyle(rgb: Rgb): CSSProperties {
  return { backgroundColor: `rgb(${rgb.r} ${rgb.g} ${rgb.b})` };
}

const CHANNELS: Array<{ key: keyof Rgb; label: string; accent: string }> = [
  { key: "r", label: "Red", accent: "#f85149" },
  { key: "g", label: "Green", accent: "#3fb950" },
  { key: "b", label: "Blue", accent: "#58a6ff" },
];

/** RGB sliders + solid swatches + LedFx motion presets (ex05). */
export function LedStudioCard({
  ledSupported,
  ready,
  portOpen,
  rgb,
  commanded,
  echoed,
  mode,
  ledMessage,
  onChannel,
  onSolidPreset,
  onFx,
  onOff,
}: Props) {
  const isOff = mode === "off";
  const preview = echoed ?? commanded ?? rgb;

  return (
    <Panel className={ledSupported ? "border-accent/30" : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lightbulb
          className={cn("size-4", isOff ? "text-muted" : "text-accent")}
          aria-hidden
        />
        LED studio
      </div>

      {!ledSupported ? (
        <p className="text-sm text-muted">
          This board target has no RGB LED. Set{" "}
          <span className="font-mono text-xs text-serial">WORKSHOP_BOARD_ID</span> to{" "}
          <span className="font-mono text-xs text-serial">es3c28p</span> and flash that image.
        </p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first, then mix a color.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 py-2">
            <div
              className={cn(
                "size-20 rounded-full border shadow-inner transition-colors",
                isOff
                  ? "border-line/50 bg-line opacity-45"
                  : "border-line",
              )}
              style={isOff ? undefined : swatchStyle(preview)}
              title={isOff ? "LED off" : "Board / commanded color"}
            />
          </div>

          <div className="space-y-3">
            {CHANNELS.map((ch) => (
              <label key={ch.key} className="grid grid-cols-[3.5rem_1fr_2.75rem] items-center gap-3">
                <span className="text-xs font-medium text-muted">{ch.label}</span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={rgb[ch.key]}
                  onChange={(e) => onChannel(ch.key, Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: ch.accent }}
                  aria-label={`${ch.label} channel`}
                />
                <span className="font-mono text-xs tabular-nums text-muted">{rgb[ch.key]}</span>
              </label>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Solid presets
            </p>
            <div className="grid grid-cols-4 gap-2">
              {LED_STUDIO_COLORS.map((preset) => {
                const active =
                  mode === "solid" &&
                  commanded?.r === preset.rgb.r &&
                  commanded?.g === preset.rgb.g &&
                  commanded?.b === preset.rgb.b;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSolidPreset(preset.rgb)}
                    className={cn(
                      "inline-flex flex-col items-center gap-1.5 rounded-md border px-2 py-2",
                      "text-[11px] font-medium text-muted hover:border-muted hover:text-white",
                      active ? "border-accent/60 bg-accent/10 text-white" : "border-line",
                    )}
                  >
                    <span
                      className="size-5 rounded-full border border-line"
                      style={swatchStyle(preset.rgb)}
                      aria-hidden
                    />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <Sparkles className="size-3.5" aria-hidden />
              Motion presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LED_FX_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onFx(preset.id)}
                  className={cn(
                    "rounded-md border px-2 py-3 text-left",
                    "hover:border-muted hover:text-white",
                    mode === preset.id
                      ? "border-serial/60 bg-serial/10 text-white"
                      : "border-line text-muted",
                  )}
                >
                  <div className="text-sm font-medium text-inherit">{preset.label}</div>
                  <div className="text-[11px] text-muted">{preset.detail}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onOff}
              className={cn(
                "inline-flex w-36 items-center justify-center gap-2 rounded-md border border-line",
                "px-3 py-2 text-sm text-muted hover:border-muted hover:text-white",
                mode === "off" && "border-warn/50 text-warn",
              )}
            >
              <Power className="size-4" aria-hidden />
              Off
            </button>
          </div>
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{ledMessage}</p>
    </Panel>
  );
}
