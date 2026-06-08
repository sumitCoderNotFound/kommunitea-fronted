import { apiClient } from "./apiClient";

export interface StudyProfile {
  currentCountry?: string;
  educationLevel?: string;
  currentQualification?: string;
  marksOrCgpa?: string;
  workExperience?: string;
  desiredStudyLevel?: string;
  subjectInterest?: string;
  careerGoal?: string;
  preferredIntake?: string;
  preferredCountries?: string[];
  tuitionBudget?: string;
  livingBudget?: string;
  needsScholarship?: boolean;
  needsPartTimeWork?: boolean;
  englishTestType?: string;
  englishTestScore?: string;
  passportStatus?: boolean;
  documentStatus?: boolean;
  priorities?: string[];
}

export interface CountryScore {
  country: string; name: string; score: number;
  breakdown: Record<string, number>;
  whyItFits: string[]; risks: string[];
  visaNotes: string; settlement: string;
  costLevel: string; jobMarketStrength: string; official: string;
}
export interface CourseRec {
  course: string; score: number; whyItFits: string;
  skillsNeeded: string[]; careerRoles: string[];
  jobMarketSignal: string; sponsorPossibility: string;
  recommendedCities: string[]; communities: string[];
}
export interface UniversityRec {
  university: string; course: string; city: string; country: string;
  studyLevel: string; duration: string; intake: string; feeRange: string;
  entrySummary: string; englishRequirement: string; officialUrl: string;
  matchScore: number; cityCostLevel: string; partTimeOpportunity: string;
  careerMarketSignal: string; accommodationDifficulty: string; communitySignal: string;
  whyItFits: string; whatToCheck: string; sourceName: string; sourceUrl: string;
  lastCheckedAt?: string | null;
}
export interface CityRec {
  city: string; score: number; costLevel: string; studentLife: string;
  partTimeOpportunity: string; careerMarket: string; accommodationDifficulty: string;
  community: string; bestFor: string; universities: string[];
}
export interface StudyResult {
  id: number; overallSummary: string;
  countryScores: CountryScore[]; courseRecommendations: CourseRec[];
  universityRecommendations: UniversityRec[]; cityRecommendations: CityRec[];
  careerMarketInsights: {
    possibleRoles: string[]; skillsToBuild: string[]; sponsorVisibility: string;
    jobMarketSignal: string; sponsoredJobFinderLink: string; liveJobs: unknown[];
  };
  visaCostChecklist: {
    studentVisa: string; graduateVisa: string; financialProof: string;
    officialLinks: { name: string; url: string }[]; disclaimer: string;
  };
  actionPlan: { thisWeek: string[]; thisMonth: string[] };
  createdAt: string;
  disclaimers: Record<string, string>;
}
export interface SavedOption {
  id: number; optionType: string; title: string; subtitle?: string;
  country?: string; city?: string; university?: string; course?: string;
  fee?: string; intake?: string; entryRequirements?: string; englishRequirement?: string;
  officialUrl?: string; notes?: string; status: string; deadline?: string | null;
  matchScore?: number | null; sourceName?: string; sourceUrl?: string;
}

export const studyMatchService = {
  async getProfile() { return (await apiClient.get<StudyProfile>("/study-match/profile/")).data; },
  async saveProfile(p: StudyProfile) { return (await apiClient.post<StudyProfile>("/study-match/profile/", p)).data; },
  async generate(p?: StudyProfile) { return (await apiClient.post<StudyResult>("/study-match/generate/", p || {})).data; },
  async results() { return (await apiClient.get<StudyResult[]>("/study-match/results/")).data; },
  async result(id: string | number) { return (await apiClient.get<StudyResult>(`/study-match/results/${id}/`)).data; },
  async universities() { return (await apiClient.get<{ universities: UniversityRec[]; disclaimer: string }>("/study-match/universities/")).data; },
  async countries() { return (await apiClient.get<{ countries: Record<string, never>; disclaimers: Record<string, string> }>("/study-match/countries/")).data; },
  async cities() { return (await apiClient.get<{ cities: Record<string, never>; disclaimers: Record<string, string> }>("/study-match/cities/")).data; },
  async courses() { return (await apiClient.get<{ courses: Record<string, never>; disclaimers: Record<string, string> }>("/study-match/courses/")).data; },
  async compare(countries: string[]) { return (await apiClient.post<{ comparison: CountryScore[]; disclaimers: Record<string, string> }>("/study-match/compare/", { countries })).data; },
  async saved(type?: string) { return (await apiClient.get<SavedOption[]>("/study-match/saved/", { params: type ? { type } : {} })).data; },
  async save(option: Partial<SavedOption>) { return (await apiClient.post<SavedOption>("/study-match/saved/", option)).data; },
  async updateSaved(id: number, patch: Partial<SavedOption>) { return (await apiClient.patch<SavedOption>(`/study-match/saved/${id}/`, patch)).data; },
  async deleteSaved(id: number) { await apiClient.delete(`/study-match/saved/${id}/`); },
  async addToPlan(tasks: { title: string; description?: string }[], category = "university") {
    return (await apiClient.post<{ created: number }>("/study-match/add-to-plan/", { tasks, category })).data;
  },
  async ai(intent: string, question = "") { return (await apiClient.post<{ answer: string; source: string }>("/study-match/ai/", { intent, question })).data; },
};

