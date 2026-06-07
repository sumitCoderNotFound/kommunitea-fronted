import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";

type Status = "verifying" | "success" | "error" | "no-token";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<Status>(token ? "verifying" : "no-token");
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // guard against double-run in StrictMode
    authService.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const resend = async () => {
    if (!email) return;
    try { await authService.resendVerification(email); } catch { /* generic */ }
    setResent(true);
  };

  if (status === "verifying") {
    return (
      <div>
        <h2 className="font-display text-3xl font-bold">Verifying…</h2>
        <p className="mt-3 text-ink-muted">Hang tight while we confirm your email.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div>
        <h2 className="font-display text-3xl font-bold">Email verified ✅</h2>
        <p className="mt-3 text-ink-muted">You're all set. You can now use everything Kommunitea has to offer.</p>
        <Link to={ROUTES.login} className="mt-6 inline-block font-medium text-coral hover:underline">Continue to log in →</Link>
      </div>
    );
  }

  // error or no-token → offer resend
  return (
    <div>
      <h2 className="font-display text-3xl font-bold">
        {status === "error" ? "Link expired" : "Verify your email"}
      </h2>
      <p className="mt-3 text-ink-muted">
        {status === "error"
          ? "This verification link is invalid or has expired. Enter your email to get a fresh one."
          : "Enter your email and we'll send a new verification link."}
      </p>
      {resent ? (
        <p className="mt-6 rounded-xl bg-sand-card p-4 text-sm text-ink">
          If that account exists and is unverified, a new email is on its way.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <Input label="Email" type="email" placeholder="you@university.ac.uk" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button fullWidth size="lg" disabled={!email} onClick={resend}>Resend verification email</Button>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to={ROUTES.login} className="font-medium text-coral hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
