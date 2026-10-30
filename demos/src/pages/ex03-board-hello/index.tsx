import { BoardInfoCard } from "@/components/BoardInfoCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useBoardHello } from "@/hooks/useBoardHello";

import { Ex03Header } from "./Ex03Header";

/**
 * ex03 — listen for the board identity message after connect.
 *
 * Connect → board sends Hello/identity → BoardInfoCard fills in.
 * That handshake is what later labs call `ready`.
 */
export function Ex03BoardHello() {
  const link = useBoardHello();

  return (
    <LabPage width="lg">
      <Ex03Header />
      <SerialPortCard
        {...link}
      />
      {/* ── FOCUS: decoded board identity after connect ─────────────── */}
      <BoardInfoCard
        info={link.info}
        listenMessage={link.listenMessage}
        decoderOk={link.decoderOk}
        portOpen={link.status === "open"}
      />
    </LabPage>
  );
}
