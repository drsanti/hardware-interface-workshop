import { useCapabilities } from "@/store/capabilities";

/** Browser secure-context / Web Serial / Web Bluetooth flags for labs. */
export function useBrowserCapabilities() {
  return useCapabilities();
}
