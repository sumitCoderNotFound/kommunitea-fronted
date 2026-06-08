import type { LookingFor, PostCategory } from "@/types";

export const APP_NAME = "Kommunitea";
export const APP_TAGLINE = "Connect. Collaborate. Grow.";

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  chooseUsername: "/choose-username",
  onboarding: "/onboarding",

  // ---- Primary sections (Kommunitea naming) ----
  home: "/feed", // Home  (was Feed)
  feed: "/feed", // kept for back-compat with existing links
  tribe: "/tribe", // Tribe (Explore / Communities) — page built in Step 2
  studyMatch: "/study-match",
  studyMatchStart: "/study-match/start",
  studyMatchResult: (id: string | number = ":id") => `/study-match/results/${id}`,
  studyMatchCountries: "/study-match/countries",
  studyMatchCourses: "/study-match/courses",
  studyMatchUniversities: "/study-match/universities",
  studyMatchUniversityDetail: (id: string | number = ":id") => `/study-match/universities/${id}`,
  studyMatchCourseDetail: (id: string | number = ":id") => `/study-match/course/${id}`,
  studyMatchWizard: "/study-match/match",
  studyMatchCities: "/study-match/cities",
  studyMatchSaved: "/study-match/saved",
  studyMatchChecklist: "/study-match/checklist",
  communityDetail: (id: string | number = ":id") => `/communities/${id}`,
  plan: "/plan", // Plan (was Scheduler)
  planSponsorship: "/plan/sponsorship-jobs",
  planCv: "/plan/cv-review",
  planReferrals: "/plan/referrals",
  planInterview: "/plan/interview-prep",
  careerTools: "/career-tools",
  jobDetail: (id: string | number = ":id") => `/jobs/${id}`,
  inbox: "/inbox", // Inbox (was Messages)
  inboxThread: (id: string = ":conversationId") => `/inbox/${id}`,
  me: (id: string = ":id") => `/profile/${id}`, // Me
  profile: (id: string = ":id") => `/profile/${id}`,
  followers: (id: string = ":id") => `/profile/${id}/followers`,
  following: (id: string = ":id") => `/profile/${id}/following`,
  postDetail: (id: string = ":id") => `/posts/${id}`,

  // ---- Secondary / inside sections ----
  editProfile: "/settings/profile",
  myPosts: "/my-posts",
  settings: "/settings",
  notifications: "/notifications",

  // ---- Back-compat aliases (old paths still resolve) ----
  messages: "/inbox",
  scheduler: "/plan",

  // ---- Legal ----
  privacy: "/privacy",
  terms: "/terms",
  guidelines: "/community-guidelines",
  contact: "/contact",
} as const;

export const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string }[] = [
  { value: "friends", label: "Friends" },
  { value: "jobs", label: "Jobs" },
  { value: "accommodation", label: "Accommodation" },
  { value: "events", label: "Events" },
  { value: "guidance", label: "Guidance" },
  { value: "projects", label: "Projects" },
  { value: "networking", label: "Networking" },
];

export const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: "jobs", label: "Jobs", emoji: "💼" },
  { value: "internships", label: "Internships", emoji: "🎯" },
  { value: "accommodation", label: "Accommodation", emoji: "🏠" },
  { value: "visa_psw", label: "Visa & PSW", emoji: "🛂" },
  { value: "university_life", label: "University Life", emoji: "🎓" },
  { value: "events", label: "Events", emoji: "📅" },
  { value: "tech", label: "Tech Discussions", emoji: "💻" },
  { value: "collaboration", label: "Project Collaboration", emoji: "🤝" },
  { value: "success_stories", label: "Success Stories", emoji: "⭐" },
];

export const STUDENT_STATUS_OPTIONS = [
  { value: "student", label: "Current Student" },
  { value: "psw", label: "Post Study Work Visa (PSW)" },
  { value: "graduate", label: "Recent Graduate" },
  { value: "employed", label: "Employed" },
  { value: "other", label: "Other" },
];
