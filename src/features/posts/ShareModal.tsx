import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link2, Share2, BookImage, Send, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { messageService } from "@/services/messageService";
import { postService } from "@/services/postService";
import { useToast } from "@/hooks/useToast";
import type { Post } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export function ShareModal({ open, onClose, post }: Props) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const url = `${window.location.origin}/posts/${post.id}`;

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: messageService.conversations,
    enabled: open,
  });

  const sendTo = useMutation({
    mutationFn: (conversationId: string) => messageService.sendShared(conversationId, {
      kind: "shared_post",
      sharedId: post.id,
      sharedPayload: { body: post.body?.slice(0, 140), author: post.author.fullName, imageUrl: post.imageUrl },
      body: "",
    }),
    onSuccess: () => { toast.success("Shared to chat"); onClose(); },
    onError: (e) => toast.error("Couldn't share: " + (e as Error).message),
  });

  const addToStory = useMutation({
    mutationFn: () => postService.addToStory(post.id),
    onSuccess: () => { toast.success("Added to your story"); onClose(); },
    onError: (e) => toast.error("Couldn't add to story: " + (e as Error).message),
  });

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Link copied 🔗"); }
    catch { toast.error("Couldn't copy link"); }
  };
  const nativeShare = async () => {
    try { if (navigator.share) { await navigator.share({ title: "Kommunitea", url }); } }
    catch { /* user dismissed */ }
  };

  const filtered = conversations.filter((c) =>
    !q.trim() || (c.otherUser?.fullName ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal open={open} onClose={onClose} title="Share">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}><Link2 className="h-4 w-4" /> Copy link</Button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button variant="outline" size="sm" onClick={nativeShare}><Share2 className="h-4 w-4" /> Share via…</Button>
          )}
          {(post.allowShareToStory ?? true) && post.visibility !== "private" && (
            <Button variant="outline" size="sm" isLoading={addToStory.isPending} onClick={() => addToStory.mutate()}>
              <BookImage className="h-4 w-4" /> Add to story
            </Button>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Send to a chat</p>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats..."
              className="h-10 w-full rounded-xl border border-sand-border bg-sand-card pl-9 pr-3 text-sm focus-visible:focus-ring" />
          </div>
          {isLoading ? <Loader /> : filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-muted">No chats yet. Start a conversation from someone's profile first.</p>
          ) : (
            <div className="max-h-56 divide-y divide-sand-border overflow-y-auto rounded-xl border border-sand-border">
              {filtered.map((c) => (
                <button key={c.id} disabled={sendTo.isPending}
                  onClick={() => sendTo.mutate(c.id)}
                  className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-sand disabled:opacity-50">
                  <Avatar name={c.otherUser?.fullName ?? "Chat"} src={c.otherUser?.avatarUrl} size="sm" />
                  <span className="flex-1 truncate text-sm">{c.otherUser?.fullName ?? "Group chat"}</span>
                  <Send className="h-4 w-4 text-ink-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
