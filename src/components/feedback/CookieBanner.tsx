import { useState, useEffect } from "react";
import { ROUTES } from "@/constants";


const KEY = "kommunitea_cookie_consent";

/** Simple dismissible cookie/consent notice. Remembers the choice locally. */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch { setShow(true); }
  }, []);

  const accept = () => {
    try { localStorage.setItem(KEY, "accepted"); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-2xl rounded-2xl border border-sand-border bg-white p-4 shadow-lift sm:flex sm:items-center sm:gap-4">
      <p className="text-sm text-ink-soft">
        Kommunitea uses essential cookies to keep you signed in and to run the platform. By using the site you agree to this. See our{" "}
        <a href={ROUTES.privacy} className="font-medium text-coral hover:underline">Privacy Policy</a>
      </p>
      <button onClick={accept}
        className="mt-3 w-full shrink-0 rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark sm:mt-0 sm:w-auto">
        Got it
      </button>
    </div>
  );
}
