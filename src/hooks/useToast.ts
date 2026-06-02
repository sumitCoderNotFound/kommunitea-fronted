import { useUIStore } from "@/store/uiStore";

/** Convenience wrapper around the toast store. */
export function useToast() {
  const push = useUIStore((s) => s.pushToast);
  return {
    success: (msg: string) => push("success", msg),
    error: (msg: string) => push("error", msg),
    info: (msg: string) => push("info", msg),
  };
}
