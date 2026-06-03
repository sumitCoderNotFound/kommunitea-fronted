import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

/** Global "Are you sure?" dialog. Triggered via useConfirm(). */
export function ConfirmDialog() {
  const { confirm, closeConfirm } = useUIStore();

  const handleConfirm = () => {
    confirm.onConfirm?.();
    closeConfirm();
  };

  return createPortal(
    <AnimatePresence>
      {confirm.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/50" onClick={closeConfirm} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift text-center">
            <div className={cn("mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full",
              confirm.tone === "danger" ? "bg-red-50 text-red-500" : "bg-coral/10 text-coral")}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold">{confirm.title}</h3>
            {confirm.message && <p className="mt-1 text-sm text-ink-muted">{confirm.message}</p>}
            <div className="mt-5 flex gap-2">
              <button onClick={closeConfirm}
                className="flex-1 rounded-xl border border-sand-border bg-white py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5">
                {confirm.cancelLabel}
              </button>
              <button onClick={handleConfirm}
                className={cn("flex-1 rounded-xl py-2.5 text-sm font-medium text-white",
                  confirm.tone === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-coral hover:bg-coral-dark")}>
                {confirm.confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
