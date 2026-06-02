import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Globe, LogOut, ChevronRight, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { profileService } from "@/services/profileService";
import { useToast } from "@/hooks/useToast";

export function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();

  const togglePrivacy = useMutation({
    mutationFn: (isPrivate: boolean) => profileService.update({ isPrivate }),
    onSuccess: (u) => { setUser(u); toast.success(u.isPrivate ? "Account is now private 🔒" : "Account is now public 🌍"); },
  });

  const { data: requests = [] } = useQuery({ queryKey: ["follow-requests"], queryFn: profileService.myRequests });

  const accept = useMutation({
    mutationFn: (fromId: string) => profileService.acceptRequest(fromId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["follow-requests"] }); toast.success("Request accepted"); },
  });
  const reject = useMutation({
    mutationFn: (fromId: string) => profileService.rejectRequest(fromId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follow-requests"] }),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      {/* Privacy */}
      <Card className="p-5">
        <h2 className="mb-3 font-display font-semibold">Account privacy</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10 text-coral">
            {user?.isPrivate ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.isPrivate ? "Private account" : "Public account"}</p>
            <p className="text-xs text-ink-muted">
              {user?.isPrivate ? "People must request to follow you." : "Anyone can follow you and see your posts."}
            </p>
          </div>
          <button
            onClick={() => togglePrivacy.mutate(!user?.isPrivate)}
            className={`relative h-7 w-12 rounded-full transition-colors ${user?.isPrivate ? "bg-coral" : "bg-sand-border"}`}>
            <motion.span layout className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
              animate={{ left: user?.isPrivate ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </Card>

      {/* Follow requests */}
      {requests.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-display font-semibold">Follow requests ({requests.length})</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <Avatar name={r.fromUser.fullName} src={r.fromUser.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.fromUser.fullName}</p>
                  <p className="truncate text-xs text-ink-muted">{r.fromUser.university}</p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => accept.mutate(r.fromUser.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white"><Check className="h-4 w-4" /></motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => reject.mutate(r.fromUser.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-ink-muted"><X className="h-4 w-4" /></motion.button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Links */}
      <Card className="divide-y divide-sand-border p-2">
        <Link to={ROUTES.editProfile} className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-ink/5">
          <User className="h-5 w-5 text-ink-muted" />
          <span className="flex-1 text-sm font-medium">Edit profile</span>
          <ChevronRight className="h-4 w-4 text-ink-muted" />
        </Link>
        <button onClick={() => { logout(); navigate(ROUTES.landing); }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          <span className="flex-1 text-left text-sm font-medium">Log out</span>
        </button>
      </Card>
    </div>
  );
}
