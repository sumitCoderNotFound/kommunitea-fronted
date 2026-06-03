import type { LookingFor, PostCategory } from "@/types";

export const APP_NAME = "Kommunitea";
export const APP_TAGLINE = "Connect. Collaborate. Grow.";

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  feed: "/feed",
  profile: (id = ":id") => `/profile/${id}`,
  editProfile: "/settings/profile",
  myPosts: "/my-posts",
  settings: "/settings",
  notifications: "/notifications",
  messages: "/messages",
  aiTools: "/ai-tools",
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
