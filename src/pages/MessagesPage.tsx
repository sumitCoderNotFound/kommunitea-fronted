import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { messageService } from "@/services/messageService";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

export function MessagesPage() {
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"inbox" | "requests">("inbox");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"], queryFn: messageService.conversations, refetchInterval: 5000,
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["msg-requests"], queryFn: messageService.requests, refetchInterval: 8000,
  });

  useEffect(() => {
    const userId = params.get("user");
    if (userId) messageService.start(userId).then((c) => { setActiveId(c.id); qc.invalidateQueries({ queryKey: ["conversations"] }); });
  }, [params, qc]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId], queryFn: () => messageService.messages(activeId!),
    enabled: !!activeId, refetchInterval: 3000,
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useMutation({
    mutationFn: (body: string) => messageService.send(activeId!, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages", activeId] }); qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
  const accept = useMutation({
    mutationFn: (id: string) => messageService.accept(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["msg-requests"] }); qc.invalidateQueries({ queryKey: ["conversations"] }); setTab("inbox"); },
  });

  const submit = () => { const b = text.trim(); if (!b || !activeId) return; send.mutate(b); setText(""); };
  const list = tab === "inbox" ? conversations : requests;
  const active = [...conversations, ...requests].find((c) => c.id === activeId);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 font-display text-2xl font-bold">Messages</h1>
      <Card className="flex h-[70vh] overflow-hidden p-0">
        {/* List column */}
        <div className={cn("flex w-full flex-col border-r border-sand-border sm:w-72", activeId && "hidden sm:flex")}>
          {/* Inbox / Requests tabs */}
          <div className="flex border-b border-sand-border">
            <button onClick={() => setTab("inbox")}
              className={cn("flex-1 py-3 text-sm font-medium", tab === "inbox" ? "border-b-2 border-coral text-coral" : "text-ink-muted")}>
              Inbox
            </button>
            <button onClick={() => setTab("requests")}
              className={cn("relative flex-1 py-3 text-sm font-medium", tab === "requests" ? "border-b-2 border-coral text-coral" : "text-ink-muted")}>
              Requests
              {requests.length > 0 && <span className="ml-1 rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">{requests.length}</span>}
            </button>
          </div>

          {isLoading ? <Loader /> : list.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={MessageSquare}
                title={tab === "inbox" ? "No messages yet" : "No requests"}
                description={tab === "inbox" ? "Visit a member's profile and tap Message to start a chat." : "Messages from people you don't follow show up here first."} />
            </div>
          ) : (
            <div className="divide-y divide-sand-border overflow-y-auto">
              {list.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className={cn("flex w-full items-center gap-3 p-3 text-left hover:bg-sand", activeId === c.id && "bg-sand")}>
                  <Avatar name={c.otherUser?.fullName ?? "?"} src={c.otherUser?.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.otherUser?.fullName}</p>
                    <p className="truncate text-xs text-ink-muted">{c.lastMessage?.body ?? "Say hi 👋"}</p>
                  </div>
                  {c.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">{c.unreadCount}</span>}
                </button>
              ))}
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
                <button className="sm:hidden" onClick={() => setActiveId(null)}><ArrowLeft className="h-5 w-5" /></button>
                <Avatar name={active?.otherUser?.fullName ?? "?"} src={active?.otherUser?.avatarUrl} size="sm" />
                <p className="font-medium">{active?.otherUser?.fullName}</p>
              </div>

              {/* If this is a pending request I received, show accept banner */}
              {active?.isRequest && active.initiatorId !== me?.id && (
                <div className="flex items-center justify-between gap-3 border-b border-sand-border bg-coral/5 p-3">
                  <p className="text-sm text-ink-soft">Accept this message request to start chatting.</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => accept.mutate(active.id)}
                    className="flex items-center gap-1 rounded-full bg-coral px-3 py-1.5 text-sm font-medium text-white">
                    <Check className="h-4 w-4" /> Accept
                  </motion.button>
                </div>
              )}

              <div className="flex-1 space-y-2 overflow-y-auto bg-sand/40 p-4">
                {messages.map((m) => {
                  const mine = m.sender.id === me?.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        mine ? "rounded-br-md bg-coral text-white" : "rounded-bl-md border border-sand-border bg-white text-ink")}>
                        {m.body}
                        <span className={cn("mt-0.5 block text-[10px]", mine ? "text-white/70" : "text-ink-muted")}>{timeAgo(m.createdAt)}</span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-sand-border p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Type a message..." className="h-10 flex-1 rounded-full border border-sand-border bg-white px-4 text-sm focus-visible:focus-ring" />
                <EmojiPicker onPick={(e) => setText((t) => t + e)} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={submit}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-white"><Send className="h-4 w-4" /></motion.button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
