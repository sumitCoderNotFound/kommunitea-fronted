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
  university: string; course: string; city: string; feeRange: string;
  entrySummary: string; officialUrl: string; whyItFits: string;
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
  fee?: string; intake?: string; officialUrl?: string; notes?: string;
  status: string; deadline?: string | null;
}

export const studyMatchService = {
  async getProfile() { return (await apiClient.get<StudyProfile>("/study-match/profile/")).data; },
  async saveProfile(p: StudyProfile) { return (await apiClient.post<StudyProfile>("/study-match/profile/", p)).data; },
  async generate(p?: StudyProfile) { return (await apiClient.post<StudyResult>("/study-match/generate/", p || {})).data; },
  async results() { return (await apiClient.get<StudyResult[]>("/study-match/results/")).data; },
  async result(id: string | number) { return (await apiClient.get<StudyResult>(`/study-match/results/${id}/`)).data; },
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
];
