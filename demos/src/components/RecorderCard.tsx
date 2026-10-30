import { Circle, Download, Play, Square, Trash2 } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { REC_MAX_SAMPLES } from "@/hooks/useMicRecorder";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

type Props = {
  micSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  recording: boolean;
  playing: boolean;
  sampleCount: number;
  durationSec: number;
  sampleRate: number;
  recMessage: string | null;
  onRecord: () => void;
  onStopRecord: () => void;
  onPlay: () => void;
  onStopPlay: () => void;
  onDownload: () => void;
  onClear: () => void;
};

/** Record MicPcm → play / download WAV (ex28). */
export function RecorderCard({
  micSupported,
  ready,
  portOpen,
  recording,
  playing,
  sampleCount,
  durationSec,
  sampleRate,
  recMessage,
  onRecord,
  onStopRecord,
  onPlay,
  onStopPlay,
  onDownload,
  onClear,
}: Props) {
  const live = portOpen && ready && micSupported;
  const hasClip = sampleCount > 0;
  const maxSec = REC_MAX_SAMPLES / MIC_FS_HZ;

  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !portOpen
      ? "Connect over USB first."
      : !ready
        ? "Waiting for the board to settle…"
        : recording
          ? "Recording MicPcm — Stop when done (Stream stays on)."
          : hasClip
            ? "Play on the PC speakers, or download a WAV."
            : "Record captures board MicPcm (auto-starts Stream PCM).";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Circle
          className={cn("size-4", recording ? "fill-danger text-danger" : "text-serial")}
          aria-hidden
        />
        Sound recorder
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {!recording ? (
          <button
            type="button"
            disabled={!live || playing}
            onClick={onRecord}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Circle className="size-3.5 fill-current" aria-hidden />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecord}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              "border-warn/50 bg-warn/10 text-warn hover:bg-warn/20",
            )}
          >
            <Square className="size-3.5 fill-current" aria-hidden />
            Stop
          </button>
        )}

        {!playing ? (
          <button
            type="button"
            disabled={!hasClip || recording || !live}
            onClick={onPlay}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Play className="size-3.5 fill-current" aria-hidden />
            Play
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopPlay}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              "border-line text-muted hover:border-muted hover:text-white",
            )}
          >
            <Square className="size-3.5" aria-hidden />
            Stop play
          </button>
        )}

        <button
          type="button"
          disabled={!hasClip || recording}
          onClick={onDownload}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            "border-ble/40 bg-ble/10 text-ble hover:bg-ble/20",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Download className="size-3.5" aria-hidden />
          WAV
        </button>

        <button
          type="button"
          disabled={(!hasClip && !recording) || recording}
          onClick={onClear}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-muted",
            "hover:border-muted hover:text-white",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Trash2 className="size-3.5" aria-hidden />
          Clear
        </button>
      </div>

      <p className="text-center font-mono text-xs text-muted">
        {hasClip
          ? `${durationSec.toFixed(2)} s · ${sampleCount} samples · ${sampleRate} Hz`
          : `empty · max ${maxSec.toFixed(0)} s`}
      </p>
      <p className="min-h-5 text-center text-sm text-muted">{recMessage}</p>
    </Panel>
  );
}
