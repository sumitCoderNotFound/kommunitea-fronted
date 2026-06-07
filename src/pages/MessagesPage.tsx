import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft, Check, X, Users, Hash, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { SharedMessageCard } from "@/features/chat/SharedMessageCard";
import { messageService, type Conversation } from "@/services/messageService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";
import { timeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

type Tab = "primary" | "requests" | "communities" | "groups";

const SHARED_KINDS = new Set(["shared_post", "shared_profile", "shared_job", "shared_community"]);

export function MessagesPage() {
  const [params] = useSearchParams();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("primary");
  const activeId = conversationId ?? null;
  const startedFor = useRef<string | null>(null);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // Lists per tab
  const primaryQ = useQuery({ queryKey: ["conv", "primary"], queryFn: messageService.primary, refetchInterval: 6000 });
  const requestsQ = useQuery({ queryKey: ["conv", "requests"], queryFn: messageService.requests, refetchInterval: 8000 });
  const communitiesQ = useQuery({ queryKey: ["conv", "communities"], queryFn: () => messageService.byKind("community") });
  const groupsQ = useQuery({ queryKey: ["conv", "groups"], queryFn: () => messageService.byKind("group") });

  const listFor: Record<Tab, Conversation[]> = {
    primary: primaryQ.data ?? [],
    requests: requestsQ.data ?? [],
    communities: communitiesQ.data ?? [],
    groups: groupsQ.data ?? [],
  };
  const list = listFor[tab];
  const loadingList = { primary: primaryQ.isLoading, requests: requestsQ.isLoading, communities: communitiesQ.isLoading, groups: groupsQ.isLoading }[tab];

  // Start a DM when arriving via /inbox?user=<id>
  useEffect(() => {
    const userId = params.get("user");
    if (!userId || startedFor.current === userId) return;
    startedFor.current = userId;
    messageService.start(userId)
      .then((c) => { qc.invalidateQueries({ queryKey: ["conv"] }); navigate(ROUTES.inboxThread(c.id)); })
      .catch((e) => toast.error("Couldn't open the chat: " + (e as Error).message));
  }, [params, qc, toast, navigate]);

  // Active conversation header (works no matter which tab it lives in)
  const { data: active } = useQuery({
    queryKey: ["conv-detail", activeId],
    queryFn: () => messageService.get(activeId!),
    enabled: !!activeId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId], queryFn: () => messageService.messages(activeId!),
    enabled: !!activeId, refetchInterval: 3000,
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useMutation({
    mutationFn: (body: string) => messageService.send(activeId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conv"] });
    },
    onError: (e) => toast.error("Message failed to send: " + (e as Error).message),
  });
  const sendImage = useMutation({
    mutationFn: (file: File) => messageService.sendImage(activeId!, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conv"] });
    },
    onError: (e) => toast.error("Couldn't send image: " + (e as Error).message),
  });
  const accept = useMutation({
    mutationFn: (id: string) => messageService.accept(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conv"] }); setTab("primary"); },
  });
  const decline = useMutation({
    mutationFn: (id: string) => messageService.decline(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conv"] }); navigate(ROUTES.inbox); },
  });

  const submit = () => { const b = text.trim(); if (!b || !activeId) return; send.mutate(b); setText(""); };
  const title = (c: Conversation) => c.displayTitle || c.otherUser?.fullName || c.title || "Conversation";

  const tabs: [Tab, string, number][] = [
    ["primary", "Primary", 0],
    ["requests", "Requests", requestsQ.data?.length ?? 0],
    ["communities", "Communities", 0],
    ["groups", "Groups", 0],
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 font-display text-2xl font-bold">Inbox</h1>
      <Card className="flex h-[72vh] overflow-hidden p-0">
        {/* List column */}
        <div className={cn("flex w-full flex-col border-r border-sand-border sm:w-80", activeId && "hidden sm:flex")}>
          <div className="flex border-b border-sand-border">
            {tabs.map(([key, label, badge]) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn("relative flex-1 py-3 text-xs font-medium sm:text-sm", tab === key ? "border-b-2 border-coral text-coral" : "text-ink-muted")}>
                {label}
                {badge > 0 && <span className="ml-1 rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">{badge}</span>}
              </button>
            ))}
          </div>

          {loadingList ? <Loader /> : list.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={MessageSquare}
                title={tab === "requests" ? "No requests" : "No conversations"}
                description={tab === "requests" ? "Messages from people you don't follow show up here." : "Start a chat from someone's profile, a community, or by sharing a post."} />
            </div>
          ) : (
            <div className="divide-y divide-sand-border overflow-y-auto">
              {list.map((c) => {
                const GroupIcon = c.kind === "community" ? Hash : Users;
                return (
                  <button key={c.id} onClick={() => navigate(ROUTES.inboxThread(c.id))}
                    className={cn("flex w-full items-center gap-3 p-3 text-left hover:bg-sand", activeId === c.id && "bg-sand")}>
                    {c.kind === "direct" || !c.kind ? (
                      <Avatar name={c.otherUser?.fullName ?? "?"} src={c.otherUser?.avatarUrl} size="sm" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/10 text-coral"><GroupIcon className="h-4 w-4" /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{title(c)}</p>
                      <p className="truncate text-xs text-ink-muted">{c.lastMessage?.body || (SHARED_KINDS.has(c.lastMessage?.kind ?? "") ? "Shared an item" : "Say hi 👋")}</p>
                    </div>
                    {c.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">{c.unreadCount}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat column */}
        <div className={cn("flex flex-1 flex-col", !activeId && "hidden sm:flex")}>
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-muted">Select a conversation</div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-sand-border p-3">
                <button className="sm:hidden" onClick={() => navigate(ROUTES.inbox)}><ArrowLeft className="h-5 w-5" /></button>
                {active && (active.kind === "direct" || !active.kind) ? (
                  <Avatar name={active?.otherUser?.fullName ?? "?"} src={active?.otherUser?.avatarUrl} size="sm" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/10 text-coral"><Users className="h-4 w-4" /></span>
                )}
                <p className="font-medium">{active ? title(active) : "Conversation"}</p>
              </div>

              {/* Request accept/decline banner */}
              {active?.isRequest && active.initiatorId !== me?.id && (
                <div className="flex items-center justify-between gap-3 border-b border-sand-border bg-coral/5 p-3">
                  <p className="text-sm text-ink-soft">Accept this message request to start chatting.</p>
                  <div className="flex gap-2">
                    <button onClick={() => decline.mutate(active.id)}
                      className="flex items-center gap-1 rounded-full border border-sand-border px-3 py-1.5 text-sm text-ink-soft hover:bg-sand">
                      <X className="h-4 w-4" /> Decline
                    </button>
                    <button onClick={() => accept.mutate(active.id)}
                      className="flex items-center gap-1 rounded-full bg-coral px-3 py-1.5 text-sm font-medium text-white">
                      <Check className="h-4 w-4" /> Accept
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto bg-sand/40 p-4">
                {messages.map((m) => {
                  const mine = m.sender.id === me?.id;
                  const isShared = SHARED_KINDS.has(m.kind ?? "");
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      {isShared ? (
                        <SharedMessageCard message={m} mine={mine} />
                      ) : (
                        <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                          mine ? "rounded-br-md bg-coral text-white" : "rounded-bl-md border border-sand-border bg-sand-card text-ink")}>
                          {m.imageUrl && <img src={m.imageUrl} alt="" className="mb-1 max-h-60 rounded-lg" />}
                          {m.body}
                          <span className={cn("mt-0.5 block text-[10px]", mine ? "text-white/70" : "text-ink-muted")}>{timeAgo(m.createdAt)}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Composer (hidden while a pending request is unaccepted) */}
              {!(active?.isRequest && active.initiatorId !== me?.id) && (
                <div className="flex items-center gap-2 border-t border-sand-border p-3">
                  <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Type a message..." className="h-10 flex-1 rounded-full border border-sand-border bg-sand-card px-4 text-sm focus-visible:focus-ring" />
                  <input ref={imageRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) sendImage.mutate(f); e.target.value = ""; }} />
                  <button onClick={() => imageRef.current?.click()} className="rounded-full p-2 text-ink-muted hover:bg-ink/5" aria-label="Attach image">
                    <ImagePlus className="h-5 w-5" />
                  </button>
                  <EmojiPicker onPick={(e) => setText((t) => t + e)} />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={submit}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-white"><Send className="h-4 w-4" /></motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
