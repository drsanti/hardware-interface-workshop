import { Activity } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import type { ImuView } from "@/lib/wire/imu";

type Props = {
  imuSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  sample: ImuView | null;
  magnitude: number;
  imuMessage: string | null;
  /** Optional shake lab extras. */
  shakeCount?: number;
  shakeThreshold?: number;
  onShakeThreshold?: (n: number) => void;
  onResetShake?: () => void;
};

function AxisBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (Math.abs(value) / max) * 100));
  const neg = value < 0;
  return (
    <div className="grid grid-cols-[1.5rem_1fr_4.5rem] items-center gap-2 text-xs">
      <span className="font-mono text-muted">{label}</span>
      <div className="relative h-3 overflow-hidden rounded-sm border border-line bg-ink">
        <div
          className="absolute top-0 h-full bg-serial/80"
          style={{
            width: `${pct / 2}%`,
            left: neg ? `${50 - pct / 2}%` : "50%",
          }}
        />
        <div className="absolute top-0 left-1/2 h-full w-px bg-line" />
      </div>
      <span className="font-mono tabular-nums text-muted">{value.toFixed(2)}</span>
    </div>
  );
}

/** IMU tilt / accel display — ex20 hello / ex21 shake. */
export function ImuCard({
  imuSupported,
  ready,
  portOpen,
  sample,
  magnitude,
  imuMessage,
  shakeCount,
  shakeThreshold,
  onShakeThreshold,
  onResetShake,
}: Props) {
  const a = sample?.accel;

  return (
    <Panel className={imuSupported ? "border-serial/30" : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Activity className="size-4 text-serial" aria-hidden />
        Motion (IMU)
      </div>

      {!imuSupported ? (
        <p className="text-sm text-muted">
          No IMU — set{" "}
          <span className="font-mono text-xs text-serial">WORKSHOP_BOARD_ID</span> to{" "}
          <span className="font-mono text-xs text-serial">ws28p</span>.
        </p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first — samples stream ~50 Hz.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : !a ? (
        <p className="text-sm text-muted">Waiting for first Imu sample…</p>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Accel m/s²
            </p>
            <AxisBar label="X" value={a.x} max={20} />
            <AxisBar label="Y" value={a.y} max={20} />
            <AxisBar label="Z" value={a.z} max={20} />
            <p className="text-center font-mono text-sm text-muted">
              |a| = {magnitude.toFixed(2)} m/s²
            </p>
          </div>

          {shakeThreshold != null && onShakeThreshold ? (
            <div className="space-y-2 rounded-md border border-line p-3">
              <label className="grid grid-cols-[5rem_1fr_3rem] items-center gap-2 text-xs">
                <span className="text-muted">Shake ≥</span>
                <input
                  type="range"
                  min={12}
                  max={40}
                  value={shakeThreshold}
                  onChange={(e) => onShakeThreshold(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#a371f7" }}
                />
                <span className="font-mono text-muted">{shakeThreshold}</span>
              </label>
              <div className="flex items-center justify-between text-sm">
                <span>
                  Shakes: <span className="font-semibold text-white">{shakeCount ?? 0}</span>
                </span>
                {onResetShake ? (
                  <button
                    type="button"
                    onClick={onResetShake}
                    className="text-xs text-muted hover:text-white"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{imuMessage}</p>
    </Panel>
  );
}
