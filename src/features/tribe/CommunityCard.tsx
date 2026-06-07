import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";
import type { Community } from "@/types";

interface Props {
  community: Community;
  onToggleJoin?: (c: Community) => void;
  joining?: boolean;
}

export function CommunityCard({ community, onToggleJoin, joining }: Props) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -3 }} className="h-full">
      <Card
        onClick={() => navigate(ROUTES.communityDetail(community.id))}
        className="flex h-full cursor-pointer flex-col gap-3 p-4 transition-shadow hover:shadow-soft"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-coral/80 to-coral-dark text-lg font-bold text-white">
            {community.imageUrl
              ? <img src={community.imageUrl} alt="" className="h-full w-full object-cover" />
              : community.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{community.name}</p>
            <p className="flex items-center gap-1 text-xs capitalize text-ink-muted">
              {community.category}
              <span className="text-ink-muted/50">·</span>
              <Users className="h-3 w-3" /> {community.membersCount}
            </p>
          </div>
        </div>
        {community.description && (
          <p className="line-clamp-2 text-sm text-ink-soft">{community.description}</p>
        )}
        {onToggleJoin && (
          <div className="mt-auto pt-1">
            <Button
              variant={community.isMember ? "outline" : "primary"}
              size="sm"
              isLoading={joining}
              onClick={(e) => { e.stopPropagation(); onToggleJoin(community); }}
              className={cn(community.isMember && "text-ink-soft")}
            >
              {community.isMember ? "Joined" : "Join"}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
