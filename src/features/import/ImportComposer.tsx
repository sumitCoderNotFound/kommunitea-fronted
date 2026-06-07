import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Link2, Instagram, Linkedin, Globe, MessageCircle, FileText, Briefcase,
  ClipboardList, Users, Bookmark, AlertTriangle, ArrowLeft, Send,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useUIStore } from "@/store/uiStore";
import { useToast } from "@/hooks/useToast";
import { communityService } from "@/services/communityService";
import { messageService } from "@/services/messageService";
import {
  externalShareService, type SharePreview, type ShareDestination, type SharePlatform,
} from "@/services/externalShareService";
import { ROUTES } from "@/constants";

const PLATFORM_ICON: Record<SharePlatform, typeof Globe> = {
  instagram: Instagram, linkedin: Linkedin, whatsapp: MessageCircle, website: Globe, text: FileText,
};

// Destinations supported end-to-end on web today (story/message need media/recipient pickers — later).
const DEST_META: Record<string, { label: string; icon: typeof FileText }> = {
  post: { label: "Post to my profile", icon: FileText },
  community_resource: { label: "Share in a community", icon: Users },
  message: { label: "Send to someone", icon: Send },
  plan: { label: "Save to Plan", icon: ClipboardList },
  job_application: { label: "Add as job / application", icon: Briefcase },
  saved: { label: "Just save for later", icon: Bookmark },
};
const SUPPORTED: ShareDestination[] = ["post", "community_resource", "message", "plan", "job_application", "saved"];

