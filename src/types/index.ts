// ---- Domain types shared across the app ----

export type LookingFor =
  | "friends" | "jobs" | "accommodation" | "events"
  | "guidance" | "projects" | "networking";

export type StudentStatus = "student" | "psw" | "graduate" | "employed" | "other";

export type PostCategory =
  | "jobs" | "internships" | "accommodation" | "visa_psw"
  | "university_life" | "events" | "tech" | "collaboration" | "success_stories";

export type UserType = "student" | "graduate" | "professional" | "recruiter";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  userType?: UserType;
  university?: string;
  course?: string;
  studyLevel?: string;
  graduationDate?: string;
  intakeYear?: string;
  studentEmail?: string;
  company?: string;
  jobTitle?: string;
  yearsExperience?: string;
  industry?: string;
  hiringFor?: string;
  displayCompany?: boolean;
  openToNetworking?: boolean;
  openToReferrals?: boolean;
  city?: string;
  status?: StudentStatus;
  skills: string[];
  interests: string[];
  careerGoals?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  lookingFor: LookingFor[];
  bio?: string;
  isVerified: boolean;
  badge?: "student" | "alumni" | "recruiter";
  followersCount: number;
  followingCount: number;
  isOnboarded: boolean;
  isPrivate: boolean;
  isFollowing?: boolean;
  hasRequested?: boolean;
}

export interface Story {
  id: string;
  author: Pick<User, "id" | "fullName" | "avatarUrl">;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

export interface FollowRequestItem {
  id: string;
  fromUser: Pick<User, "id" | "fullName" | "avatarUrl" | "university">;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: Pick<User, "id" | "fullName" | "avatarUrl" | "university">;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: Pick<User, "id" | "fullName" | "avatarUrl" | "university" | "badge">;
  body: string;
  imageUrl?: string;
  category: PostCategory;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments?: Comment[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  actor: Pick<User, "id" | "fullName" | "avatarUrl">;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthTokens { access: string; refresh: string; }

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
