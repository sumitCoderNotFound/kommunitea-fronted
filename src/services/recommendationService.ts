import type { User, Community, Job, JobApplication } from "@/types";
import { ROUTES } from "@/constants";

/* ------------------------------------------------------------------ *
 * Rule-based recommendation engine (MVP).
 * Pure scoring functions over data we already fetch — no new backend.
 * Signals used: userType, city, university, skills, interests,
 * lookingFor, joined communities, follow state, saved/applied jobs.
 * ------------------------------------------------------------------ */

export type RecType = "communities" | "people" | "jobs";

export interface RecAction {
  key: string;
  title: string;
  desc: string;
  to: string;
  icon: "briefcase" | "target" | "file" | "user" | "compass" | "sparkles";
}

const lc = (s?: string) => (s ?? "").toLowerCase();
const tokens = (s?: string) => lc(s).split(/[^a-z0-9]+/).filter((t) => t.length > 2);

// Backend fields like job.skills can be a string ("SQL, Python"), an array, or null.
// Normalise to a string[] so scoring never crashes.
function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") return v.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function overlap(a: unknown, b: unknown) {
  const set = new Set(toList(a).map(lc));
  return toList(b).reduce((n, x) => (set.has(lc(x)) ? n + 1 : n), 0);
}

/* ---------- hidden store (persists "not interested" / hide) ---------- */
const HIDDEN_KEY = "km_hidden_recs_v1";
type HiddenMap = Record<RecType, string[]>;

export function getHidden(): HiddenMap {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (raw) return { communities: [], people: [], jobs: [], ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { communities: [], people: [], jobs: [] };
}
export function hideRec(type: RecType, id: string) {
  const h = getHidden();
  if (!h[type].includes(id)) h[type] = [...h[type], id];
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(h)); } catch { /* ignore */ }
}

/* ---------- ranking ---------- */
export function rankCommunities(communities: Community[], user: User | null, hidden: string[], boostCategory?: string) {
  const uniTokens = tokens(user?.university);
  const interests = user?.interests ?? [];
  return communities
    .filter((c) => !c.isMember && !hidden.includes(String(c.id)))
    .map((c) => {
      let score = 1;
      const hay = lc(c.name) + " " + lc(c.description);
      if (uniTokens.some((t) => hay.includes(t))) score += 4;
      if (interests.some((i) => hay.includes(lc(i)) || lc(c.category) === lc(i))) score += 2;
      if (boostCategory && lc(c.category) === lc(boostCategory)) score += 5;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
}

export function rankPeople(people: User[], user: User | null, hidden: string[], boostUniversity?: string) {
  return people
    .filter((p) => String(p.id) !== String(user?.id) && !p.isFollowing && !p.hasRequested && !hidden.includes(String(p.id)))
    .map((p) => {
      let score = 0;
      if (user?.university && lc(p.university) === lc(user.university)) score += 4;
      if (user?.city && lc(p.city) === lc(user.city)) score += 2;
      score += overlap(user?.skills, p.skills ?? []);
      score += overlap(user?.interests, p.interests ?? []);
      if (boostUniversity && lc(p.university) === lc(boostUniversity)) score += 5;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export function rankJobs(jobs: Job[], applications: JobApplication[], user: User | null, hidden: string[]) {
  const taken = new Set(applications.map((a) => `${lc(a.company)}|${lc(a.roleTitle)}`));
  const skills = user?.skills ?? [];
  const roleTokens = tokens(user?.targetRole);
  return jobs
    .filter((j) => !hidden.includes(String(j.id)) && !taken.has(`${lc(j.company)}|${lc(j.title)}`))
    .map((j) => {
      let score = j.visaSponsorship ? 1 : 0;
      score += overlap(skills, j.skills ?? []);
      const hay = lc(j.title);
      if (roleTokens.some((t) => hay.includes(t))) score += 3;
      if (user?.city && lc(j.location).includes(lc(user.city))) score += 1;
      return { j, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.j);
}

/* ---------- next-best Plan actions (rule-based) ---------- */
export function planActions(user: User | null, applications: JobApplication[]): RecAction[] {
  const out: RecAction[] = [];
  const saved = applications.filter((a) => a.status === "saved");
  const applied = applications.filter((a) => a.status === "applied");
  const interviewing = applications.find((a) => a.status === "interview");

  if (interviewing) {
    out.push({ key: "interview", icon: "target", title: "Prep for your interview",
      desc: `You're interviewing for ${interviewing.roleTitle || "a role"}. Get ready.`,
      to: `${ROUTES.planInterview}?company=${encodeURIComponent(interviewing.company || "")}&role=${encodeURIComponent(interviewing.roleTitle || "")}` });
  }
  if (saved.length > 0 && applied.length === 0) {
    out.push({ key: "apply", icon: "briefcase", title: "Apply to 2 jobs today",
      desc: `You've saved ${saved.length} role${saved.length === 1 ? "" : "s"} but applied to none.`, to: ROUTES.planSponsorship });
  }
  if (!user?.cvUploaded) {
    out.push({ key: "cv", icon: "file", title: "Run a CV ATS review",
      desc: "See how applicant-tracking systems read your CV.", to: ROUTES.planCv });
  }
  const profileBits = [user?.avatarUrl, user?.bio, (user?.skills?.length ?? 0) > 0].filter(Boolean).length;
  if (profileBits < 3) {
    out.push({ key: "profile", icon: "user", title: "Complete your profile",
      desc: "Add a photo, bio and skills so people can find you.", to: ROUTES.editProfile });
  }
  if ((user?.lookingFor ?? []).includes("jobs") && saved.length === 0) {
    out.push({ key: "explore", icon: "compass", title: "Explore sponsored jobs",
      desc: "Find roles from visa-sponsoring employers.", to: ROUTES.planSponsorship });
  }
  if (user?.userType === "newcomer") {
    out.push({ key: "newcomer", icon: "sparkles", title: "Find your UK community",
      desc: "Connect with others settling into your city.", to: ROUTES.tribe });
  }
  return out.slice(0, 3);
}
