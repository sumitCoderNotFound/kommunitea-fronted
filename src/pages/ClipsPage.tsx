import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart, MessageCircle, Bookmark, Share2, MoreVertical, Volume2, VolumeX, Plus, Play, Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/authStore";
import { clipsService, Clip, ClipContextAction, CLIP_CATEGORIES } from "@/services/clipsService";
import { communityService } from "@/services/communityService";
import { ROUTES } from "@/constants";
import { ClipUploadModal } from "@/features/clips/ClipUploadModal";
import { ClipCommentsSheet } from "@/features/clips/ClipCommentsSheet";

export function ClipsPage() {
  const [params] = useSearchParams();
  const startId = params.get("start");
  const [category, setCategory] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["clips-feed", category], queryFn: () => clipsService.feed(category) });
  const [uploadOpen, setUploadOpen] = useState(false);
  const verified = useAuthStore((s) => s.user?.isEmailVerified ?? s.user?.isVerified);
  const toast = useToast();

  const clips = data?.clips ?? [];
  // If arriving from Explore with ?start=, scroll that clip into view.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (startId && clips.length) {
      const el = document.getElementById(`clip-${startId}`);
      el?.scrollIntoView();
    }
  }, [startId, clips.length]);

  return (
    <div className="mx-auto max-w-[460px]">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Clips</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = ROUTES.explore)}><Search className="h-4 w-4" /></Button>
          {/* <Button size="sm" onClick={() => (verified ? setUploadOpen(true) : toast.error("Verify your email to upload clips."))}> */}
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CLIP_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${category === c.value ? "bg-coral text-white" : "bg-sand-card text-ink-muted"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-10"><Loader label="Loading clips…" /></div>
      ) : clips.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-sand-border p-10 text-center text-ink-muted">
          <Play className="mx-auto mb-3 h-8 w-8" />
          No clips here yet. {verified ? "Upload the first one!" : "Verify your email to upload the first one."}
        </div>
      ) : (
        <div ref={containerRef} className="h-[calc(100vh-180px)] snap-y snap-mandatory overflow-y-auto rounded-2xl">
          {clips.map((clip) => <ClipItem key={clip.id} clip={clip} />)}
        </div>
      )}

      {uploadOpen && <ClipUploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

function ClipItem({ clip }: { clip: Clip }) {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(clip.isLiked);
  const [saved, setSaved] = useState(clip.isSaved);
  const [likes, setLikes] = useState(clip.likesCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Autoplay when scrolled into view, pause when out.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.play().catch(() => { }); setPlaying(true); }
      else v.pause();
    }, { threshold: 0.6 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  const toggleLike = async () => {
    setLiked((v) => !v); setLikes((n) => (liked ? n - 1 : n + 1));
    try { await clipsService.like(clip.id); } catch { setLiked(clip.isLiked); setLikes(clip.likesCount); }
  };
  const toggleSave = async () => {
    setSaved((v) => !v);
    try { await clipsService.save(clip.id); } catch { setSaved(clip.isSaved); }
  };
  const share = async () => {
    try { await clipsService.share(clip.id); toast.success("Shared"); } catch { /* ignore */ }
  };
  const report = async () => {
    setMenuOpen(false);
    try { await clipsService.report(clip.id); toast.success("Reported. Thank you."); } catch { /* ignore */ }
  };
  const remove = async () => {
    setMenuOpen(false);
    try { await clipsService.remove(clip.id); qc.invalidateQueries({ queryKey: ["clips-feed"] }); toast.success("Clip deleted"); }
    catch { toast.error("Couldn't delete."); }
  };

  const onContext = async (a: ClipContextAction) => {
    switch (a.type) {
      case "job": return navigate(ROUTES.jobDetail(a.jobId!));
      case "university": return navigate(ROUTES.studyMatchUniversityDetail(a.universityId!));
      case "course": return navigate(ROUTES.studyMatchCourseDetail(a.courseId!));
      case "city": return navigate(`${ROUTES.studyMatchCities}/${a.citySlug}`);
      case "accommodation": return navigate(a.citySlug ? `${ROUTES.studyMatchCities}/${a.citySlug}` : ROUTES.studyMatchCities);
      case "study": return navigate(ROUTES.studyMatch);
      case "visa": return navigate(ROUTES.studyMatchChecklist);
      case "community":
        try { await communityService.join(String(a.communityId)); toast.success("Joined community"); navigate(ROUTES.communityDetail(a.communityId!)); }
        catch { navigate(ROUTES.communityDetail(a.communityId!)); }
        return;
    }
  };

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const categoryLabel = CLIP_CATEGORIES.find((c) => c.value === clip.category)?.label ?? clip.category;

  return (
    <div id={`clip-${clip.id}`} className="relative flex h-full snap-start items-center justify-center bg-black">
      {clip.videoUrl ? (
        <video ref={videoRef} src={clip.videoUrl} className="h-full w-full object-contain" loop muted={muted} playsInline onClick={togglePlay} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/60">Video unavailable</div>
      )}

      {!playing && <Play className="pointer-events-none absolute h-14 w-14 text-white/80" />}

      {/* Right action rail */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <Heart className={`h-7 w-7 ${liked ? "fill-coral text-coral" : ""}`} /><span className="text-xs">{likes}</span>
        </button>
        <button onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-1">
          <MessageCircle className="h-7 w-7" /><span className="text-xs">{clip.commentsCount}</span>
        </button>
        <button onClick={toggleSave} className="flex flex-col items-center gap-1">
          <Bookmark className={`h-7 w-7 ${saved ? "fill-white" : ""}`} />
        </button>
        <button onClick={share} className="flex flex-col items-center gap-1"><Share2 className="h-7 w-7" /></button>
        <button onClick={() => setMuted((m) => !m)}>{muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}</button>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)}><MoreVertical className="h-6 w-6" /></button>
          {menuOpen && (
            <div className="absolute bottom-8 right-0 w-32 rounded-xl bg-sand-card p-1 text-ink shadow-lift">
              {String(me?.id) === String(clip.user.id) ? (
                <button onClick={remove} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-ink/5">Delete</button>
              ) : (
                <button onClick={report} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ink/5">Report</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6 text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(ROUTES.profile(clip.user.id))} className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-coral/40">
              {clip.user.avatarUrl && <img src={clip.user.avatarUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <span className="text-sm font-semibold">{clip.user.fullName}</span>
          </button>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">{categoryLabel}</span>
        </div>
        {clip.caption ? <p className="mt-2 line-clamp-2 text-sm">{clip.caption}</p> : null}
        {clip.contextAction && (
          <button onClick={() => onContext(clip.contextAction!)}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">
            {clip.contextAction.label}
          </button>
        )}
      </div>

      {commentsOpen && <ClipCommentsSheet clipId={clip.id} onClose={() => setCommentsOpen(false)} />}
    </div>
  );
}
