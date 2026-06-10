import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/hooks/useToast";
import { clipsService } from "@/services/clipsService";

export function ClipCommentsSheet({ clipId, onClose }: { clipId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [body, setBody] = useState("");
  const { data: comments = [], isLoading } = useQuery({ queryKey: ["clip-comments", clipId], queryFn: () => clipsService.comments(clipId) });

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setBody("");
    try { await clipsService.addComment(clipId, text); qc.invalidateQueries({ queryKey: ["clip-comments", clipId] }); }
    catch { toast.error("Couldn't post comment."); }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="max-h-[70%] rounded-t-2xl bg-sand-card p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink">Comments</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {isLoading ? <Loader /> : comments.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">No comments yet. Be the first.</p>
          ) : comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar name={c.author.fullName} src={c.author.avatarUrl ?? undefined} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink">{c.author.fullName}</p>
                <p className="text-sm text-ink-soft">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a comment…" className="h-10 flex-1 rounded-full border border-sand-border bg-sand px-4 text-sm focus-visible:focus-ring" />
          <button onClick={submit} className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-white"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
