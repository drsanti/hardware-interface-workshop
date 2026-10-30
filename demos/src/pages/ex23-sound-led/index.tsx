import { SerialPortCard } from "@/components/SerialPortCard";
import { SoundLedCard } from "@/components/SoundLedCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSoundLed } from "@/hooks/useSoundLed";

import { Ex23Header } from "./Ex23Header";

/**
 * Ex23 — Sound-reactive LED.
 *
 * ── FOCUS: AudioLevel → LedFx solid (es3c28p).
 */
export function Ex23SoundLed() {
  const sound = useSoundLed();

  return (
    <LabPage width="lg">
      <Ex23Header />
      <SerialPortCard
        {...sound}
        serialOnly
      />
      <SoundLedCard
        micSupported={sound.micSupported}
        ledSupported={sound.ledSupported}
        ready={sound.ready}
        portOpen={sound.status === "open"}
        enabled={sound.enabled}
        level={sound.level}
        ledRgb={sound.ledRgb}
        soundMessage={sound.soundMessage}
        onEnable={(on) => void sound.enable(on)}
      />
    </LabPage>
  );
}
