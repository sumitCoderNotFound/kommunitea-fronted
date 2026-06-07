import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: "default" | "danger";
  onConfirm: (() => void) | null;
}

interface UIState {
  toasts: Toast[];
  isSidebarOpen: boolean;
  isCreatePostOpen: boolean;
  isImportOpen: boolean;
  importInitial: string;
  confirm: ConfirmState;
  pushToast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: string) => void;
  toggleSidebar: () => void;
  setCreatePostOpen: (open: boolean) => void;
  setImportOpen: (open: boolean, initial?: string) => void;
  requestConfirm: (opts: Partial<Omit<ConfirmState, "open">> & { onConfirm: () => void }) => void;
  closeConfirm: () => void;
}

const TOAST_MS = 6000; // auto-dismiss after 6 seconds

const defaultConfirm: ConfirmState = {
  open: false, title: "Are you sure?", message: "", confirmLabel: "Yes",
  cancelLabel: "Cancel", tone: "default", onConfirm: null,
};

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  isSidebarOpen: false,
  isCreatePostOpen: false,
  isImportOpen: false,
  importInitial: "",
  confirm: defaultConfirm,
  pushToast: (type, message) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    // auto-dismiss
    setTimeout(() => {
      if (get().toasts.some((t) => t.id === id)) get().dismissToast(id);
    }, TOAST_MS);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setCreatePostOpen: (open) => set({ isCreatePostOpen: open }),
  setImportOpen: (open, initial = "") => set({ isImportOpen: open, importInitial: open ? initial : "" }),
  requestConfirm: (opts) =>
    set({ confirm: { ...defaultConfirm, ...opts, open: true } }),
  closeConfirm: () => set({ confirm: { ...defaultConfirm } }),
}));
