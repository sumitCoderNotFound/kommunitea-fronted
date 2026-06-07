import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, GraduationCap, Linkedin, Github, Globe, Pencil, Briefcase, Lock, Grid3x3, Repeat2, Image, Tag, FolderGit2, FileText, Instagram, Youtube, Share2, Award, MoreHorizontal, Flag, Ban, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { VerifiedBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PostCard } from "@/features/posts/PostCard";
import { ActivityGrid } from "@/features/profile/ActivityGrid";
import { StreakBadge } from "@/features/profile/StreakBadge";
import { ROUTES } from "@/constants";
import { FollowButton } from "@/features/profile/FollowButton";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useToast } from "@/hooks/useToast";
import { postService } from "@/services/postService";
import { projectService } from "@/services/projectService";
import { profileService } from "@/services/profileService";
import { moderationService } from "@/services/moderationService";
import { popIn, springy } from "@/utils/motion";
import { cn } from "@/utils/cn";
import type { Post } from "@/types";

type Tab = "posts" | "reposts" | "media" | "tagged" | "projects";

export function ProfilePage() {
  const { id } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useProfile(id);
  const { activity, currentStreak, longestStreak } = useStreak();
  const user = data ?? null;
  const isOwn = String(currentUser?.id) === String(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("posts");
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: achievementsData } = useQuery({
    queryKey: ["achievements"],
    queryFn: profileService.achievements,
    enabled: isOwn,
  });

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${id}`;
    try {
      if (navigator.share) await navigator.share({ title: user?.fullName ?? "Kommunitea profile", url });
      else { await navigator.clipboard.writeText(url); toast.success("Profile link copied 🔗"); }
    } catch { /* dismissed */ }
  };
  const copyProfileLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/profile/${id}`); toast.success("Profile link copied 🔗"); }
    catch { toast.error("Couldn't copy link"); }
  };
  const reportUser = async () => {
    const reason = window.prompt("Why are you reporting this user?")?.trim();
    if (!reason) return;
    try { await moderationService.report({ targetType: "user", targetId: Number(id), reason }); toast.success("Reported. Our team will review it."); }
    catch (e) { toast.error("Couldn't report: " + (e as Error).message); }
  };
  const blockUser = async () => {
    if (!window.confirm(`Block ${user?.fullName ?? "this user"}? They won't be able to interact with you.`)) return;
    try { await moderationService.block(String(id)); toast.success("User blocked"); navigate(ROUTES.feed); }
    catch (e) { toast.error("Couldn't block: " + (e as Error).message); }
  };

  if (isLoading) return <Loader label="Loading profile..." />;
  if (isError || !user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-display text-xl font-semibold">Profile not available</p>
        <p className="mt-2 text-sm text-ink-muted">We couldn't load this profile. It may not exist, or there was a network hiccup.</p>
      </div>
    );
  }
  const skills = user.skills ?? [];
  const interests = user.interests ?? [];
  const locked = !!user.isPrivate && !user.isFollowing && !isOwn;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <motion.div initial="hidden" animate="show" variants={popIn}>
        <Card className="overflow-hidden p-0">
          <div className="h-28 bg-gradient-to-r from-ink via-ink-soft to-coral/60" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between">
              <Avatar name={user.fullName} src={user.avatarUrl} size="xl" className="ring-4 ring-white" />
              {isOwn ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={shareProfile}><Share2 className="h-4 w-4" /> Share</Button>
                  <Link to={ROUTES.editProfile}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FollowButton user={user} />
                  <Button variant="outline" size="sm" onClick={() => navigate(`${ROUTES.inbox}?user=${user.id}`)}>Message</Button>
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setMenuOpen((o) => !o)} aria-label="More"><MoreHorizontal className="h-4 w-4" /></Button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-sand-border bg-sand-card shadow-soft">
                          <button onClick={() => { setMenuOpen(false); shareProfile(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-ink/5"><Share2 className="h-4 w-4" /> Share profile</button>
                          <button onClick={() => { setMenuOpen(false); copyProfileLink(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-ink/5"><LinkIcon className="h-4 w-4" /> Copy profile link</button>
                          <button onClick={() => { setMenuOpen(false); reportUser(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-ink/5"><Flag className="h-4 w-4" /> Report user</button>
                          <button onClick={() => { setMenuOpen(false); blockUser(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"><Ban className="h-4 w-4" /> Block user</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{user.fullName}</h1>
              {user.badge && <VerifiedBadge type={user.badge} />}
              {user.isPrivate && <Lock className="h-4 w-4 text-ink-muted" />}
            </div>
            {user.userType === "professional" || user.userType === "recruiter" ? (
              <p className="text-ink-muted">
                {user.jobTitle}
                {user.company ? ` at ${user.company}` : ""}
              </p>
            ) : user.userType === "job_seeker" ? (
              <p className="text-ink-muted">{user.targetRole ? `Seeking: ${user.targetRole}` : "Job seeker"}</p>
            ) : user.userType === "creator" ? (
              <p className="text-ink-muted">{user.contentNiche ? `${user.contentNiche} creator` : "Creator"}</p>
            ) : user.userType === "newcomer" ? (
              <p className="text-ink-muted">{user.destinationCity ? `Moving to ${user.destinationCity}${user.arrivalDate ? ` · ${user.arrivalDate}` : ""}` : "New to the UK"}</p>
            ) : (
              <p className="text-ink-muted">{user.course}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
              {(user.userType === "professional" || user.userType === "recruiter") ? (
                <>
                  {user.industry && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {user.industry}</span>}
                  {user.yearsExperience && <span className="flex items-center gap-1">{user.yearsExperience} experience</span>}
                  {user.userType === "recruiter" && user.hiringFor && <span className="flex items-center gap-1">Hiring: {user.hiringFor}</span>}
                </>
              ) : (
                user.university && <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {user.university}{user.graduationDate ? ` · ${user.graduationDate}` : (user.intakeYear ? ` · ${user.intakeYear}` : "")}</span>
              )}
              {user.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.city}</span>}
              {user.userType && <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium capitalize text-ink-soft">{user.userType.replace("_", " ")}</span>}
            </div>
            {(user.userType === "professional" || user.userType === "recruiter") && (
              <div className="mt-2 flex flex-wrap gap-2">
                {user.openToNetworking && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Open to networking</span>}
                {user.openToReferrals && <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral">Open to referrals</span>}
              </div>
            )}
            {/* Clickable follower / following counts */}
            <div className="mt-3 flex gap-4 text-sm">
              <Link to={ROUTES.followers(user.id)} className="hover:underline">
                <strong>{user.followersCount}</strong> <span className="text-ink-muted">followers</span>
              </Link>
              <Link to={ROUTES.following(user.id)} className="hover:underline">
                <strong>{user.followingCount}</strong> <span className="text-ink-muted">following</span>
              </Link>
            </div>
            {user.bio && <p className="mt-4 text-sm text-ink-soft">{user.bio}</p>}
            {skills.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => <span key={s} className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-medium text-sky">{s}</span>)}
                </div>
              </div>
            )}
            {interests.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((s) => <span key={s} className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral">{s}</span>)}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3 text-ink-muted">
              {user.linkedin && <a href={user.linkedin}><Linkedin className="h-5 w-5 hover:text-ink" /></a>}
              {user.github && <a href={user.github}><Github className="h-5 w-5 hover:text-ink" /></a>}
              {user.portfolio && <a href={user.portfolio}><Globe className="h-5 w-5 hover:text-ink" /></a>}
              {user.instagram && <a href={user.instagram}><Instagram className="h-5 w-5 hover:text-ink" /></a>}
              {user.youtube && <a href={user.youtube}><Youtube className="h-5 w-5 hover:text-ink" /></a>}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Streak + Activity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springy, delay: 0.06 }}>
        <Card className="p-6">
          <div className="mb-5">
            <StreakBadge streak={isOwn ? currentStreak : 0} longest={isOwn ? longestStreak : 0} />
          </div>
          <h2 className="mb-3 font-display font-semibold">Activity</h2>
          <ActivityGrid activity={isOwn ? activity : {}} weeks={26} />
        </Card>
      </motion.div>

      {/* Achievements (own profile) */}
      {isOwn && achievementsData && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-coral" />
            <h2 className="font-display font-semibold">Achievements</h2>
            <span className="text-sm text-ink-muted">{achievementsData.earnedCount}/{achievementsData.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {achievementsData.achievements.map((a) => (
              <div key={a.key} className={cn("rounded-xl border p-3 text-center", a.earned ? "border-coral/40 bg-coral/5" : "border-sand-border bg-sand-card opacity-70")}>
                <Award className={cn("mx-auto h-6 w-6", a.earned ? "text-coral" : "text-ink-muted")} />
                <p className="mt-1 text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-ink-muted">{a.desc}</p>
                {!a.earned && (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand-border">
                    <div className="h-full rounded-full bg-coral" style={{ width: `${Math.round((a.progress / a.target) * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Private account gate */}
      {locked ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Lock className="h-8 w-8 text-ink-muted" />
          <p className="font-semibold">This account is private</p>
          <p className="max-w-sm text-sm text-ink-muted">Follow {user.fullName.split(" ")[0]} to see their posts, reposts and tagged content.</p>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-sand-border bg-sand-card p-1">
            {([["posts", "Posts", Grid3x3], ["reposts", "Reposts", Repeat2], ["media", "Media", Image], ["tagged", "Tagged", Tag], ["projects", "Projects", FolderGit2]] as [Tab, string, typeof Grid3x3][])
              .map(([key, label, Icon]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    tab === key ? "bg-coral text-white" : "text-ink-soft hover:bg-ink/5")}>
                  <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {tab === "posts" && <PostsTab userId={user.id} />}
            {tab === "reposts" && <ResharesTab userId={user.id} />}
            {tab === "media" && <MediaTab userId={user.id} />}
            {tab === "tagged" && <TaggedTab userId={user.id} />}
            {tab === "projects" && <ProjectsTab userId={user.id} />}
          </motion.div>
        </>
      )}
    </div>
  );
}

// Fire-and-forget like/save so PostCard stays interactive inside profile tabs.
const likeHandler = (id: string) => { postService.toggleLike(id).catch(() => {}); };
const saveHandler = (id: string) => { postService.toggleSave(id).catch(() => {}); };

function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} onLike={likeHandler} onSave={saveHandler} />)}
    </div>
  );
}

function PostsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["profile-posts", userId], queryFn: () => postService.postsByUser(userId) });
  const posts = data?.results ?? [];
  if (isLoading) return <Loader />;
  if (posts.length === 0) return <EmptyState icon={FileText} title="No posts yet" />;
  return <PostList posts={posts} />;
}

function ResharesTab({ userId }: { userId: string }) {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["profile-reshares", userId], queryFn: () => postService.resharesByUser(userId) });
  if (isLoading) return <Loader />;
  if (posts.length === 0) return <EmptyState icon={Repeat2} title="No reposts yet" />;
  return <PostList posts={posts} />;
}

function TaggedTab({ userId }: { userId: string }) {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["profile-tagged", userId], queryFn: () => postService.taggedByUser(userId) });
  if (isLoading) return <Loader />;
  if (posts.length === 0) return <EmptyState icon={Tag} title="Nothing tagged yet" />;
  return <PostList posts={posts} />;
}

function MediaTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["profile-posts", userId], queryFn: () => postService.postsByUser(userId) });
  const media = (data?.results ?? []).filter((p) => p.imageUrl);
  if (isLoading) return <Loader />;
  if (media.length === 0) return <EmptyState icon={Image} title="No media yet" />;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {media.map((p) => (
        <Link key={p.id} to={ROUTES.postDetail(p.id)} className="aspect-square overflow-hidden rounded-lg bg-sand">
          <img src={p.imageUrl} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
        </Link>
      ))}
    </div>
  );
}

function ProjectsTab({ userId }: { userId: string }) {
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["profile-projects", userId], queryFn: () => projectService.byUser(userId) });
  if (isLoading) return <Loader />;
  if (projects.length === 0) return <EmptyState icon={FolderGit2} title="No projects yet" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((p) => (
        <Card key={p.id} className="overflow-hidden p-0">
          {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="h-32 w-full object-cover" />}
          <div className="p-4">
            <p className="font-semibold">{p.title}</p>
            {p.tagline && <p className="text-sm text-ink-soft">{p.tagline}</p>}
            {!!p.techStack?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.techStack.slice(0, 5).map((t) => <span key={t} className="rounded-full bg-sky-soft px-2 py-0.5 text-xs text-sky">{t}</span>)}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
