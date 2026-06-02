import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import { PostCard } from "@/features/posts/PostCard";
import { RightRail } from "@/features/feed/RightRail";
import { StoriesBar } from "@/features/stories/StoriesBar";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CATEGORIES } from "@/constants";
import { cn } from "@/utils/cn";
import { listStagger, popIn, springy } from "@/utils/motion";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { usePosts, useToggleLike, useToggleSave } from "@/hooks/usePosts";
import type { PostCategory } from "@/types";

export function FeedPage() {
  const [params, setParams] = useSearchParams();
  const activeCategory = (params.get("category") as PostCategory) || undefined;
  const { user } = useAuthStore();
  const setCreatePostOpen = useUIStore((s) => s.setCreatePostOpen);

  const { data, isLoading } = usePosts({ category: activeCategory });
  const like = useToggleLike();
  const save = useToggleSave();
  const posts = data?.results ?? [];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4">
        <StoriesBar />
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={springy}>
          <Card className="flex items-center gap-3 p-4">
            <Avatar name={user?.fullName ?? "You"} src={user?.avatarUrl} />
            <button
              onClick={() => setCreatePostOpen(true)}
              className="flex-1 rounded-xl border border-sand-border bg-sand px-4 py-2.5 text-left text-sm text-ink-muted transition-colors hover:border-coral"
            >
              Share something with the tribe...
            </button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setCreatePostOpen(true)} className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> Post
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          <Chip active={!activeCategory} onClick={() => setParams({})}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.value} active={activeCategory === c.value} onClick={() => setParams({ category: c.value })}>
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>

        {isLoading ? (
          <Loader label="Loading the feed..." />
        ) : posts.length === 0 ? (
          <EmptyState icon={Inbox} title="Nothing here yet"
            description="Be the first to post in this category and get the conversation going."
            action={<Button onClick={() => setCreatePostOpen(true)}>Create a post</Button>} />
        ) : (
          <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-4">
            {posts.map((post) => (
              <motion.div key={post.id} variants={popIn} layout>
                <PostCard post={post} onLike={(id) => like.mutate(id)} onSave={(id) => save.mutate(id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <RightRail />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.92 }} whileHover={{ y: -2 }} onClick={onClick}
      className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-coral bg-coral text-white shadow-soft" : "border-sand-border bg-white text-ink-soft hover:border-coral")}>
      {children}
    </motion.button>
  );
}