export const PRIORITY_OPTIONS = [
  { key: "low_cost", label: "Low cost" },
  { key: "high_ranking", label: "High ranking" },
  { key: "easy_city_life", label: "Easy city life" },
  { key: "strong_job_market", label: "Strong job market" },
  { key: "post_study_work", label: "Post-study work route" },
  { key: "pr_settlement", label: "PR/settlement pathway" },
  { key: "part_time_jobs", label: "Part-time jobs" },
  { key: "scholarship_chances", label: "Scholarship chances" },
  { key: "community", label: "Indian/student community" },
  { key: "tech_ecosystem", label: "Tech/career ecosystem" },
  { key: "safe_accommodation", label: "Safe accommodation" },
  { key: "lower_visa_risk", label: "Lower visa risk" },
];

// Dropdown option lists (searchable). Keep these the single source of truth.
export const SM_OPTIONS = {
  currentCountry: ["India", "Nepal", "Bangladesh", "Pakistan", "Sri Lanka", "Nigeria", "Ghana", "Kenya", "UAE", "Saudi Arabia", "United Kingdom", "Other"],
  educationLevel: ["12th / Higher Secondary", "Diploma", "Bachelor's", "Master's", "Working professional", "Other"],
  qualification: ["BTech Computer Science", "BSc Computer Science", "BCA", "BCom", "BBA", "BA", "BSc Nursing", "BSc Chemistry", "BSc Biology", "BPharm", "MBBS", "Engineering", "Business / Management", "Healthcare", "Other"],
  marks: ["50–59%", "60–69%", "70–79%", "80%+", "CGPA 6–6.9", "CGPA 7–7.9", "CGPA 8+", "Not sure"],
  workExperience: ["No experience", "Less than 1 year", "1–2 years", "2–4 years", "4+ years"],
  studyLevel: ["Undergraduate", "Masters", "PhD", "Diploma / Certificate"],
  subject: ["Computer Science", "Data Science", "Artificial Intelligence", "Cyber Security", "Business Analytics", "Project Management", "Public Health", "Healthcare Management", "Engineering", "Finance", "Marketing", "Supply Chain", "Hospitality", "Nursing / Healthcare", "Psychology", "Education", "Other"],
  careerGoal: ["Software Engineer", "Data Analyst", "Data Scientist", "AI/ML Engineer", "Cyber Security Analyst", "Business Analyst", "Project Manager", "Healthcare Manager", "Public Health Officer", "Finance Analyst", "Marketing Executive", "Supply Chain Analyst", "Lecturer / Researcher", "Not sure yet"],
  intake: ["January 2026", "May 2026", "September 2026", "January 2027", "May 2027", "September 2027", "Not sure"],
  countries: ["UK", "Canada", "Germany", "Australia", "Ireland", "USA", "New Zealand", "Not sure"],
  tuitionBudget: ["Under £10,000/year", "£10,000–£15,000/year", "£15,000–£20,000/year", "£20,000–£30,000/year", "£30,000+/year", "Not sure"],
  livingBudget: ["Under £700/month", "£700–£900/month", "£900–£1,100/month", "£1,100–£1,400/month", "£1,400+/month", "Not sure"],
  englishTest: ["IELTS", "PTE", "TOEFL", "Duolingo", "Not taken yet", "Not required / Not sure"],
  scoreByTest: {
    IELTS: ["5.5", "6.0", "6.5", "7.0+", "Not sure"],
    PTE: ["50–57", "58–64", "65+", "Not sure"],
    TOEFL: ["60–78", "79–93", "94+", "Not sure"],
    Duolingo: ["95–104", "105–114", "115+", "Not sure"],
  } as Record<string, string[]>,
  documents: ["Passport", "Transcript", "Degree certificate", "IELTS/PTE", "SOP", "LOR", "CV", "Financial documents", "Not ready yet"],
};

