import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Check } from "lucide-react";
import { storyService } from "@/services/storyService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Story } from "@/types";
import { cn } from "@/utils/cn";
import { timeAgo } from "@/utils/format";

function groupByAuthor(stories: Story[]) {
  const map = new Map<string, Story[]>();
  for (const s of stories) {
    const arr = map.get(s.author.id) ?? [];
    arr.push(s); map.set(s.author.id, arr);
  }
  return map;
}

export function StoriesBar() {
  const { user } = useAuthStore();
  const toast = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [viewing, setViewing] = useState<Story[] | null>(null);
  const [idx, setIdx] = useState(0);

  const { data } = useQuery({ queryKey: ["stories"], queryFn: storyService.list });
  const grouped = groupByAuthor(data?.results ?? []);
  const myStories = user ? grouped.get(user.id) ?? [] : [];
  const others = [...grouped.entries()].filter(([id]) => id !== user?.id).map(([, v]) => v);

  const createStory = useMutation({
    mutationFn: () => storyService.create({ image: preview!.file, caption }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story shared! It lasts 24 hours ⏳");
      setPreview(null); setCaption("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const removeStory = useMutation({
    mutationFn: (id: string) => storyService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stories"] }); toast.success("Story deleted"); setViewing(null); },
  });

  const pickFile = (file: File | null) => {
    if (file) setPreview({ file, url: URL.createObjectURL(file) });
  };
  const openStory = (group: Story[]) => { setViewing(group); setIdx(0); };
  const next = () => { if (viewing && idx < viewing.length - 1) setIdx(idx + 1); else setViewing(null); };
  const prev = () => { if (idx > 0) setIdx(idx - 1); };
  const viewingIsMine = viewing && user && viewing[idx]?.author.id === user.id;

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {/* Your story: add if none, view+ring if you have one */}
          <button onClick={() => myStories.length ? openStory(myStories) : fileRef.current?.click()}
            className="flex shrink-0 flex-col items-center gap-1.5">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              className={cn("relative rounded-full p-[2.5px]",
                myStories.length ? "bg-gradient-to-tr from-coral via-orange-400 to-amber-300" : "")}>
              <div className={cn("rounded-full", myStories.length ? "bg-sand-card p-[2px]" : "")}>
                <div className={cn("relative flex h-16 w-16 items-center justify-center rounded-full",
                  myStories.length ? "" : "border-2 border-dashed border-coral/50 bg-coral/5")}>
                  <Avatar name={user?.fullName ?? "You"} src={user?.avatarUrl} size="md" />
                  {!myStories.length && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white ring-2 ring-white">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
            <span className="text-xs text-ink-muted">Your story</span>
          </button>

          {others.map((group, i) => (
            <button key={i} onClick={() => openStory(group)} className="flex shrink-0 flex-col items-center gap-1.5">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                className="rounded-full bg-gradient-to-tr from-coral via-orange-400 to-amber-300 p-[2.5px]">
                <div className="rounded-full bg-sand-card p-[2px]">
                  <Avatar name={group[0].author.fullName} src={group[0].author.avatarUrl} size="md" />
                </div>
              </motion.div>
              <span className="max-w-[64px] truncate text-xs text-ink-soft">{group[0].author.fullName.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
      </Card>

      {/* Preview + confirm before posting (Instagram-style) */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl bg-sand-card">
              <div className="flex items-center justify-between p-3">
                <p className="font-semibold">Preview your story</p>
                <button onClick={() => { setPreview(null); setCaption(""); }} className="rounded-lg p-1 hover:bg-ink/5"><X className="h-5 w-5" /></button>
              </div>
              <img src={preview.url} alt="" className="max-h-[55vh] w-full object-contain bg-black" />
              <div className="space-y-3 p-3">
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption (optional)..."
                  className="h-10 w-full rounded-xl border border-sand-border px-3 text-sm focus-visible:focus-ring" />
                <div className="flex gap-2">
                  <Button variant="ghost" fullWidth onClick={() => { setPreview(null); setCaption(""); }}>Cancel</Button>
                  <Button fullWidth isLoading={createStory.isPending} onClick={() => createStory.mutate()}>
                    <Check className="h-4 w-4" /> Share story
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story viewer */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setViewing(null)}>
            <button className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={() => setViewing(null)}><X className="h-7 w-7" /></button>
            <button className="absolute left-4 text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft className="h-8 w-8" /></button>
            <motion.div key={idx} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[80vh] w-full max-w-sm overflow-hidden rounded-2xl bg-black" onClick={(e) => e.stopPropagation()}>
              <div className="absolute left-3 right-3 top-3 z-10 flex gap-1">
                {viewing.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-sand-card/30">
                    <div className={cn("h-full rounded-full bg-sand-card", i <= idx ? "w-full" : "w-0")} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-3 pt-6">
                <Avatar name={viewing[idx].author.fullName} src={viewing[idx].author.avatarUrl} size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight text-white">{viewing[idx].author.fullName}</span>
                  <span className="text-xs text-white/60">{timeAgo(viewing[idx].createdAt)}</span>
                </div>
                {viewingIsMine && (
                  <button onClick={(e) => { e.stopPropagation(); removeStory.mutate(viewing[idx].id); }}
                    className="ml-auto flex items-center gap-1 rounded-lg bg-sand-card/10 px-2 py-1 text-xs text-white hover:bg-red-500/80">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
              <img src={viewing[idx].imageUrl} alt="" className="max-h-[60vh] w-full object-contain" />
              {viewing[idx].caption && <p className="p-4 text-center text-white">{viewing[idx].caption}</p>}
            </motion.div>
            <button className="absolute right-4 text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="h-8 w-8" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
