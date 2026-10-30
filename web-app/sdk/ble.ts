import { bleUnsupportedReason } from "./browser";

/** robotos GATT — same COBS frames as USB (see firmware ble_nus). */
export const BLE_SVC = "726f626f-746f-5300-8000-000000000001";
/** Host → board writes. */
export const BLE_RX = "726f626f-746f-5300-8000-000000000002";
/** Board → host notifies. */
export const BLE_TX = "726f626f-746f-5300-8000-000000000003";

/** Web Bluetooth does not expose ATT MTU — LE minimum payload is 20. */
export const BLE_WRITE_CHUNK = 20;

export type BleLink = {
  device: BluetoothDevice;
  rx: BluetoothRemoteGATTCharacteristic;
  tx: BluetoothRemoteGATTCharacteristic;
  name: string | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function bleDiscover(
  device: BluetoothDevice,
  attempts = 4,
): Promise<{ rx: BluetoothRemoteGATTCharacteristic; tx: BluetoothRemoteGATTCharacteristic }> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      if (!device.gatt) throw new Error("No GATT on device.");
      if (device.gatt.connected) {
        try {
          device.gatt.disconnect();
        } catch {
          /* ok */
        }
        await sleep(150);
      }
      const server = await device.gatt.connect();
      await sleep(80 + i * 120);
      if (!server.connected) throw new Error("GATT dropped right after connect.");
      const svc = await server.getPrimaryService(BLE_SVC);
      const rx = await svc.getCharacteristic(BLE_RX);
      const tx = await svc.getCharacteristic(BLE_TX);
      /* Caller attaches the notify listener, then startNotifications —
       * otherwise BoardInfo pushed on CCC subscribe is lost. */
      return { rx, tx };
    } catch (e) {
      last = e;
    }
    try {
      device.gatt?.disconnect();
    } catch {
      /* ok */
    }
    await sleep(200 + i * 150);
  }
  const msg = last instanceof Error ? last.message : String(last);
  throw new Error(
    `${msg} Close other BLE clients, wait after flash for rb-* to advertise, then retry.`,
  );
}

/** Browser picker + GATT discover (needs a user gesture). */
export async function openBleLink(): Promise<BleLink> {
  const reason = bleUnsupportedReason();
  if (reason) throw new Error(reason);
  const bluetooth = navigator.bluetooth;
  if (!bluetooth) throw new Error("Web Bluetooth is not available.");

  const device = await bluetooth.requestDevice({
    filters: [{ services: [BLE_SVC] }, { namePrefix: "rb-" }, { namePrefix: "robotos" }],
    optionalServices: [BLE_SVC],
  });
  const { rx, tx } = await bleDiscover(device);
  return { device, rx, tx, name: device.name ?? null };
}

export async function bleWrite(
  rx: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array,
): Promise<void> {
  for (let i = 0; i < data.length; i += BLE_WRITE_CHUNK) {
    const piece = data.subarray(i, i + BLE_WRITE_CHUNK);
    await rx.writeValueWithResponse(piece.slice());
  }
}

export async function closeBleLink(link: BleLink | null): Promise<void> {
  if (!link) return;
  try {
    await link.tx.stopNotifications();
  } catch {
    /* ok */
  }
  try {
    link.device.gatt?.disconnect();
  } catch {
    /* ok */
  }
}
