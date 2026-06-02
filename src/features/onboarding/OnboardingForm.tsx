import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { onboardingSchema, type OnboardingValues } from "./onboardingSchema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LOOKING_FOR_OPTIONS, STUDENT_STATUS_OPTIONS, ROUTES } from "@/constants";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

const STEPS = ["About you", "Your studies", "Your goals"] as const;

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<File | null>(null);
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, control, trigger, formState: { errors, isSubmitting } } =
    useForm<OnboardingValues>({
      resolver: zodResolver(onboardingSchema),
      defaultValues: { fullName: user?.fullName ?? "", lookingFor: [] },
    });

  const fieldsByStep: (keyof OnboardingValues)[][] = [
    ["fullName", "city", "status"],
    ["university", "course", "intakeYear"],
    ["whatNext", "whyJoined", "interests", "skills", "lookingFor"],
  ];

  const next = async () => {
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (values: OnboardingValues) => {
    try {
      if (avatar) await profileService.uploadAvatar(avatar);
      const updated = await profileService.completeOnboarding({
        fullName: values.fullName,
        university: values.university,
        course: values.course,
        city: values.city,
        status: values.status as never,
        intakeYear: values.intakeYear,
        graduationDate: values.intakeYear,
        careerGoals: values.whatNext,
        bio: values.whyJoined,
        interests: values.interests.split(",").map((s) => s.trim()).filter(Boolean),
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
        lookingFor: values.lookingFor as never,
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
      {/* Progress */}
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
        {step === 0 && (
          <>
            <div className="flex items-center gap-4">
              <Avatar name={user?.fullName ?? "U"} size="lg" />
              <ImageUploader value={avatar} onChange={setAvatar} className="flex-1" />
            </div>
            <Input label="Full name" placeholder="e.g. Faraz Mohammed" error={errors.fullName?.message} {...register("fullName")} />
            <Input label="Current city in the UK" placeholder="e.g. London" error={errors.city?.message} {...register("city")} />
            <Select label="Student status" placeholder="Select status" options={STUDENT_STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />
          </>
        )}

        {step === 1 && (
          <>
            <Input label="UK university name" placeholder="e.g. Northumbria University" error={errors.university?.message} {...register("university")} />
            <Input label="Course name" placeholder="e.g. MSc Computer Science" error={errors.course?.message} {...register("course")} />
            <Input label="Intake year" type="number" placeholder="e.g. 2024" error={errors.intakeYear?.message} {...register("intakeYear")} />
          </>
        )}

        {step === 2 && (
          <>
            <Input label="What are you doing next?" placeholder="e.g. Looking for a graduate React role" error={errors.whatNext?.message} {...register("whatNext")} />
            <Textarea label="Why did you join the community?" placeholder="What are you hoping to get out of Kommunitea?" error={errors.whyJoined?.message} {...register("whyJoined")} />
            <Input label="Interests (comma separated)" placeholder="e.g. AI, startups, football" error={errors.interests?.message} {...register("interests")} />
            <Input label="Skills (comma separated)" placeholder="e.g. React, Python, SQL" error={errors.skills?.message} {...register("skills")} />
            <Controller
              control={control}
              name="lookingFor"
              render={({ field }) => (
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-soft">What are you looking for?</label>
                  <div className="flex flex-wrap gap-2">
                    {LOOKING_FOR_OPTIONS.map((opt) => {
                      const active = field.value.includes(opt.value);
                      return (
                        <button type="button" key={opt.value}
                          onClick={() => field.onChange(active ? field.value.filter((v) => v !== opt.value) : [...field.value, opt.value])}
                          className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                            active ? "border-coral bg-coral text-white" : "border-sand-border bg-white text-ink-soft hover:border-coral")}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.lookingFor && <p className="mt-1.5 text-xs text-red-500">{errors.lookingFor.message}</p>}
                </div>
              )}
            />
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
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
