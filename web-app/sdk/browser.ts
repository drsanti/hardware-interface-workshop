/** Capability checks for Web Serial / Web Bluetooth. */

export function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function hasWebSerial(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

export function hasWebBluetooth(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function serialUnsupportedReason(): string | null {
  if (!isSecureContext()) {
    return "Web Serial needs a secure context (localhost or HTTPS).";
  }
  if (!hasWebSerial()) {
    return "Web Serial is not available — use Chrome or Edge.";
  }
  return null;
}

export function bleUnsupportedReason(): string | null {
  if (!isSecureContext()) {
    return "Web Bluetooth needs a secure context (localhost or HTTPS).";
  }
  if (!hasWebBluetooth()) {
    return "Web Bluetooth is not available — use Chrome or Edge.";
  }
  return null;
}
