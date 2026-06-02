import { Link } from "react-router-dom";
import { MapPin, GraduationCap } from "lucide-react";
import type { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";

export function ProfileCard({ user, compact = false }: { user: User; compact?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <Avatar name={user.fullName} src={user.avatarUrl} size={compact ? "md" : "lg"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{user.fullName}</h3>
            {user.badge && <VerifiedBadge type={user.badge} />}
          </div>
          {user.course && <p className="text-sm text-ink-muted">{user.course}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            {user.university && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {user.university}</span>}
            {user.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.city}</span>}
          </div>
        </div>
      </div>

      {!compact && user.bio && <p className="mt-4 text-sm text-ink-soft">{user.bio}</p>}

      {user.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {user.skills.slice(0, compact ? 3 : 8).map((s) => (
            <span key={s} className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-medium text-sky">{s}</span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button size="sm" fullWidth>Follow</Button>
        <Link to={ROUTES.profile(user.id)} className="flex-1">
          <Button size="sm" variant="outline" fullWidth>View Profile</Button>
        </Link>
      </div>
    </Card>
  );
}
