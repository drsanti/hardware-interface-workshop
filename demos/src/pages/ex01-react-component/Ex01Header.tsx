import { InlineCode } from "@/components/lab/InlineCode";
import { LabHeader } from "@/components/lab/LabHeader";

/** Lab copy for ex01 — keep `index.tsx` free of long JSX. */
export function Ex01Header() {
  return (
    <LabHeader
      ex="ex01"
      focus="React component"
      title="Build a small UI brick"
      description={
        <>
          Practice a component with local state before wiring Web Serial / BLE. Edit{" "}
          <InlineCode className="text-xs">pages/ex01-react-component/index.tsx</InlineCode>.
        </>
      }
    />
  );
}
