/** Web Serial / Web Bluetooth only exist in secure contexts (HTTPS or localhost). */
export function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function hasWebSerial(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

export function hasWebBluetooth(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}
