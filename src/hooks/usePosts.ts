import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService, type PostFilters } from "@/services/postService";
import type { Paginated, Post } from "@/types";

export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: ["posts", filters],
    queryFn: () => postService.list(filters),
  });
}

// Reshare-aware home feed (array, includes "X reposted" attribution).
export function useFeed() {
  return useQuery({ queryKey: ["feed"], queryFn: postService.feed });
}

export function useMyPosts() {
  return useQuery({ queryKey: ["posts", "mine"], queryFn: postService.myPosts });
}

// Patch a single updated post into both paginated lists (["posts"]) and the feed array (["feed"]).
function patchEverywhere(qc: ReturnType<typeof useQueryClient>, updated: Post) {
  qc.setQueriesData<Paginated<Post>>({ queryKey: ["posts"] }, (old) => {
    if (!old?.results) return old;
    return { ...old, results: old.results.map((p) => (p.id === updated.id ? updated : p)) };
  });
  qc.setQueriesData<Post[]>({ queryKey: ["feed"] }, (old) => {
    if (!Array.isArray(old)) return old;
    return old.map((p) => (p.id === updated.id ? updated : p));
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleLike(id),
    onSuccess: (updated) => patchEverywhere(qc, updated),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleSave(id),
    onSuccess: (updated) => patchEverywhere(qc, updated),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postService.create,
    onSuccess: (newPost) => {
      qc.setQueriesData<Paginated<Post>>({ queryKey: ["posts"] }, (old) => {
        if (!old?.results) return old;
        return { ...old, count: old.count + 1, results: [newPost, ...old.results] };
      });
      qc.setQueriesData<Post[]>({ queryKey: ["feed"] }, (old) => (Array.isArray(old) ? [newPost, ...old] : old));
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => postService.comment(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
