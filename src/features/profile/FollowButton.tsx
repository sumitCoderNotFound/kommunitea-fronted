import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { profileService } from "@/services/profileService";
import type { User } from "@/types";

type State = "none" | "following" | "requested";

export function FollowButton({ user }: { user: User }) {
  const initial: State = user.isFollowing ? "following" : user.hasRequested ? "requested" : "none";
  const [state, setState] = useState<State>(initial);
  const qc = useQueryClient();

  // refresh anything that shows follower/following counts or follow state
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["suggested-members"] });
  };

  const follow = useMutation({
    mutationFn: () => profileService.follow(user.id),
    onSuccess: (res: { status?: State } | undefined) => {
      setState(res?.status ?? (user.isPrivate ? "requested" : "following"));
      refresh();
    },
  });
  const unfollow = useMutation({
    mutationFn: () => profileService.unfollow(user.id),
    onSuccess: () => { setState("none"); refresh(); },
  });

  if (state === "following") {
    return (
      <motion.div whileTap={{ scale: 0.96 }}>
        <Button size="sm" variant="outline" onClick={() => unfollow.mutate()}>
          <Check className="h-4 w-4" /> Following
        </Button>
      </motion.div>
    );
  }
  if (state === "requested") {
    return (
      <Button size="sm" variant="outline" onClick={() => unfollow.mutate()}>
        <Clock className="h-4 w-4" /> Requested
      </Button>
    );
  }
  return (
    <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}>
      <Button size="sm" onClick={() => follow.mutate()} isLoading={follow.isPending}>
        <UserPlus className="h-4 w-4" /> {user.isPrivate ? "Request" : "Follow"}
      </Button>
    </motion.div>
  );
}
