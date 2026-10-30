import { MicControlCard } from "@/components/MicControlCard";
import { RecorderCard } from "@/components/RecorderCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useMicRecorder } from "@/hooks/useMicRecorder";

import { Ex28Header } from "./Ex28Header";

/**
 * Ex28 — Mic recorder / player.
 *
 * MicPcm → host buffer → Web Audio play or WAV download.
 */
export function Ex28MicRecorder() {
  const mic = useMicRecorder();

  return (
    <LabPage width="lg">
      <Ex28Header />
      <SerialPortCard {...mic} serialOnly />
      <MicControlCard
        micSupported={mic.micSupported}
        ready={mic.ready}
        portOpen={mic.status === "open"}
        enabled={mic.enabled}
        muted={mic.muted}
        streaming={mic.streaming}
        gainPct={mic.gainPct}
        level={mic.level}
        waveform={mic.waveform}
        micMessage={mic.micMessage}
        // ── FOCUS: VU while recording; Stream optional (Record auto-starts)
        features={{ vu: true, stream: true }}
        onEnable={(on) => void mic.enable(on)}
        onMute={(on) => void mic.setMute(on)}
        onStream={(on) => void mic.setStream(on)}
        onGain={mic.setGainPct}
        onApplyGain={() => void mic.applyGain()}
      />
      {/* ── FOCUS: Record / Play / WAV ───────────────────────────────── */}
      <RecorderCard
        micSupported={mic.micSupported}
        ready={mic.ready}
        portOpen={mic.status === "open"}
        recording={mic.recording}
        playing={mic.playing}
        sampleCount={mic.samples.length}
        durationSec={mic.durationSec}
        sampleRate={mic.sampleRate}
        recMessage={mic.recMessage}
        onRecord={() => void mic.startRecord()}
        onStopRecord={mic.stopRecord}
        onPlay={() => void mic.play()}
        onStopPlay={mic.stopPlay}
        onDownload={mic.download}
        onClear={mic.clear}
      />
    </LabPage>
  );
}
