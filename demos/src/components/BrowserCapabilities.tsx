import { ShieldCheck } from "lucide-react";

import { CapabilityBadge } from "@/components/CapabilityBadge";
import { InlineCode } from "@/components/lab/InlineCode";
import { Panel } from "@/components/lab/Panel";
import { useBrowserCapabilities } from "@/hooks/useBrowserCapabilities";

/** Secure context + Web Serial / Web Bluetooth availability. */
export function BrowserCapabilities() {
  const { secure, serial, bluetooth } = useBrowserCapabilities();

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="size-4 text-accent" aria-hidden />
        Browser capabilities
      </div>
      <div className="flex flex-wrap gap-2">
        <CapabilityBadge label="Secure context" ok={secure} />
        <CapabilityBadge label="Web Serial" ok={serial} />
        <CapabilityBadge label="Web Bluetooth" ok={bluetooth} />
      </div>
      <p className="text-sm text-muted">
        Use Chrome or Edge on <InlineCode className="text-xs">localhost</InlineCode> or HTTPS.
        Pickers need a user gesture (button click).
      </p>
    </Panel>
  );
}
