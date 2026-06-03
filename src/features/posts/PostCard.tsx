import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Send, MoreHorizontal, Flag, Ban } from "lucide-react";
import type { Post } from "@/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/Badge";
import { ROUTES, CATEGORIES } from "@/constants";
import { timeAgo, compactNumber } from "@/utils/format";
import { cn } from "@/utils/cn";
import { snappy } from "@/utils/motion";
import { useComment } from "@/hooks/usePosts";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/authStore";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { moderationService } from "@/services/moderationService";

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function PostCard({ post, onLike, onSave }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.isSaved);
  const [burst, setBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(post.comments ?? []);
  const category = CATEGORIES.find((c) => c.value === post.category);
  const comment = useComment();
  const toast = useToast();
  const me = useAuthStore((s) => s.user);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : n - 1));
    if (next) { setBurst(true); setTimeout(() => setBurst(false), 450); }
    onLike?.(post.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Kommunitea", url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied to clipboard 🔗"); }
    } catch { /* user cancelled */ }
  };

  const submitComment = () => {
    const body = commentText.trim();
    if (!body) return;
    comment.mutate({ id: post.id, body });
    setLocalComments((c) => [...c, {
      id: `tmp-${Date.now()}`,
      author: { id: me?.id ?? "me", fullName: me?.fullName ?? "You", avatarUrl: me?.avatarUrl, university: me?.university },
      body, createdAt: new Date().toISOString(),
    }]);
    setCommentText("");
  };

  const isMine = me?.id === post.author.id;
  const handleReport = async () => {
    try { await moderationService.report({ targetType: "post", targetId: Number(post.id), reason: "inappropriate" }); toast.success("Reported. Our team will review it."); }
    catch (e) { toast.error((e as Error).message); }
    setMenuOpen(false);
  };
  const handleBlock = async () => {
    try { await moderationService.block(post.author.id); toast.success(`Blocked ${post.author.fullName}`); }
    catch (e) { toast.error((e as Error).message); }
    setMenuOpen(false);
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={snappy}>
      <Card className="p-5 transition-shadow hover:shadow-card">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.profile(post.author.id)}>
            <Avatar name={post.author.fullName} src={post.author.avatarUrl} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link to={ROUTES.profile(post.author.id)} className="truncate font-semibold text-ink hover:underline">
                {post.author.fullName}
              </Link>
              {post.author.badge && <VerifiedBadge type={post.author.badge} />}
            </div>
            <p className="truncate text-xs text-ink-muted">{post.author.university} · {timeAgo(post.createdAt)}</p>
          </div>
          {category && <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink-soft">{category.label}</span>}
          {!isMine && (
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="rounded-lg p-1 text-ink-muted hover:bg-ink/5">
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="absolute right-0 top-8 z-40 w-40 overflow-hidden rounded-xl border border-sand-border bg-sand-card py-1 shadow-lift">
                      <button onClick={handleReport} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-sand">
                        <Flag className="h-4 w-4" /> Report post
                      </button>
                      <button onClick={handleBlock} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Ban className="h-4 w-4" /> Block user
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">{post.body}</p>
        {post.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-sand-border">
            <img src={post.imageUrl} alt="" className="max-h-[480px] w-full object-cover" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-1 border-t border-sand-border pt-3 text-sm">
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleLike}
            className={cn("relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-ink/5", liked ? "text-coral" : "text-ink-muted")}>
            <motion.span animate={burst ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.4 }}>
              <Heart className={cn("h-[18px] w-[18px]", liked && "fill-coral")} />
            </motion.span>
            {compactNumber(likes)}
            {burst && <motion.span initial={{ opacity: 1, scale: 0.5, y: 0 }} animate={{ opacity: 0, scale: 1.6, y: -18 }} transition={{ duration: 0.45 }} className="pointer-events-none absolute left-2 top-0 text-coral">❤</motion.span>}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowComments((s) => !s)}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-ink/5", showComments ? "text-coral" : "text-ink-muted")}>
            <MessageCircle className="h-[18px] w-[18px]" /> {compactNumber(post.commentsCount + (localComments.length - (post.comments?.length ?? 0)))}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ink-muted transition-colors hover:bg-ink/5">
            <Share2 className="h-[18px] w-[18px]" /> Share
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setSaved((p) => !p); onSave?.(post.id); }}
            className={cn("ml-auto rounded-lg px-3 py-1.5 transition-colors hover:bg-ink/5", saved ? "text-coral" : "text-ink-muted")}>
            <Bookmark className={cn("h-[18px] w-[18px]", saved && "fill-coral")} />
          </motion.button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="mt-3 space-y-3 border-t border-sand-border pt-3">
                {localComments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar name={c.author.fullName} src={c.author.avatarUrl} size="xs" />
                    <div className="rounded-2xl bg-sand px-3 py-2">
                      <p className="text-xs font-semibold">{c.author.fullName}</p>
                      <p className="text-sm text-ink-soft">{c.body}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Avatar name={me?.fullName ?? "You"} src={me?.avatarUrl} size="xs" />
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitComment()}
                    placeholder="Write a comment..."
                    className="h-9 flex-1 rounded-full border border-sand-border bg-sand-card px-4 text-sm focus-visible:focus-ring" />
                  <EmojiPicker onPick={(e) => setCommentText((c) => c + e)} />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={submitComment}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
