import { LabHeader } from "@/components/lab/LabHeader";

export function Ex17Header() {
  return (
    <LabHeader
      ex="ex17"
      focus="Key → action"
      title="Button triggers a sound"
      description="SHORT press sends SfxCmd Beep (and a green LED flash on es3c28p). Wire input to an actuator you already know."
    />
  );
}