// ===== Real-data university catalog (free public sources) =====
export interface CatalogUniversity {
  id: number; universityId: string; universityName: string; city: string; region: string;
  country: string; websiteUrl: string; isRussellGroup: boolean; ukviSponsorStatus: string;
  sponsorRating: string; internationalOfficeUrl: string; accommodationUrl: string;
  scholarshipUrl: string; sourceUrl: string; lastCheckedAt: string | null;
  dataConfidence: string; needsVerification: boolean; courseCount: number;
}
export interface FeeBand { key: string; label: string; minGbp: number; maxGbp: number; source?: string; sourceUrl?: string; }
export interface CatalogCourse {
  id: number; courseId: string; universityName: string; courseName: string; degreeLevel: string;
  subjectArea: string; duration: string; studyMode: string; intakeMonths: string[];
  internationalFeeGbp: number | null; internationalFeeText: string; entryRequirements: string;
  englishLanguageRequirement: string; ieltsOverall: string | null; pteRequirement: string;
  workPlacementAvailable: boolean | null; scholarshipInfo: string; courseUrl: string;
  applicationUrl: string; sourceUrl: string; feeVerified: boolean; lastCheckedAt: string | null;
  dataConfidence: string; needsVerification: boolean; indicativeFeeBand?: FeeBand;
}
export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }
export interface MatchedCourse extends CatalogCourse {
  matchPercentage: number; scoreBreakdown: Record<string, number>;
  reasons: string[]; warnings: string[]; city: string; isRussellGroup: boolean;
}

export const catalogService = {
  async universities(params: Record<string, string | number | boolean> = {}) {
    return (await apiClient.get<Paginated<CatalogUniversity>>("/study-match/catalog/universities/", { params })).data;
  },
  async university(id: number | string) {
    return (await apiClient.get<CatalogUniversity & { courses: CatalogCourse[]; disclaimer: string }>(`/study-match/catalog/universities/${id}/`)).data;
  },
  async courses(params: Record<string, string | number | boolean> = {}) {
    return (await apiClient.get<Paginated<CatalogCourse>>("/study-match/catalog/courses/", { params })).data;
  },
  async course(id: number | string) {
    return (await apiClient.get<CatalogCourse & { disclaimer: string }>(`/study-match/catalog/courses/${id}/`)).data;
  },
  async recommendations(input: Record<string, unknown>) {
    return (await apiClient.post<{ results: MatchedCourse[]; count: number; disclaimers: Record<string, string> }>("/study-match/catalog/recommendations/", input)).data;
  },
  async feeBands() {
    return (await apiClient.get<{ bands: FeeBand[]; source: string; sourceUrl: string; disclaimer: string }>("/study-match/catalog/fee-bands/")).data;
  },
  async countryInsights() {
    return (await apiClient.get<{ countries: CountryInsight[]; lastUpdated: string | null; disclaimer: string }>("/study-match/catalog/countries/")).data;
  },
};

export interface CountryInsight {
  id: number; country: string; name: string;
  studyScore: number; workScore: number; budgetScore: number; visaScore: number;
  languageScore: number; rankingScore: number; studentLifeScore: number; overallScore: number;
  bestForSubjects: string[]; popularCities: string[]; tuitionBand: string; livingCostBand: string;
  postStudyWorkSummary: string; partTimeWorkSummary: string; languageNotes: string; riskNotes: string;
  weeklyUpdateSummary: string; sourceName: string; sourceUrl: string; lastCheckedAt: string | null; updateFrequency: string;
}

/** Honest fee display: exact verified fee, else indicative band, else check-official. */
export function courseFeeDisplay(c: CatalogCourse): { mode: "verified" | "indicative" | "unknown"; text: string; band?: FeeBand } {
  if (c.feeVerified && c.internationalFeeGbp) return { mode: "verified", text: `£${c.internationalFeeGbp.toLocaleString()}/year` };
  if (c.indicativeFeeBand) return { mode: "indicative", text: `£${c.indicativeFeeBand.minGbp.toLocaleString()}–£${c.indicativeFeeBand.maxGbp.toLocaleString()}/year`, band: c.indicativeFeeBand };
  return { mode: "unknown", text: "Check official course page" };
}

export const SPONSOR_LABEL: Record<string, string> = {
  licensed: "Licensed sponsor", not_listed: "Not on register", unknown: "Not checked yet",
};
