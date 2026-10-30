import { useCallback, useEffect, useRef } from "react";

import type { SerialSessionState } from "@/hooks/useSerialSession";
import { MSG_CMD_ACK, decodeCmdAck } from "@/lib/wire/led";

type Pending = {
  seq: number;
  msgType: number;
  resolve: (rc: number) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Wait for `CmdAck` matching the outbound frame seq + command msg_type.
 * Newer commands replace older pending waits (slider / rapid clicks).
 */
export function useAckedWrite(
  ready: boolean,
  subscribe: SerialSessionState["subscribe"],
  writeFrame: SerialSessionState["writeFrame"],
) {
  const pendingRef = useRef<Pending | null>(null);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_CMD_ACK) return;
      const ack = decodeCmdAck(frame.payload);
      const pending = pendingRef.current;
      if (!pending) return;
      if (ack.msgType !== pending.msgType) return;
      if ((ack.reqSeq & 0xffff) !== (pending.seq & 0xffff)) return;
      clearTimeout(pending.timer);
      pendingRef.current = null;
      pending.resolve(ack.rc);
    });
  }, [ready, subscribe]);

  useEffect(() => {
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current.timer);
    };
  }, []);

  /** Drop in-flight wait without rejecting (disconnect / unmount). */
  const clearPending = useCallback(() => {
    if (!pendingRef.current) return;
    clearTimeout(pendingRef.current.timer);
    pendingRef.current = null;
  }, []);

  const writeAcked = useCallback(
    async (msgType: number, payload: Uint8Array) => {
      const seq = await writeFrame(msgType, payload);
      return new Promise<number>((resolve, reject) => {
        if (pendingRef.current) {
          clearTimeout(pendingRef.current.timer);
          pendingRef.current.reject(new Error("Replaced by a newer command."));
        }
        const timer = setTimeout(() => {
          pendingRef.current = null;
          reject(
            new Error("No reply from board — is serial-bridge firmware on the board?"),
          );
        }, 2500);
        pendingRef.current = { seq, msgType, resolve, reject, timer };
      });
    },
    [writeFrame],
  );

  return { writeAcked, clearPending };
}
