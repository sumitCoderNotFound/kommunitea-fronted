import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, UserPlus, Clock, Mail, BellOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { notificationService } from "@/services/notificationService";
import { timeAgo } from "@/utils/format";
import { ROUTES } from "@/constants";

const icons = { like: Heart, comment: MessageCircle, follow: UserPlus, request: Clock, message: Mail };

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationService.list });

  useEffect(() => {
    notificationService.readAll().then(() => qc.invalidateQueries({ queryKey: ["notif-count"] }));
  }, [qc]);

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
              <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-4 ${!n.isRead ? "bg-coral/5" : ""}`}>
                <Link to={ROUTES.profile(n.actor.id)}><Avatar name={n.actor.fullName} src={n.actor.avatarUrl} size="sm" /></Link>
                <p className="flex-1 text-sm">
                  <Link to={ROUTES.profile(n.actor.id)} className="font-semibold hover:underline">{n.actor.fullName}</Link>{" "}
                  {n.verbDisplay}{n.text ? `: ${n.text}` : ""}
                </p>
                <Icon className="h-4 w-4 text-ink-muted" />
                <span className="whitespace-nowrap text-xs text-ink-muted">{timeAgo(n.createdAt)}</span>
              </motion.div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
