import { FileText } from "lucide-react";
import { PostCard } from "@/features/posts/PostCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useUIStore } from "@/store/uiStore";
import { useMyPosts, useToggleLike, useToggleSave } from "@/hooks/usePosts";

export function MyPostsPage() {
  const setCreatePostOpen = useUIStore((s) => s.setCreatePostOpen);
  const { data, isLoading } = useMyPosts();
  const like = useToggleLike();
  const save = useToggleSave();
  const posts = data?.results ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-bold">My posts</h1>
      {isLoading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <EmptyState icon={FileText} title="You haven't posted yet"
          description="Share your first post with the community."
          action={<Button onClick={() => setCreatePostOpen(true)}>Create a post</Button>} />
      ) : posts.map((p) => (
        <PostCard key={p.id} post={p} onLike={(id) => like.mutate(id)} onSave={(id) => save.mutate(id)} />
      ))}
    </div>
  );
}
