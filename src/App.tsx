import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib-queryClient";
import { AppRouter } from "@/routes/AppRouter";
import { ToastViewport } from "@/components/feedback/Toast";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ujt_access");
    if (token) {
      refreshUser().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [refreshUser]);

  if (!ready) return null; // could render a splash screen

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastViewport />
    </QueryClientProvider>
  );
}
