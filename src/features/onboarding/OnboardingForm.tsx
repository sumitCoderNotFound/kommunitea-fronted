import { useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { onboardingSchema, type OnboardingValues } from "./onboardingSchema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Combobox } from "@/components/ui/Combobox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import {
  UK_CITIES, UK_UNIVERSITIES, USER_TYPE_OPTIONS, MONTHS, STUDY_LEVELS,
  INDUSTRIES, EXPERIENCE_OPTIONS, INTAKE_YEARS, INTEREST_OPTIONS, BRINGS_YOU_OPTIONS,
} from "@/constants/options";
import { ROUTES } from "@/constants";
import { profileService } from "@/services/profileService";
import { skillService } from "@/services/skillService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

const STEPS = ["About you", "Your background", "Your goals"] as const;

// small helper for a labelled controlled Combobox
function CB({ control, name, label, options, allowOther, placeholder, error }: {
  control: Control<OnboardingValues>; name: keyof OnboardingValues; label: string;
  options: string[]; allowOther?: boolean; placeholder?: string; error?: string;
}) {
  return (
    <Controller control={control} name={name as never} render={({ field }) => (
      <Combobox label={label} value={(field.value as string) ?? ""} onChange={field.onChange}
        options={options} allowOther={allowOther} placeholder={placeholder} error={error} />
    )} />
  );
}

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, control, trigger, watch, formState: { errors, isSubmitting } } =
    useForm<OnboardingValues>({
      resolver: zodResolver(onboardingSchema),
      defaultValues: {
        fullName: user?.fullName ?? "", userType: "student", city: "",
        university: "", course: "", studyLevel: "", gradMonth: "", gradYear: "", studentEmail: "",
        company: "", jobTitle: "", yearsExperience: "", industry: "", hiringFor: "",
        displayCompany: true, openToNetworking: true, openToReferrals: false,
        whyJoined: "", interests: [], skills: [], lookingFor: [],
      },
    });

  const userType = watch("userType");
  const isStudent = userType === "student";
  const isGraduate = userType === "graduate";
  const isPro = userType === "professional";
  const isRecruiter = userType === "recruiter";
  const showEducation = isStudent || isGraduate;
  const showWork = isPro || isRecruiter;

  const stepFields: (keyof OnboardingValues)[][] = [
    ["fullName", "userType", "city"],
    ["university", "course", "studyLevel", "company", "jobTitle", "yearsExperience", "industry", "hiringFor"],
    ["whyJoined", "interests", "skills", "lookingFor"],
  ];

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (v: OnboardingValues) => {
    try {
      if (avatar) await profileService.uploadAvatar(avatar);
      const gradDate = [v.gradMonth, v.gradYear].filter(Boolean).join(" ");
      const updated = await profileService.completeOnboarding({
        fullName: v.fullName,
        userType: v.userType,
        city: v.city,
        university: v.university,
        course: v.course,
        studyLevel: v.studyLevel,
        graduationDate: gradDate,
        intakeYear: v.gradYear,
        studentEmail: v.studentEmail,
        company: v.company,
        jobTitle: v.jobTitle,
        yearsExperience: v.yearsExperience,
        industry: v.industry,
        hiringFor: v.hiringFor,
        displayCompany: v.displayCompany,
        openToNetworking: v.openToNetworking,
        openToReferrals: v.openToReferrals,
        bio: v.whyJoined,
        interests: v.interests,
        skills: v.skills,
        lookingFor: v.lookingFor as never,
      });
      setUser(updated);
      toast.success("Welcome to the tribe! 🎉");
      navigate(ROUTES.feed);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-coral">Step {step + 1} of {STEPS.length}</p>
        <h2 className="mt-1 font-display text-2xl font-bold">{STEPS[step]}</h2>
        <div className="mt-4 flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-coral" : "bg-sand-border")} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* STEP 0 — identity + who are you */}
        {step === 0 && (
          <>
            <div className="flex items-center gap-4">
              <Avatar name={user?.fullName ?? "U"} src={avatar ? URL.createObjectURL(avatar) : undefined} size="lg" />
              <div className="flex-1 space-y-2">
                <ImageUploader value={avatar} onChange={setAvatar} className="flex-1" />
                <button type="button" onClick={() => setShowPicker((s) => !s)}
                  className="text-sm font-medium text-coral hover:underline">
                  {showPicker ? "Hide avatars" : "Or pick a fun avatar"}
                </button>
              </div>
            </div>
            {showPicker && <AvatarPicker onPick={setAvatar} seedBase={user?.fullName ?? "kommunitea"} />}
            <Input label="Full name" placeholder="e.g. Faraz Mohammed" error={errors.fullName?.message} {...register("fullName")} />
            <Controller control={control} name="userType" render={({ field }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">Who are you?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {USER_TYPE_OPTIONS.map((opt) => (
                    <button type="button" key={opt.value} onClick={() => field.onChange(opt.value)}
                      className={cn("rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                        field.value === opt.value ? "border-coral bg-coral text-white" : "border-sand-border bg-sand-card text-ink-soft hover:border-coral")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )} />
            <CB control={control} name="city" label="Current city in the UK" options={UK_CITIES} allowOther placeholder="Select your city" error={errors.city?.message} />
          </>
        )}

        {/* STEP 1 — adapts to user type */}
        {step === 1 && (
          <>
            {showEducation && (
              <>
                <CB control={control} name="university" label={isStudent ? "UK university *" : "UK university"} options={UK_UNIVERSITIES} allowOther placeholder="Select your university" error={errors.university?.message} />
                <Input label={isStudent ? "Course *" : "Course"} placeholder="e.g. MSc Computer Science" error={errors.course?.message} {...register("course")} />
                <CB control={control} name="studyLevel" label="Study level" options={STUDY_LEVELS} placeholder="Select level" error={errors.studyLevel?.message} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-soft">{isStudent ? "Expected graduation" : "Graduation"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <CB control={control} name="gradMonth" label="" options={MONTHS} placeholder="Month" />
                    <CB control={control} name="gradYear" label="" options={INTAKE_YEARS} placeholder="Year" />
                  </div>
                </div>
                {isStudent && <Input label="Student email (optional)" placeholder="you@university.ac.uk" error={errors.studentEmail?.message} {...register("studentEmail")} />}
              </>
            )}

            {showWork && (
              <>
                <Input label={isRecruiter ? "Company *" : "Company (optional)"} placeholder="e.g. JP Morgan" error={errors.company?.message} {...register("company")} />
                <Input label={isRecruiter ? "Your role *" : "Job title *"} placeholder={isRecruiter ? "e.g. Talent Partner" : "e.g. Software Engineer"} error={errors.jobTitle?.message} {...register("jobTitle")} />
                <CB control={control} name="industry" label={isRecruiter ? "Industry" : "Industry *"} options={INDUSTRIES} allowOther placeholder="Select industry" error={errors.industry?.message} />
                {isPro && <CB control={control} name="yearsExperience" label="Years of experience *" options={EXPERIENCE_OPTIONS} placeholder="Select experience" error={errors.yearsExperience?.message} />}
                {isRecruiter && <Input label="Hiring for" placeholder="e.g. Graduate software roles" {...register("hiringFor")} />}
                {isPro && (
                  <Controller control={control} name="displayCompany" render={({ field }) => (
                    <label className="flex items-center justify-between rounded-xl border border-sand-border bg-sand-card px-3.5 py-2.5">
                      <span className="text-sm text-ink-soft">Display my company publicly?</span>
                      <button type="button" onClick={() => field.onChange(!field.value)}
                        className={cn("relative h-6 w-11 rounded-full transition-colors", field.value ? "bg-coral" : "bg-sand-border")}>
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-sand-card transition-all", field.value ? "left-[22px]" : "left-0.5")} />
                      </button>
                    </label>
                  )} />
                )}
              </>
            )}
          </>
        )}

        {/* STEP 2 — goals, shared */}
        {step === 2 && (
          <>
            <CB control={control} name="whyJoined" label="Why did you join the community?" options={["To find jobs and referrals","To meet other UK students & graduates","To get visa & PSW advice","To find accommodation / flatmates","To collaborate on projects","To share and learn skills","To hire talent","Just exploring","Other"]} allowOther placeholder="Choose a reason" error={errors.whyJoined?.message} />
            <Controller control={control} name="interests" render={({ field }) => (
              <MultiCombobox label="Interests" values={field.value} onChange={field.onChange} options={INTEREST_OPTIONS} allowCustom placeholder="Search interests..." error={errors.interests?.message} />
            )} />
            <Controller control={control} name="skills" render={({ field }) => (
              <MultiCombobox label={isPro ? "Skills *" : "Skills"} values={field.value} onChange={field.onChange} options={[]} loadOptions={skillService.suggest} allowCustom placeholder="Search skills (powered by ESCO)..." error={errors.skills?.message} />
            )} />
            <Controller control={control} name="lookingFor" render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-soft">What brings you to Kommunitea?</label>
                <div className="flex flex-wrap gap-2">
                  {BRINGS_YOU_OPTIONS.map((opt) => {
                    const active = field.value.includes(opt.value);
                    return (
                      <button type="button" key={opt.value}
                        onClick={() => field.onChange(active ? field.value.filter((v) => v !== opt.value) : [...field.value, opt.value])}
                        className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                          active ? "border-coral bg-coral text-white" : "border-sand-border bg-sand-card text-ink-soft hover:border-coral")}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {errors.lookingFor && <p className="mt-1.5 text-xs text-red-500">{errors.lookingFor.message}</p>}
              </div>
            )} />
            {showWork && (
              <div className="space-y-2 rounded-xl border border-sand-border bg-sand/50 p-4">
                <Controller control={control} name="openToNetworking" render={({ field }) => (
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Open to networking?</span>
                    <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 accent-coral" />
                  </label>
                )} />
                <Controller control={control} name="openToReferrals" render={({ field }) => (
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Open to giving referrals?</span>
                    <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 accent-coral" />
                  </label>
                )} />
              </div>
            )}
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>Continue</Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting}>Finish & join</Button>
          )}
        </div>
      </form>
    </div>
  );
}
