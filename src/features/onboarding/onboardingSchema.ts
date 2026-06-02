import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  university: z.string().min(2, "Which UK university?"),
  course: z.string().min(2, "What's your course?"),
  city: z.string().min(2, "Which city are you based in?"),
  intakeYear: z.string().min(4, "Pick your intake year"),
  status: z.string().min(1, "Select your status"),
  whatNext: z.string().min(3, "Tell us what you're doing next"),
  whyJoined: z.string().min(10, "A sentence or two helps the community"),
  interests: z.string().min(2, "Add a few interests"),
  skills: z.string().min(2, "Add a few skills"),
  lookingFor: z.array(z.string()).min(1, "Choose at least one"),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
