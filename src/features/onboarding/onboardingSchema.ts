import { z } from "zod";

// Base fields shared by everyone, plus all optional role-specific fields.
// Cross-field rules (e.g. students need a university) are enforced with superRefine.
export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  userType: z.enum(["student", "graduate", "professional", "recruiter"]),
  city: z.string().min(2, "Which city are you based in?"),

  // Education
  university: z.string().optional().default(""),
  course: z.string().optional().default(""),
  studyLevel: z.string().optional().default(""),
  gradMonth: z.string().optional().default(""),
  gradYear: z.string().optional().default(""),
  studentEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),

  // Professional / Recruiter
  company: z.string().optional().default(""),
  jobTitle: z.string().optional().default(""),
  yearsExperience: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  hiringFor: z.string().optional().default(""),
  displayCompany: z.boolean().default(true),
  openToNetworking: z.boolean().default(true),
  openToReferrals: z.boolean().default(false),

  // Everyone
  whyJoined: z.string().min(3, "Let the community know why you joined"),
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  lookingFor: z.array(z.string()).min(1, "Choose at least one"),
}).superRefine((v, ctx) => {
  const need = (field: keyof typeof v, msg: string) => {
    if (!v[field] || (typeof v[field] === "string" && !(v[field] as string).trim()))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: msg });
  };
  if (v.userType === "student") {
    need("university", "Which UK university?");
    need("course", "What's your course?");
  }
  if (v.userType === "professional") {
    need("jobTitle", "What's your job title?");
    need("yearsExperience", "Select your experience");
    need("industry", "Select your industry");
    if (v.skills.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["skills"], message: "Add at least one skill" });
  }
  if (v.userType === "recruiter") {
    need("company", "Company is required");
    need("jobTitle", "Your role is required");
  }
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
