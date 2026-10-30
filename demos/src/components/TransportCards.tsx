import { Bluetooth, Cable } from "lucide-react";

import { CAP, boardHas } from "@/lib/workshop";

/** Side-by-side Web Serial vs Web Bluetooth intro cards. */
export function TransportCards() {
  const hasMic = boardHas(CAP.MIC);

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-serial/30 bg-panel p-5">
        <Cable className="mb-3 size-5 text-serial" aria-hidden />
        <h2 className="font-medium">Web Serial</h2>
        <p className="mt-1 text-sm text-muted">
          USB cable to the board
          {hasMic ? " — needed for microphone audio" : ""}. Quit any other app using the port before
          connecting.
        </p>
      </article>
      <article className="rounded-xl border border-ble/30 bg-panel p-5">
        <Bluetooth className="mb-3 size-5 text-ble" aria-hidden />
        <h2 className="font-medium">Web Bluetooth</h2>
        <p className="mt-1 text-sm text-muted">
          Wireless link to the board
          {hasMic
            ? " — good for LED and sound; microphone audio stays on the USB cable."
            : " — same kinds of board messages as the USB cable."}
        </p>
      </article>
    </section>
  );
}
