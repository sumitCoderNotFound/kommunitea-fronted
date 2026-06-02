import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService, type PostFilters } from "@/services/postService";
import type { Paginated, Post } from "@/types";

export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: ["posts", filters],
    queryFn: () => postService.list(filters),
  });
}

export function useMyPosts() {
  return useQuery({ queryKey: ["posts", "mine"], queryFn: postService.myPosts });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleLike(id),
    onSuccess: (updated) => {
      // Patch the single post in every cached posts list so the like count is instant
      qc.setQueriesData<Paginated<Post>>({ queryKey: ["posts"] }, (old) => {
        if (!old?.results) return old;
        return { ...old, results: old.results.map((p) => (p.id === updated.id ? updated : p)) };
      });
    },
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleSave(id),
    onSuccess: (updated) => {
      qc.setQueriesData<Paginated<Post>>({ queryKey: ["posts"] }, (old) => {
        if (!old?.results) return old;
        return { ...old, results: old.results.map((p) => (p.id === updated.id ? updated : p)) };
      });
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postService.create,
    onSuccess: (newPost) => {
      // Show the new post IMMEDIATELY by prepending it to every cached feed
      qc.setQueriesData<Paginated<Post>>({ queryKey: ["posts"] }, (old) => {
        if (!old?.results) return old;
        return { ...old, count: old.count + 1, results: [newPost, ...old.results] };
      });
      // And refetch in the background to stay in sync with the server
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => postService.comment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}
