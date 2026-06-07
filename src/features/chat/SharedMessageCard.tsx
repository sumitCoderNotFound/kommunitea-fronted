import { Link } from "react-router-dom";
import { FileText, User as UserIcon, Briefcase, Hash } from "lucide-react";
import { ROUTES } from "@/constants";
import type { ChatMessage } from "@/services/messageService";

/** Renders a shared post/profile/job/community card from a chat message. */
export function SharedMessageCard({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const p = (message.sharedPayload ?? {}) as Record<string, string>;
  const id = message.sharedId ?? "";

  let to = "";
  let icon = <FileText className="h-4 w-4" />;
  let title = "Shared item";
  let subtitle = "";

  switch (message.kind) {
    case "shared_post":
      to = ROUTES.postDetail(id); icon = <FileText className="h-4 w-4" />;
      title = p.author ? `Post by ${p.author}` : "Shared post"; subtitle = p.body ?? "";
      break;
    case "shared_profile":
      to = ROUTES.profile(id); icon = <UserIcon className="h-4 w-4" />;
      title = p.fullName ?? "Shared profile"; subtitle = p.university ?? p.headline ?? "";
      break;
    case "shared_job":
      to = ROUTES.jobDetail(id); icon = <Briefcase className="h-4 w-4" />;
      title = p.title ?? "Shared job"; subtitle = p.company ?? "";
      break;
    case "shared_community":
      to = ROUTES.communityDetail(id); icon = <Hash className="h-4 w-4" />;
      title = p.name ?? "Shared community"; subtitle = p.category ?? "";
      break;
    default:
      return null;
  }

  return (
    <Link to={to}
      className={`block max-w-[80%] rounded-2xl border p-3 ${mine ? "border-white/30 bg-white/10" : "border-sand-border bg-sand-card"}`}>
      <span className={`flex items-center gap-1.5 text-xs font-semibold ${mine ? "text-white/90" : "text-coral"}`}>
        {icon} {title}
      </span>
      {subtitle && <p className={`mt-1 line-clamp-2 text-sm ${mine ? "text-white/80" : "text-ink-soft"}`}>{subtitle}</p>}
      {p.imageUrl && <img src={p.imageUrl} alt="" className="mt-2 max-h-40 w-full rounded-lg object-cover" />}
    </Link>
  );
}
