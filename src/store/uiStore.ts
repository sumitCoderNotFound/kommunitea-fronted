import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface UIState {
  toasts: Toast[];
  isSidebarOpen: boolean;
  isCreatePostOpen: boolean;
  pushToast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: string) => void;
  toggleSidebar: () => void;
  setCreatePostOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isSidebarOpen: false,
  isCreatePostOpen: false,
  pushToast: (type, message) =>
    set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), type, message }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setCreatePostOpen: (open) => set({ isCreatePostOpen: open }),
}));
