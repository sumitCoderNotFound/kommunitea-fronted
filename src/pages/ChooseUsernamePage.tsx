import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { UsernameInput } from "@/features/auth/UsernameInput";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

export function ChooseUsernamePage() {
  const [username, setUsername] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const navigate = useNavigate();

  const save = async () => {
    if (!ok) return;
    setSaving(true);
    try {
      const updated = await authService.updateUsername(username.trim().toLowerCase());
      setUser(updated);
      navigate(user?.isOnboarded ? ROUTES.feed : ROUTES.onboarding, { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Pick your username</h2>
      <p className="mt-1 text-ink-muted">This is your public handle — how people find and mention you.</p>
      <div className="mt-8 space-y-4">
        <UsernameInput value={username} onChange={setUsername} onAvailabilityChange={setOk} />
        <Button fullWidth size="lg" disabled={!ok} isLoading={saving} onClick={save}>Continue</Button>
      </div>
    </div>
  );
}
