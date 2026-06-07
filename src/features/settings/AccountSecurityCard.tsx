import { useEffect, useState } from "react";
import { BadgeCheck, AlertCircle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UsernameInput } from "@/features/auth/UsernameInput";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/useToast";

type Panel = null | "username" | "password" | "phone";

export function AccountSecurityCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const toast = useToast();
  const [panel, setPanel] = useState<Panel>(null);

  if (!user) return null;

  return (
    <Card className="divide-y divide-sand-border p-0">
      <div className="px-4 py-3 text-sm font-semibold text-ink-muted">Account &amp; Security</div>

      {/* Email + verification */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex-1 text-sm">
          <span className="block text-ink-muted">Email</span>
          {user.email}
        </span>
        {user.isEmailVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <BadgeCheck className="h-4 w-4" /> Verified
          </span>
        ) : (
          <button onClick={async () => { try { await authService.resendVerification(user.email); toast.success("Verification email sent."); } catch { toast.error("Couldn't resend."); } }}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline">
            <AlertCircle className="h-4 w-4" /> Resend
          </button>
        )}
      </div>

      {/* Username */}
      <div>
        <button onClick={() => setPanel(panel === "username" ? null : "username")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink/5">
          <span className="flex-1 text-sm"><span className="block text-ink-muted">Username</span>{user.username ? `@${user.username}` : "Not set"}</span>
          <ChevronRight className="h-4 w-4 text-ink-muted" />
        </button>
        {panel === "username" && <UsernamePanel current={user.username || ""} onDone={(u) => { setUser(u); setPanel(null); }} />}
      </div>

      {/* Change password (only for email-auth accounts) */}
      {user.authProvider !== "google" && (
        <div>
          <button onClick={() => setPanel(panel === "password" ? null : "password")}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink/5">
            <span className="flex-1 text-sm">Change password</span>
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          </button>
          {panel === "password" && <PasswordPanel onDone={() => setPanel(null)} />}
        </div>
      )}

      {/* Phone + WhatsApp */}
      <div>
        <button onClick={() => setPanel(panel === "phone" ? null : "phone")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink/5">
          <span className="flex-1 text-sm">
            <span className="block text-ink-muted">Phone &amp; WhatsApp</span>
            {user.phoneNumber ? `${user.phoneCountryCode || ""} ${user.phoneNumber}` : "Optional — add for WhatsApp reminders"}
          </span>
          <ChevronRight className="h-4 w-4 text-ink-muted" />
        </button>
        {panel === "phone" && <PhonePanel onChanged={refreshUser} />}
      </div>
    </Card>
  );
}

function UsernamePanel({ current, onDone }: { current: string; onDone: (u: ReturnType<typeof Object>) => void }) {
  const [value, setValue] = useState(current);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  return (
    <div className="space-y-3 bg-sand px-4 py-4">
      <UsernameInput value={value} onChange={setValue} onAvailabilityChange={setOk} />
      <p className="text-xs text-ink-muted">Changing your username will update your profile link.</p>
      <Button size="sm" disabled={!ok || value === current} isLoading={saving}
        onClick={async () => { setSaving(true); try { const u = await authService.updateUsername(value.trim().toLowerCase()); toast.success("Username updated."); onDone(u as never); } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); } }}>
        Save username
      </Button>
    </div>
  );
}

function PasswordPanel({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  return (
    <div className="space-y-3 bg-sand px-4 py-4">
      <Input label="Current password" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
      <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      <Button size="sm" disabled={!cur || next.length < 8} isLoading={saving}
        onClick={async () => { setSaving(true); try { await authService.changePassword(cur, next); toast.success("Password updated."); onDone(); } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); } }}>
        Update password
      </Button>
    </div>
  );
}

function PhonePanel({ onChanged }: { onChanged: () => Promise<void> }) {
  const user = useAuthStore((s) => s.user)!;
  const toast = useToast();
  const [cc, setCc] = useState(user.phoneCountryCode || "+44");
  const [num, setNum] = useState(user.phoneNumber || "");
  const [otpAvailable, setOtpAvailable] = useState(false);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { authService.otpStatus().then((s) => setOtpAvailable(s.available)).catch(() => setOtpAvailable(false)); }, []);

  const savePhone = async () => {
    setBusy(true);
    try { await authService.updatePhone(cc, num); await onChanged(); toast.success("Phone number saved."); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const toggleWhatsapp = async (on: boolean) => {
    setBusy(true);
    try { await authService.setWhatsappOptIn(on); await onChanged(); toast.success(on ? "WhatsApp updates on." : "WhatsApp updates off."); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 bg-sand px-4 py-4">
      <p className="text-xs text-ink-muted">
        Add your phone number to receive WhatsApp reminders for jobs, interviews, study deadlines and important updates. Optional.
      </p>
      <div className="flex gap-2">
        <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="+44"
          className="h-11 w-20 rounded-xl border border-sand-border bg-sand-card px-3 text-sm focus-visible:focus-ring" />
        <input value={num} onChange={(e) => setNum(e.target.value.replace(/[^0-9]/g, ""))} placeholder="7700900000"
          className="h-11 flex-1 rounded-xl border border-sand-border bg-sand-card px-3 text-sm focus-visible:focus-ring" />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={!num || busy} onClick={savePhone}>Save number</Button>
        {user.isPhoneVerified && <span className="text-xs font-medium text-green-600">Verified</span>}
      </div>

      {/* OTP verify — only when a provider is configured */}
      {otpAvailable && user.phoneNumber && !user.isPhoneVerified && (
        <div className="space-y-2 rounded-xl border border-sand-border p-3">
          {!sent ? (
            <Button size="sm" disabled={busy}
              onClick={async () => { setBusy(true); try { await authService.requestPhoneOtp(); setSent(true); toast.success("Code sent."); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } }}>
              Send verification code
            </Button>
          ) : (
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code"
                className="h-10 flex-1 rounded-lg border border-sand-border bg-sand-card px-3 text-sm" />
              <Button size="sm" disabled={!code || busy}
                onClick={async () => { setBusy(true); try { await authService.confirmPhoneOtp(code); await onChanged(); toast.success("Phone verified."); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } }}>
                Verify
              </Button>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp consent */}
      <label className="flex items-start gap-2 text-xs text-ink">
        <input type="checkbox" className="mt-0.5" checked={!!user.whatsappOptIn} disabled={!user.phoneNumber || busy}
          onChange={(e) => toggleWhatsapp(e.target.checked)} />
        <span>I agree to receive Kommunitea updates and reminders on WhatsApp. I can opt out anytime.</span>
      </label>
    </div>
  );
}