export function ImportComposer() {
  const open = useUIStore((s) => s.isImportOpen);
  const setOpen = useUIStore((s) => s.setImportOpen);
  const initial = useUIStore((s) => s.importInitial);
  const toast = useToast();
  const navigate = useNavigate();

  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<SharePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<ShareDestination | null>(null);
  const [pickingCommunity, setPickingCommunity] = useState(false);
  const [pickingRecipient, setPickingRecipient] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Seed from a shared payload (PWA share target / mobile share intent) and auto-preview.
  useEffect(() => {
    if (open && initial && !raw && !preview) {
      setRaw(initial);
      void runPreviewWith(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const myCommunities = useQuery({
    queryKey: ["communities", "mine"],
    queryFn: () => communityService.list({ mine: true }),
    enabled: open && pickingCommunity,
  });
  const myConversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageService.conversations(),
    enabled: open && pickingRecipient,
  });

  const reset = () => {
    setRaw(""); setPreview(null); setLoading(false); setCreating(null);
    setPickingCommunity(false); setPickingRecipient(false); setPreviewFailed(false);
  };
  const close = () => { setOpen(false); reset(); };

  const looksLikeUrl = (s: string) => /^https?:\/\//i.test(s.trim());

  const runPreviewWith = async (value: string) => {
    value = value.trim();
    if (!value) return;
    setLoading(true); setPreviewFailed(false);
    const isUrl = looksLikeUrl(value);
    try {
      const data = await externalShareService.preview(isUrl ? { url: value } : { text: value });
      setPreview(data);
    } catch {
      // Preview failed — still let the user proceed manually (spec requirement).
      setPreviewFailed(true);
      setPreview({
        sourcePlatform: isUrl ? "website" : "text",
        sourceUrl: isUrl ? value : "", sourceText: isUrl ? "" : value, sourceImage: "",
        title: isUrl ? value : value.slice(0, 120), description: isUrl ? "" : value, thumbnail: "",
        suggestedDestinations: ["post", "saved"], attribution: "Imported link",
      });
    } finally {
      setLoading(false);
    }
  };
  const runPreview = () => runPreviewWith(raw);

  const submit = async (destination: ShareDestination, communityId?: string) => {
    if (!preview) return;
    setCreating(destination);
    try {
      const share = await externalShareService.create({
        sourcePlatform: preview.sourcePlatform,
        sourceUrl: preview.sourceUrl, sourceText: preview.sourceText, sourceImage: preview.sourceImage,
        title: preview.title, description: preview.description, thumbnail: preview.thumbnail,
        destinationType: destination, communityId,
      });
      toast.success("Imported to Kommunitea");
      close();
      // Take the user to what they just created.
      if (destination === "post") navigate(ROUTES.feed);
      else if (destination === "job_application" || destination === "plan") navigate(`${ROUTES.plan}#applications`);
      else if (destination === "community_resource" && communityId) navigate(ROUTES.communityDetail(communityId));
      void share;
    } catch (e) {
      toast.error("Couldn't import: " + (e as Error).message);
    } finally {
      setCreating(null);
    }
  };

  const sendToConversation = async (conversationId: string) => {
    if (!preview) return;
    setCreating("message");
    const body = [preview.title, preview.sourceUrl || preview.sourceText, `(${preview.attribution})`]
      .filter(Boolean).join("\n");
    try {
      await messageService.send(conversationId, body);
      await externalShareService.create({
        sourcePlatform: preview.sourcePlatform, sourceUrl: preview.sourceUrl,
        sourceText: preview.sourceText, sourceImage: preview.sourceImage,
        title: preview.title, description: preview.description, thumbnail: preview.thumbnail,
        destinationType: "message",
      });
      toast.success("Sent");
      close();
      navigate(ROUTES.inboxThread(conversationId));
    } catch (e) {
      toast.error("Couldn't send: " + (e as Error).message);
    } finally {
      setCreating(null);
    }
  };

  const PlatformIcon = preview ? PLATFORM_ICON[preview.sourcePlatform] : Link2;
  const orderedDests = preview
    ? [...preview.suggestedDestinations.filter((d) => SUPPORTED.includes(d)),
       ...SUPPORTED.filter((d) => !preview.suggestedDestinations.includes(d))]
    : [];

  return (
    <Modal open={open} onClose={close} title="Import from link">
      {/* STEP 1 — paste */}
      {!preview ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Paste a link or text from Instagram, LinkedIn, WhatsApp or any website. We only import what you paste — nothing is scraped.
          </p>
          <textarea
            value={raw} onChange={(e) => setRaw(e.target.value)} rows={3} autoFocus
            placeholder="Paste a link or message…"
            className="w-full resize-none rounded-xl border border-sand-border bg-sand-card px-3 py-2.5 text-sm focus-visible:focus-ring"
          />
          <Button fullWidth isLoading={loading} disabled={!raw.trim()} onClick={runPreview}>
            <Link2 className="h-4 w-4" /> Preview
          </Button>
        </div>
      ) : (
        /* STEP 2 — preview + destination */
        <div className="space-y-4">
          {previewFailed && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>We couldn't fetch a rich preview, but you can still import it as a link.</span>
            </div>
          )}

          {/* Preview card */}
          <div className="overflow-hidden rounded-xl border border-sand-border bg-sand-card">
            {preview.thumbnail && (
              <img src={preview.thumbnail} alt="" className="max-h-44 w-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            )}
            <div className="space-y-1 p-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                <PlatformIcon className="h-3 w-3" /> {preview.attribution}
              </span>
              {preview.title && <p className="line-clamp-2 text-sm font-semibold">{preview.title}</p>}
              {preview.description && <p className="line-clamp-3 text-xs text-ink-muted">{preview.description}</p>}
              {preview.sourceUrl && <p className="truncate text-[11px] text-coral">{preview.sourceUrl}</p>}
            </div>
          </div>

          {/* Community sub-picker */}
          {pickingCommunity ? (
            <div className="space-y-2">
              <button onClick={() => setPickingCommunity(false)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
                <ArrowLeft className="h-3 w-3" /> Back to destinations
              </button>
              <p className="text-sm font-medium">Choose a community</p>
              {myCommunities.isLoading ? (
                <p className="text-sm text-ink-muted">Loading your communities…</p>
              ) : (myCommunities.data?.results.length ?? 0) === 0 ? (
                <p className="text-sm text-ink-muted">Join a community first to share resources there.</p>
              ) : (
                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {myCommunities.data!.results.map((c) => (
                    <button key={c.id} disabled={!!creating}
                      onClick={() => submit("community_resource", String(c.id))}
                      className="flex w-full items-center gap-3 rounded-xl border border-sand-border bg-sand-card p-2.5 text-left hover:border-coral disabled:opacity-60">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral/10 text-sm font-bold text-coral">{c.name.charAt(0)}</div>
                      <span className="truncate text-sm font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : pickingRecipient ? (
            <div className="space-y-2">
              <button onClick={() => setPickingRecipient(false)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
                <ArrowLeft className="h-3 w-3" /> Back to destinations
              </button>
              <p className="text-sm font-medium">Send to</p>
              {myConversations.isLoading ? (
                <p className="text-sm text-ink-muted">Loading your chats…</p>
              ) : (myConversations.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-ink-muted">No conversations yet. Start one from someone's profile first.</p>
              ) : (
                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {myConversations.data!.map((c) => (
                    <button key={c.id} disabled={!!creating}
                      onClick={() => sendToConversation(c.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-sand-border bg-sand-card p-2.5 text-left hover:border-coral disabled:opacity-60">
                      <Avatar name={c.displayTitle || c.otherUser?.fullName || c.title || "Chat"} src={c.imageUrl || c.otherUser?.avatarUrl} size="sm" />
                      <span className="truncate text-sm font-medium">{c.displayTitle || c.otherUser?.fullName || c.title || "Conversation"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Destination bottom sheet */
            <div className="space-y-2">
              <p className="text-sm font-medium">Where should this go?</p>
              <div className="space-y-1.5">
                {orderedDests.map((d) => {
                  const meta = DEST_META[d];
                  const Icon = meta.icon;
                  return (
                    <button key={d} disabled={!!creating}
                      onClick={() => (d === "community_resource" ? setPickingCommunity(true)
                        : d === "message" ? setPickingRecipient(true) : submit(d))}
                      className="flex w-full items-center gap-3 rounded-xl border border-sand-border bg-sand-card p-3 text-left transition-colors hover:border-coral disabled:opacity-60">
                      <Icon className="h-4 w-4 text-coral" />
                      <span className="flex-1 text-sm font-medium">{meta.label}</span>
                      {creating === d && <span className="text-xs text-ink-muted">…</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={reset} className="text-xs text-ink-muted hover:text-ink">← Paste a different link</button>
            </div>
          )}

          <p className="text-[11px] text-ink-muted/80">
            You're responsible for content you import. Don't share private or copyrighted material without permission.
          </p>
        </div>
      )}
    </Modal>
  );
}
