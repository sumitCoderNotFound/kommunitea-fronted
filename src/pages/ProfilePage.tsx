import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, GraduationCap, Linkedin, Github, Globe, Pencil, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { VerifiedBadge } from "@/components/ui/Badge";
import { ActivityGrid } from "@/features/profile/ActivityGrid";
import { StreakBadge } from "@/features/profile/StreakBadge";
import { ROUTES } from "@/constants";
import { FollowButton } from "@/features/profile/FollowButton";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { popIn, springy } from "@/utils/motion";

export function ProfilePage() {
  const { id } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useProfile(id);
  const { activity, currentStreak, longestStreak } = useStreak();
  const user = data ?? null;
  const isOwn = String(currentUser?.id) === String(id);
  const navigate = useNavigate();

  if (isLoading) return <Loader label="Loading profile..." />;
  if (isError || !user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-display text-xl font-semibold">Profile not available</p>
        <p className="mt-2 text-sm text-ink-muted">We couldn't load this profile. It may not exist, or there was a network hiccup.</p>
      </div>
    );
  }
  // Defensive: arrays may be missing on some profiles
  const skills = user.skills ?? [];
  const interests = user.interests ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <motion.div initial="hidden" animate="show" variants={popIn}>
        <Card className="overflow-hidden p-0">
          <div className="h-28 bg-gradient-to-r from-ink via-ink-soft to-coral/60" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between">
              <Avatar name={user.fullName} src={user.avatarUrl} size="xl" className="ring-4 ring-white" />
              {isOwn ? (
                <Link to={ROUTES.editProfile}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
              ) : (
                <div className="flex gap-2"><FollowButton user={user} /><Button variant="outline" size="sm" onClick={() => navigate(`${ROUTES.messages}?user=${user.id}`)}>Message</Button></div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{user.fullName}</h1>
              {user.badge && <VerifiedBadge type={user.badge} />}
            </div>
            {/* Subtitle adapts to who they are */}
            {user.userType === "professional" || user.userType === "recruiter" ? (
              <p className="text-ink-muted">
                {user.jobTitle}
                {user.company && (user.displayCompany ?? true) ? ` at ${user.company}` : ""}
              </p>
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
              {user.userType && <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium capitalize text-ink-soft">{user.userType}</span>}
            </div>
            {/* networking / referral availability for professionals */}
            {(user.userType === "professional" || user.userType === "recruiter") && (
              <div className="mt-2 flex flex-wrap gap-2">
                {user.openToNetworking && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Open to networking</span>}
                {user.openToReferrals && <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral">Open to referrals</span>}
              </div>
            )}
            <div className="mt-3 flex gap-4 text-sm">
              <span><strong>{user.followersCount}</strong> <span className="text-ink-muted">followers</span></span>
              <span><strong>{user.followingCount}</strong> <span className="text-ink-muted">following</span></span>
            </div>
            {user.bio && <p className="mt-4 text-sm text-ink-soft">{user.bio}</p>}
            {user.careerGoals && (
              <p className="mt-4 text-sm"><span className="font-semibold">Goal:</span> <span className="text-ink-soft">{user.careerGoals}</span></p>
            )}
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
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Streak + Activity (GitHub style) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springy, delay: 0.06 }}>
        <Card className="p-6">
          <div className="mb-5">
            <StreakBadge streak={isOwn ? currentStreak : 0} longest={isOwn ? longestStreak : 0} />
          </div>
          <h2 className="mb-3 font-display font-semibold">Activity</h2>
          <ActivityGrid activity={isOwn ? activity : {}} weeks={26} />
          <p className="mt-2 text-xs text-ink-muted">
            {isOwn ? "Each square is a day you showed up. Keep the streak alive!" : "This member's activity over the last 6 months."}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
