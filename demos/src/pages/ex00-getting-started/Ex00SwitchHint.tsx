import { InlineCode } from "@/components/lab/InlineCode";

/** Footer hint — how to switch the active example in App.tsx. */
export function Ex00SwitchHint() {
  return (
    <p className="text-sm text-muted">
      Switch examples in <InlineCode className="text-xs">src/App.tsx</InlineCode> — comment the
      active <InlineCode className="text-xs">Route</InlineCode> and uncomment the next one.
    </p>
  );
}
