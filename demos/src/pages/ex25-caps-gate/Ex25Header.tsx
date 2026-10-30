import { LabHeader } from "@/components/lab/LabHeader";

export function Ex25Header() {
  return (
    <LabHeader
      ex="ex25"
      focus="Caps"
      title="Know your board"
      description="Compare CAP bits for es3c28p vs ws28p. Labs gate UI with boardHas() — switch WORKSHOP_BOARD_ID and flash the matching prebuilt."
    />
  );
}
