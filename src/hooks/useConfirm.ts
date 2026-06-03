import { useUIStore } from "@/store/uiStore";

/** Ask the user to confirm an action before running it.
 *  Usage: const confirm = useConfirm(); confirm({ message: "Post this?", onConfirm: () => doIt() }) */
export function useConfirm() {
  return useUIStore((s) => s.requestConfirm);
}
