import { useState } from "react";
import { MailWarning, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/useToast";

/** Shown on Home until the user verifies their email. Hidden for verified/Google-verified users. */
export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (!user || user.isEmailVerified) return null;

  const resend = async () => {
    setBusy(true);
    try { await authService.resendVerification(user.email); toast.success("Verification email sent (check your inbox)."); }
    catch { toast.error("Couldn't resend right now. Try again shortly."); }
    finally { setBusy(false); }
  };

  const refresh = async () => {
    setBusy(true);
    try {
      await refreshUser();
      const verified = useAuthStore.getState().user?.isEmailVerified;
      if (verified) toast.success("Email verified — thank you!");
      else toast.info("Not verified yet. Click the link in your email, then try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center">
      <MailWarning className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="flex-1 text-sm text-amber-900">
        Please verify your email to unlock all features.
      </p>
      <div className="flex gap-2">
        <button onClick={resend} disabled={busy}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
          Resend email
        </button>
        <button onClick={refresh} disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60">
          <RefreshCw className="h-3 w-3" /> I verified
        </button>
      </div>
    </div>
  );
}
