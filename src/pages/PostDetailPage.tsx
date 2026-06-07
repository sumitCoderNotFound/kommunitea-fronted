import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { PostCard } from "@/features/posts/PostCard";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { postService } from "@/services/postService";
import type { Post } from "@/types";

export function PostDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getById(id),
    enabled: !!id,
  });

  // Keep the single-post cache in sync when liking/saving from the detail view.
  const patch = (updated: Post) => qc.setQueryData(["post", id], updated);
  const like = useMutation({ mutationFn: () => postService.toggleLike(id), onSuccess: patch });
  const save = useMutation({ mutationFn: () => postService.toggleSave(id), onSuccess: patch });

  if (isLoading) return <Loader label="Loading post..." />;
  if (isError || !post) {
    return <EmptyState icon={FileText} title="Post not available"
      description="This post may have been deleted or is no longer visible to you." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PostCard post={post} onLike={() => like.mutate()} onSave={() => save.mutate()} />
    </div>
  );
}
