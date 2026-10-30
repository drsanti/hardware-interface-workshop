import type { ReactNode } from "react";
import { Square } from "lucide-react";

import { cn } from "@/lib/cn";
import { SFX_PRESET, type SfxPresetInfo } from "@/lib/wire/sfx";

/** Connect / ready gate used by every SFX lab card. */
export function SfxGate({
  portOpen,
  ready,
  idleHint,
  children,
}: {
  portOpen: boolean;
  ready: boolean;
  idleHint: string;
  children: ReactNode;
}) {
  if (!portOpen) {
    return <p className="text-sm text-muted">Connect first. {idleHint}</p>;
  }
  if (!ready) {
    return <p className="text-sm text-muted">Waiting for the board to settle…</p>;
  }
  return <>{children}</>;
}

export function SfxStatus({ message }: { message: string | null }) {
  return <p className="min-h-5 text-center text-sm text-muted">{message}</p>;
}

export function SfxStopButton({
  active,
  disabled,
  onStop,
  className,
}: {
  active: boolean;
  disabled: boolean;
  onStop: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onStop}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-line",
        "px-3 py-2 text-sm text-muted hover:border-muted hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "border-warn/50 text-warn",
        className,
      )}
    >
      <Square className="size-4" aria-hidden />
      Stop
    </button>
  );
}

export function SfxPresetButton({
  preset,
  selected,
  onPlay,
  size = "md",
}: {
  preset: SfxPresetInfo;
  selected: boolean;
  onPlay: (preset: number) => void;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(preset.id)}
      className={cn(
        "rounded-md border text-left hover:border-muted hover:text-white",
        size === "lg" ? "px-3 py-5" : "px-2 py-3",
        selected ? "border-serial/60 bg-serial/10 text-white" : "border-line text-muted",
      )}
    >
      <div className={cn("font-medium text-inherit", size === "lg" ? "text-base" : "text-sm")}>
        {preset.label}
      </div>
      <div className="text-[11px] text-muted">{preset.detail}</div>
    </button>
  );
}

export function SfxPresetGrid({
  presets,
  cols,
  lastPreset,
  onPlay,
  size = "md",
}: {
  presets: SfxPresetInfo[];
  cols: 2 | 3;
  lastPreset: number | null;
  onPlay: (preset: number) => void;
  size?: "md" | "lg";
}) {
  return (
    <div className={cols === 3 ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
      {presets.map((p) => (
        <SfxPresetButton
          key={p.id}
          preset={p}
          selected={lastPreset === p.id}
          onPlay={onPlay}
          size={size}
        />
      ))}
    </div>
  );
}

export function SfxSlider({
  label,
  value,
  display,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "#a371f7" }}
      />
      <span className="font-mono text-xs tabular-nums text-muted">{display}</span>
    </label>
  );
}

export function isStopActive(lastPreset: number | null): boolean {
  return lastPreset === SFX_PRESET.STOP;
}
