import { ChevronRight, Info } from "lucide-react";

import { Panel } from "@/components/lab/Panel";

const ROWS: Array<{ name: string; wire: string; blurb: string }> = [
  {
    name: "Volume",
    wire: "SfxCmd.volume",
    blurb:
      "Loudness for the next play only. Sent with the preset trigger — not a live tweak.",
  },
  {
    name: "Loops",
    wire: "SfxCmd.loops",
    blurb:
      "How many times to repeat the pattern. 0 = board default (sirens/machines keep going until Stop).",
  },
  {
    name: "Master %",
    wire: "SfxParam stage=0xFF",
    blurb:
      "Codec / speaker level right now. Same idea as Volume, but applied live without re-triggering.",
  },
  {
    name: "Echo mix",
    wire: "SfxParam delay.mix",
    blurb:
      "How much delayed sound is blended with the dry tone. 0 = none; higher = more space / repeats. Delay time is fixed in firmware.",
  },
  {
    name: "Release",
    wire: "SfxParam adsr.rel_ms",
    blurb:
      "Fade-out after each note step (ms). Short = clipped beeps; long = soft tails.",
  },
];

/** Reference card for SFX controls — collapsed by default. */
export function SfxParamsInfo() {
  return (
    <Panel className="border-line/80 p-0">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90"
            aria-hidden
          />
          <Info className="size-4 shrink-0 text-muted" aria-hidden />
          What the controls do
          <span className="ml-auto text-xs font-normal text-muted group-open:hidden">
            Show
          </span>
          <span className="ml-auto hidden text-xs font-normal text-muted group-open:inline">
            Hide
          </span>
        </summary>
        <div className="space-y-3 border-t border-line px-5 py-4">
          <p className="text-sm text-muted">
            Play a looping sound first, then use the live knobs. Volume / Loops ride on
            the next play; Master / Echo / Release change the DSP immediately.
          </p>
          <dl className="space-y-3">
            {ROWS.map((row) => (
              <div
                key={row.name}
                className="space-y-0.5 border-t border-line/60 pt-3 first:border-t-0 first:pt-0"
              >
                <dt className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium">
                  {row.name}
                  <span className="font-mono text-[11px] font-normal text-serial">
                    {row.wire}
                  </span>
                </dt>
                <dd className="text-sm text-muted">{row.blurb}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    </Panel>
  );
}
