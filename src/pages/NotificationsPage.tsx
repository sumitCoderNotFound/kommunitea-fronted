import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, Clock, Mail, BellOff, Repeat2, Calendar, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { notificationService, type AppNotification } from "@/services/notificationService";
import { useToast } from "@/hooks/useToast";
import { timeAgo } from "@/utils/format";
import { ROUTES } from "@/constants";

const icons: Record<string, typeof Heart> = {
  like: Heart, comment: MessageCircle, follow: UserPlus, request: Clock, message: Mail,
  follow_accepted: UserPlus, story_like: Heart, story_reply: MessageCircle, story_share: Repeat2,
  streak: Sparkles, reminder: Calendar,
};

/** Resolve the exact in-app destination for a notification, or null if it no longer exists. */
function notificationTarget(n: AppNotification): string | null {
  if (n.conversationId) return ROUTES.inboxThread(n.conversationId);
  if (n.postId) return ROUTES.postDetail(String(n.postId));
  if (n.jobId) return ROUTES.jobDetail(n.jobId);
  if (n.communityId) return ROUTES.communityDetail(n.communityId);
  if (n.referralId || n.targetType === "referral") return ROUTES.planReferrals;
  if (n.targetType === "interview") return ROUTES.planInterview;
  if (["follow", "request", "follow_accepted"].includes(n.verb)) return ROUTES.profile(n.userId || n.actor.id);
  if (n.userId) return ROUTES.profile(n.userId);
  return null;
}

export function NotificationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const { data = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationService.list });

  useEffect(() => {
    notificationService.readAll().then(() => qc.invalidateQueries({ queryKey: ["notif-count"] }));
  }, [qc]);

  const open = (n: AppNotification) => {
    const target = notificationTarget(n);
    if (target) navigate(target);
    else toast.info("This item is no longer available.");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-display text-2xl font-bold">Notifications</h1>
      {isLoading ? <Loader /> : data.length === 0 ? (
        <EmptyState icon={BellOff} title="You are all caught up"
          description="When people like, comment, follow or message you, it shows up here." />
      ) : (
        <Card className="divide-y divide-sand-border p-0">
          {data.map((n) => {
            const Icon = icons[n.verb] ?? Heart;
            return (
              <motion.button key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => open(n)}
                className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-sand ${!n.isRead ? "bg-coral/5" : ""}`}>
                <Link to={ROUTES.profile(n.actor.id)} onClick={(e) => e.stopPropagation()}>
                  <Avatar name={n.actor.fullName} src={n.actor.avatarUrl} size="sm" />
                </Link>
                <p className="flex-1 text-sm">
                  <Link to={ROUTES.profile(n.actor.id)} onClick={(e) => e.stopPropagation()} className="font-semibold hover:underline">
                    {n.actor.fullName}
                  </Link>{" "}
                  {n.verbDisplay}{n.text ? `: ${n.text}` : ""}
                </p>
                <Icon className="h-4 w-4 text-ink-muted" />
                <span className="whitespace-nowrap text-xs text-ink-muted">{timeAgo(n.createdAt)}</span>
              </motion.button>
            );
          })}
        </Card>
      )}
    </div>
  );
}
