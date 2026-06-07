import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FollowButton } from "@/features/profile/FollowButton";
import { profileService } from "@/services/profileService";
import { ROUTES } from "@/constants";

export function FollowListPage({ mode }: { mode: "followers" | "following" }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: [mode, id, q],
    queryFn: () => (mode === "followers" ? profileService.followers(id, q) : profileService.following(id, q)),
    enabled: !!id,
  });

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="mb-4 font-display text-2xl font-bold capitalize">{mode}</h1>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people..."
          className="h-11 w-full rounded-xl border border-sand-border bg-sand-card pl-11 pr-4 text-sm focus-visible:focus-ring" />
      </div>

      {isLoading ? <Loader /> : users.length === 0 ? (
        <EmptyState icon={Users} title={mode === "followers" ? "No followers yet" : "Not following anyone yet"} />
      ) : (
        <Card className="divide-y divide-sand-border p-0">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3">
              <button onClick={() => navigate(ROUTES.profile(u.id))} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium hover:underline">{u.fullName}</p>
                  <p className="truncate text-xs text-ink-muted">{u.university || u.city || (u.userType ? u.userType.replace("_", " ") : "")}</p>
                </div>
              </button>
              <div className="flex shrink-0 gap-2">
                <FollowButton user={u} />
                <Button variant="outline" size="sm" onClick={() => navigate(`${ROUTES.inbox}?user=${u.id}`)}>Message</Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
