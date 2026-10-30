import { create } from "zustand";

import { hasWebBluetooth, hasWebSerial, isSecureContext } from "@/lib/browser";

type CapabilitiesState = {
  secure: boolean;
  serial: boolean;
  bluetooth: boolean;
  refresh: () => void;
};

export const useCapabilities = create<CapabilitiesState>((set) => ({
  secure: isSecureContext(),
  serial: hasWebSerial(),
  bluetooth: hasWebBluetooth(),
  refresh: () =>
    set({
      secure: isSecureContext(),
      serial: hasWebSerial(),
      bluetooth: hasWebBluetooth(),
    }),
}));
