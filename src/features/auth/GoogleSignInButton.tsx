import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: any;
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SRC; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google script failed"));
    document.head.appendChild(s);
  });
}

/** Renders the official Google button. No-ops (renders nothing) if no client ID is set. */
export function GoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.google || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return;
            try {
              const data = await authService.googleLogin(resp.credential);
              const user = await authService.me();
              setUser(user);
              if (data.needsUsername) navigate(ROUTES.chooseUsername, { replace: true });
              else navigate(user.isOnboarded ? ROUTES.feed : ROUTES.onboarding, { replace: true });
            } catch {
              toast.error("Google sign-in is unavailable right now. Please use email and password.");
            }
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline", size: "large", width: 320, text: "continue_with",
        });
      })
      .catch(() => { /* script blocked — button just won't appear */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-sand-border" /> or <span className="h-px flex-1 bg-sand-border" />
      </div>
      <div ref={ref} className="flex justify-center" />
    </div>
  );
}
