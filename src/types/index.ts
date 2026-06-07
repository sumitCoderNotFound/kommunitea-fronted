// ---- Domain types shared across the app ----

export type LookingFor =
  | "friends" | "jobs" | "accommodation" | "events"
  | "guidance" | "projects" | "networking";

export type StudentStatus = "student" | "psw" | "graduate" | "employed" | "other";

export type PostCategory =
  | "jobs" | "internships" | "accommodation" | "visa_psw"
  | "university_life" | "events" | "tech" | "collaboration" | "success_stories";

export type UserType =
  | "student" | "graduate" | "professional"
  | "job_seeker" | "recruiter" | "creator" | "newcomer";

export interface User {
  id: string;
  fullName: string;
  displayName?: string;
  username?: string | null;
  email: string;
  isEmailVerified?: boolean;
  authProvider?: "email" | "google" | "both";
  phoneCountryCode?: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  whatsappOptIn?: boolean;
  profileCompletion?: number;
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
  openToMentoring?: boolean;
  // Job seeker
  targetRole?: string;
  experienceLevel?: string;
  jobType?: string;
  cvUploaded?: boolean;
  // Creator
  companyWebsite?: string;
  contentNiche?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  creatorTopics?: string[];
  // Newcomer
  destinationCity?: string;
  arrivalDate?: string;
  newcomerNeeds?: string[];
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
  resharesCount?: number;
  isReshared?: boolean;
  allowReshare?: boolean;
  allowShareToStory?: boolean;
  visibility?: "public" | "followers_only" | "community_only" | "private";
  resharedBy?: { names: string[]; comment?: string } | null;
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

// ---- Tribe / Communities ----
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  membersCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  community: string;
  title: string;
  description?: string;
  location?: string;
  startsAt?: string;
  link?: string;
  createdAt: string;
}

export interface CommunityResource {
  id: string;
  community: string;
  title: string;
  kind?: string;
  url?: string;
  description?: string;
  createdAt: string;
}

// ---- Jobs ----
export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  country?: string;
  jobType?: string;
  visaSponsorship?: boolean;
  salaryRange?: string;
  experienceLevel?: string;
  skills?: string[];
  description?: string;
  applyUrl?: string;
  postedBy?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface SponsorCompany {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  careersUrl?: string;
  linkedinUrl?: string;
  sponsorshipConfidence?: string;
  createdAt: string;
}

// ---- Plan: application tracker ----
export type ApplicationStatus =
  | "saved" | "applied" | "response" | "interview" | "rejected" | "offer" | "follow_up";

export interface JobApplication {
  id: string;
  goal?: string | null;
  job?: string | null;
  company: string;
  roleTitle?: string;
  jobLink?: string;
  source?: string;
  status: ApplicationStatus;
  appliedDate?: string | null;
  followUpDate?: string | null;
  reminderAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Career tools ----
export interface CVAnalysis {
  id: string;
  fileName: string;
  atsScore: number;
  jobMatchScore?: number;
  sectionScores?: Record<string, number>;
  missingKeywords?: string[];
  passedChecks?: string[];
  failedChecks?: string[];
  improvementChecks?: string[];
  topFixes?: string[];
  recommendedRoles?: string[];
  summary?: string;
  createdAt: string;
}

export type ReferralStatus =
  | "not_requested" | "requested" | "follow_up" | "referred" | "declined" | "no_response";

export interface ReferralRequest {
  id: string;
  jobApplication?: string | null;
  company: string;
  roleTitle?: string;
  contactUser?: string | null;
  contactName?: string;
  contactLinkedin?: string;
  message?: string;
  status: ReferralStatus;
  followUpDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewPrep {
  id: string;
  jobApplication?: string | null;
  company: string;
  roleTitle?: string;
  interviewDate?: string | null;
  checklist?: { text: string; done: boolean }[];
  questions?: string[];
  notes?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Profile: projects ----
export interface Project {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  category?: string;
  status?: string;
  coverImageUrl?: string;
  screenshotUrls?: string[];
  techStack?: string[];
  links?: { label?: string; url: string }[] | Record<string, string>;
  lookingForCollaborators?: boolean;
  visibility?: string;
  owner?: { id: string; fullName: string; avatarUrl?: string };
  isOwner?: boolean;
  createdAt: string;
}
