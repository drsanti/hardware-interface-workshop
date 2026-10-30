import type { CSSProperties } from "react";
import { Lightbulb, Power } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { LED_PRESETS, type Rgb } from "@/lib/wire/led";

type Props = {
  ledSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  commanded: Rgb | null;
  echoed: Rgb | null;
  ledMessage: string | null;
  onSetColor: (rgb: Rgb) => void;
  onOff: () => void;
};

function swatchStyle(rgb: Rgb): CSSProperties {
  return { backgroundColor: `rgb(${rgb.r} ${rgb.g} ${rgb.b})` };
}

/** Color presets + off for the RGB LED lab. */
export function LedControlCard({
  ledSupported,
  ready,
  portOpen,
  commanded,
  echoed,
  ledMessage,
  onSetColor,
  onOff,
}: Props) {
  const preview = echoed ?? commanded;
  const isOff =
    preview != null && preview.r === 0 && preview.g === 0 && preview.b === 0;

  return (
    <Panel className={ledSupported ? "border-accent/30" : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lightbulb
          className={cn("size-4", isOff ? "text-muted" : "text-accent")}
          aria-hidden
        />
        RGB LED
      </div>

      {!ledSupported ? (
        <p className="text-sm text-muted">
          This board target has no RGB LED. Set{" "}
          <span className="font-mono text-xs text-serial">WORKSHOP_BOARD_ID</span> to{" "}
          <span className="font-mono text-xs text-serial">es3c28p</span> and flash that image.
        </p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first, then choose a color.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 py-2">
            <div
              className={cn(
                "size-16 rounded-full border shadow-inner transition-colors",
                isOff || !preview
                  ? "border-line/50 bg-line opacity-45"
                  : "border-line",
              )}
              style={isOff || !preview ? undefined : swatchStyle(preview)}
              title={isOff ? "LED off" : "Board / commanded color"}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LED_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSetColor(preset.rgb)}
                className={cn(
                  "inline-flex flex-col items-center gap-2 rounded-md border border-line px-2 py-3",
                  "text-xs font-medium text-muted hover:border-muted hover:text-white",
                )}
              >
                <span
                  className="size-6 rounded-full border border-line"
                  style={swatchStyle(preset.rgb)}
                  aria-hidden
                />
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onOff}
              className={cn(
                "inline-flex w-36 items-center justify-center gap-2 rounded-md border border-line",
                "px-3 py-2 text-sm text-muted hover:border-muted hover:text-white",
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
