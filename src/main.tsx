import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { initTheme } from "@/hooks/useTheme";
import "@/assets/styles/index.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the service worker (enables PWA install + Web Share Target).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* non-fatal */ });
  });
}
