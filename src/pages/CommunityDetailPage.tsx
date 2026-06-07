import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Lock, MessageSquare, Calendar, BookOpen, FileText, Hash, Share2, MoreHorizontal, Link as LinkIcon, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { communityService } from "@/services/communityService";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";
import { timeAgo } from "@/utils/format";
import { cn } from "@/utils/cn";

type Tab = "discussions" | "members" | "events" | "resources" | "chat";

export function CommunityDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("discussions");
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: community, isLoading, isError } = useQuery({
    queryKey: ["community", id],
    queryFn: () => communityService.get(id),
    enabled: !!id,
  });

  const isMember = !!community?.isMember;

  const join = useMutation({
    mutationFn: () => (isMember ? communityService.leave(id) : communityService.join(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community", id] });
      qc.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (e) => toast.error("Couldn't update membership: " + (e as Error).message),
  });

  const openChat = useMutation({
    mutationFn: () => communityService.openChat(id),
    onSuccess: (convo) => navigate(ROUTES.inboxThread(convo.id)),
    onError: (e) => toast.error("Couldn't open chat: " + (e as Error).message),
  });

  const communityUrl = `${window.location.origin}/communities/${id}`;
  const shareCommunity = async () => {
    try {
      if (navigator.share) await navigator.share({ title: community?.name ?? "Kommunitea community", url: communityUrl });
      else { await navigator.clipboard.writeText(communityUrl); toast.success("Community link copied 🔗"); }
    } catch { /* dismissed */ }
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(communityUrl); toast.success("Community link copied 🔗"); }
    catch { toast.error("Couldn't copy link"); }
  };

  if (isLoading) return <Loader label="Loading community..." />;
  if (isError || !community) {
    return <EmptyState icon={Hash} title="Community not available"
      description="This community no longer exists or couldn't be loaded." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <Card className="overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-r from-coral/70 via-coral-dark to-ink" />
        <div className="px-6 pb-5">
          <div className="-mt-8 flex items-end justify-between">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-sand-card text-2xl font-bold text-coral ring-4 ring-white">
              {community.imageUrl
                ? <img src={community.imageUrl} alt="" className="h-full w-full object-cover" />
                : community.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              {isMember && (
                <Button variant="outline" size="sm" isLoading={openChat.isPending} onClick={() => openChat.mutate()}>
                  <MessageSquare className="h-4 w-4" /> Chat
                </Button>
              )}
              <Button variant={isMember ? "outline" : "primary"} size="sm"
                isLoading={join.isPending} onClick={() => join.mutate()}>
                {isMember ? "Joined" : "Join"}
              </Button>
              <Button variant="outline" size="sm" onClick={shareCommunity} aria-label="Share community"><Share2 className="h-4 w-4" /></Button>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setMenuOpen((o) => !o)} aria-label="More"><MoreHorizontal className="h-4 w-4" /></Button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-sand-border bg-sand-card shadow-soft">
                      <button onClick={() => { setMenuOpen(false); copyLink(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-ink/5"><LinkIcon className="h-4 w-4" /> Copy link</button>
                      {isMember && (
                        <button onClick={() => { setMenuOpen(false); join.mutate(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Leave community</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">{community.name}</h1>
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="capitalize">{community.category}</span>
            <span className="text-ink-muted/50">·</span>
            <Users className="h-3.5 w-3.5" /> {community.membersCount} members
          </p>
          {community.description && <p className="mt-3 text-sm text-ink-soft">{community.description}</p>}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-sand-border bg-sand-card p-1">
        {([["discussions", "Discussions"], ["members", "Members"], ["events", "Events"], ["resources", "Resources"], ["chat", "Chat"]] as [Tab, string][])
          .map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn("flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === key ? "bg-coral text-white" : "text-ink-soft hover:bg-ink/5")}>
              {label}
            </button>
          ))}
      </div>

      {/* Non-member gate for member-only sections (discussions are readable by anyone) */}
      {!isMember && tab !== "discussions" ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Lock className="h-8 w-8 text-ink-muted" />
          <p className="font-semibold">Members only</p>
          <p className="max-w-sm text-sm text-ink-muted">Join {community.name} to see members, events, resources and the community chat.</p>
          <Button size="sm" isLoading={join.isPending} onClick={() => join.mutate()}>Join community</Button>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {tab === "discussions" && <FeedTab id={id} isMember={isMember} />}
          {tab === "members" && <MembersTab id={id} />}
          {tab === "events" && <EventsTab id={id} />}
          {tab === "resources" && <ResourcesTab id={id} />}
          {tab === "chat" && (
            <Card className="flex flex-col items-center gap-3 p-8 text-center">
              <MessageSquare className="h-8 w-8 text-coral" />
              <p className="font-semibold">Community chat</p>
              <p className="max-w-sm text-sm text-ink-muted">Real-time group chat for {community.name} members. Opens in your Inbox.</p>
              <Button isLoading={openChat.isPending} onClick={() => openChat.mutate()}>
                <MessageSquare className="h-4 w-4" /> Open chat
              </Button>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

function FeedTab({ id, isMember }: { id: string; isMember: boolean }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [body, setBody] = useState("");
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts", id],
    queryFn: () => communityService.posts(id),
  });
  const create = useMutation({
    mutationFn: (text: string) => communityService.createPost(id, text),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community-posts", id] }); setBody(""); toast.success("Posted to the community"); },
    onError: (e) => toast.error("Couldn't post: " + (e as Error).message),
  });

  return (
    <div className="space-y-3">
      {isMember && (
        <Card className="p-3">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
            placeholder="Share something with this community..."
            className="w-full resize-none rounded-lg border border-sand-border bg-sand-card px-3 py-2 text-sm focus-visible:focus-ring" />
          <div className="mt-2 flex justify-end">
            <Button size="sm" disabled={!body.trim()} isLoading={create.isPending} onClick={() => create.mutate(body.trim())}>Post</Button>
          </div>
        </Card>
      )}

      {isLoading ? <Loader /> : posts.length === 0 ? (
        <EmptyState icon={FileText} title="No posts yet"
          description={isMember ? "Be the first to post in this community." : "Join to see and start discussions."} />
      ) : (
        posts.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center gap-2">
              <Avatar name={p.author.fullName} src={p.author.avatarUrl} size="sm" />
              <div>
                <p className="text-sm font-medium">{p.author.fullName}</p>
                <p className="text-xs text-ink-muted">{timeAgo(p.createdAt)}</p>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{p.body}</p>
          </Card>
        ))
      )}
    </div>
  );
}

function MembersTab({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["community-members", id],
    queryFn: () => communityService.members(id),
  });
  if (isLoading) return <Loader />;
  if (members.length === 0) return <EmptyState icon={Users} title="No members yet" />;
  return (
    <Card className="divide-y divide-sand-border p-0">
      {members.map((m) => (
        <button key={m.id} onClick={() => navigate(ROUTES.profile(m.id))}
          className="flex w-full items-center gap-3 p-3 text-left hover:bg-sand">
          <Avatar name={m.fullName} src={m.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{m.fullName}</p>
            <p className="truncate text-xs text-ink-muted">{m.university || m.city || m.userType}</p>
          </div>
        </button>
      ))}
    </Card>
  );
}

function EventsTab({ id }: { id: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", startsAt: "", location: "" });
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["community-events", id],
    queryFn: () => communityService.events(id),
  });
  const create = useMutation({
    mutationFn: () => communityService.createEvent(id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community-events", id] }); setForm({ title: "", startsAt: "", location: "" }); toast.success("Event added"); },
    onError: (e) => toast.error("Couldn't add event: " + (e as Error).message),
  });
  return (
    <div className="space-y-3">
      <Card className="space-y-2 p-3">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title"
          className="h-10 w-full rounded-lg border border-sand-border bg-sand-card px-3 text-sm focus-visible:focus-ring" />
        <div className="flex flex-wrap gap-2">
          <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            className="h-10 flex-1 rounded-lg border border-sand-border bg-sand-card px-3 text-sm" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location"
            className="h-10 flex-1 rounded-lg border border-sand-border bg-sand-card px-3 text-sm" />
        </div>
        <div className="flex justify-end">
          <Button size="sm" disabled={!form.title.trim()} isLoading={create.isPending} onClick={() => create.mutate()}>Add event</Button>
        </div>
      </Card>
      {isLoading ? <Loader /> : events.length === 0 ? <EmptyState icon={Calendar} title="No events scheduled" /> : (
        events.map((e) => (
          <Card key={e.id} className="p-4">
            <p className="font-semibold">{e.title}</p>
            {e.startsAt && <p className="text-xs text-coral">{new Date(e.startsAt).toLocaleString()}</p>}
            {e.location && <p className="text-xs text-ink-muted">{e.location}</p>}
            {e.description && <p className="mt-1 text-sm text-ink-soft">{e.description}</p>}
          </Card>
        ))
      )}
    </div>
  );
}

function ResourcesTab({ id }: { id: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["community-resources", id],
    queryFn: () => communityService.resources(id),
  });
  const create = useMutation({
    mutationFn: () => communityService.createResource(id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community-resources", id] }); setForm({ title: "", url: "", description: "" }); toast.success("Resource added"); },
    onError: (e) => toast.error("Couldn't add resource: " + (e as Error).message),
  });
  return (
    <div className="space-y-3">
      <Card className="space-y-2 p-3">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resource title"
          className="h-10 w-full rounded-lg border border-sand-border bg-sand-card px-3 text-sm focus-visible:focus-ring" />
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Link (https://...)"
          className="h-10 w-full rounded-lg border border-sand-border bg-sand-card px-3 text-sm" />
        <div className="flex justify-end">
          <Button size="sm" disabled={!form.title.trim()} isLoading={create.isPending} onClick={() => create.mutate()}>Add resource</Button>
        </div>
      </Card>
      {isLoading ? <Loader /> : resources.length === 0 ? <EmptyState icon={BookOpen} title="No resources yet" /> : (
        resources.map((r) => (
          <Card key={r.id} className="p-4">
            <p className="font-semibold">{r.title}</p>
            {r.description && <p className="text-sm text-ink-soft">{r.description}</p>}
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-coral hover:underline">Open link</a>}
          </Card>
        ))
      )}
    </div>
  );
}
