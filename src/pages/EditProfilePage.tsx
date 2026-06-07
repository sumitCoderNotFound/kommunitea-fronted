import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import {
  UK_CITIES, UK_UNIVERSITIES, INTAKE_YEARS, INTEREST_OPTIONS,
  INDUSTRIES, EXPERIENCE_OPTIONS, EXPERIENCE_LEVELS, JOB_TYPES, CONTENT_NICHES, NEWCOMER_NEEDS,
} from "@/constants/options";
import { useAuthStore } from "@/store/authStore";
import { profileService } from "@/services/profileService";
import { skillService } from "@/services/skillService";
import { useToast } from "@/hooks/useToast";
import type { User } from "@/types";

export function EditProfilePage() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const [showPicker, setShowPicker] = useState(false);

  const handleAvatarPick = async (file: File) => {
    try {
      const updated = await profileService.uploadAvatar(file);
      setUser(updated);
      toast.success("Avatar updated");
      setShowPicker(false);
    } catch (e) { toast.error((e as Error).message); }
  };
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<Partial<User>>({
    defaultValues: {
      fullName: user?.fullName, university: user?.university, course: user?.course,
      city: user?.city, intakeYear: user?.intakeYear, careerGoals: user?.careerGoals, bio: user?.bio,
      skills: user?.skills ?? [], interests: user?.interests ?? [],
      linkedin: user?.linkedin, github: user?.github, portfolio: user?.portfolio,
      // Professional / recruiter
      company: user?.company, jobTitle: user?.jobTitle, industry: user?.industry,
      yearsExperience: user?.yearsExperience, hiringFor: user?.hiringFor,
      displayCompany: user?.displayCompany ?? true,
      openToNetworking: user?.openToNetworking ?? true,
      openToReferrals: user?.openToReferrals ?? false,
      // Job seeker
      targetRole: user?.targetRole, experienceLevel: user?.experienceLevel, jobType: user?.jobType,
      // Creator
      contentNiche: user?.contentNiche, instagram: user?.instagram, youtube: user?.youtube,
      tiktok: user?.tiktok, creatorTopics: user?.creatorTopics ?? [],
      // Newcomer
      destinationCity: user?.destinationCity, arrivalDate: user?.arrivalDate,
      newcomerNeeds: user?.newcomerNeeds ?? [],
    },
  });

  const ut = user?.userType;
  const isPro = ut === "professional";
  const isRecruiter = ut === "recruiter";
  const isJobSeeker = ut === "job_seeker";
  const isCreator = ut === "creator";
  const isNewcomer = ut === "newcomer";

  const onSubmit = async (values: Partial<User>) => {
    try {
      const updated = await profileService.update(values);
      setUser(updated);
      toast.success("Profile updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-display text-2xl font-bold">Edit profile</h1>
      <Card className="p-6">
        {/* Avatar */}
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-4">
            <Avatar name={user?.fullName ?? "U"} src={user?.avatarUrl} size="lg" />
            <button type="button" onClick={() => setShowPicker((s) => !s)}
              className="text-sm font-medium text-coral hover:underline">
              {showPicker ? "Hide avatars" : "Change avatar"}
            </button>
          </div>
          {showPicker && <AvatarPicker onPick={handleAvatarPick} seedBase={user?.fullName ?? "kommunitea"} />}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register("fullName")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller control={control} name="university" render={({ field }) => (
              <Combobox label="University" value={field.value ?? ""} onChange={field.onChange} options={UK_UNIVERSITIES} allowOther placeholder="Select university" />
            )} />
            <Input label="Course" {...register("course")} />
            <Controller control={control} name="city" render={({ field }) => (
              <Combobox label="City" value={field.value ?? ""} onChange={field.onChange} options={UK_CITIES} allowOther placeholder="Select city" />
            )} />
            <Controller control={control} name="intakeYear" render={({ field }) => (
              <Combobox label="Intake year" value={field.value ?? ""} onChange={field.onChange} options={INTAKE_YEARS} placeholder="Select year" />
            )} />
          </div>
          <Input label="Career goals" {...register("careerGoals")} />
          <Textarea label="Bio" {...register("bio")} />
          <Controller control={control} name="interests" render={({ field }) => (
            <MultiCombobox label="Interests" values={field.value ?? []} onChange={field.onChange} options={INTEREST_OPTIONS} allowCustom placeholder="Search interests..." />
          )} />
          <Controller control={control} name="skills" render={({ field }) => (
            <MultiCombobox label="Skills" values={field.value ?? []} onChange={field.onChange} options={[]} loadOptions={skillService.suggest} allowCustom placeholder="Search skills (ESCO)..." />
          )} />

          {/* Role-specific fields */}
          {(isPro || isRecruiter) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company" {...register("company")} />
              <Input label={isRecruiter ? "Your role" : "Job title"} {...register("jobTitle")} />
              <Controller control={control} name="industry" render={({ field }) => (
                <Combobox label="Industry" value={field.value ?? ""} onChange={field.onChange} options={INDUSTRIES} allowOther placeholder="Select industry" />
              )} />
              {isPro && (
                <Controller control={control} name="yearsExperience" render={({ field }) => (
                  <Combobox label="Years of experience" value={field.value ?? ""} onChange={field.onChange} options={EXPERIENCE_OPTIONS} placeholder="Select experience" />
                )} />
              )}
              {isRecruiter && <Input label="Hiring for" {...register("hiringFor")} />}
            </div>
          )}

          {isJobSeeker && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Target role" {...register("targetRole")} />
              <Controller control={control} name="experienceLevel" render={({ field }) => (
                <Combobox label="Experience level" value={field.value ?? ""} onChange={field.onChange} options={EXPERIENCE_LEVELS} placeholder="Select level" />
              )} />
              <Controller control={control} name="jobType" render={({ field }) => (
                <Combobox label="Preferred job type" value={field.value ?? ""} onChange={field.onChange} options={JOB_TYPES} placeholder="Select type" />
              )} />
              <Controller control={control} name="industry" render={({ field }) => (
                <Combobox label="Industry" value={field.value ?? ""} onChange={field.onChange} options={INDUSTRIES} allowOther placeholder="Select industry" />
              )} />
            </div>
          )}

          {isCreator && (
            <>
              <Controller control={control} name="contentNiche" render={({ field }) => (
                <Combobox label="Content niche" value={field.value ?? ""} onChange={field.onChange} options={CONTENT_NICHES} allowOther placeholder="Select niche" />
              )} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Instagram" placeholder="https://" {...register("instagram")} />
                <Input label="YouTube" placeholder="https://" {...register("youtube")} />
                <Input label="TikTok" placeholder="https://" {...register("tiktok")} />
              </div>
              <Controller control={control} name="creatorTopics" render={({ field }) => (
                <MultiCombobox label="Topics" values={field.value ?? []} onChange={field.onChange} options={INTEREST_OPTIONS} allowCustom placeholder="Add topics..." />
              )} />
            </>
          )}

          {isNewcomer && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller control={control} name="destinationCity" render={({ field }) => (
                  <Combobox label="Destination city" value={field.value ?? ""} onChange={field.onChange} options={UK_CITIES} allowOther placeholder="Select city" />
                )} />
                <Input label="Arrival (e.g. September 2025)" {...register("arrivalDate")} />
              </div>
              <Controller control={control} name="newcomerNeeds" render={({ field }) => (
                <MultiCombobox label="What you need help with" values={field.value ?? []} onChange={field.onChange} options={NEWCOMER_NEEDS} allowCustom placeholder="Select needs..." />
              )} />
            </>
          )}

          {/* Networking availability for pros/recruiters */}
          {(isPro || isRecruiter) && (
            <div className="space-y-2 rounded-xl border border-sand-border bg-sand/50 p-4">
              <Controller control={control} name="openToNetworking" render={({ field }) => (
                <label className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Open to networking?</span>
                  <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 accent-coral" />
                </label>
              )} />
              <Controller control={control} name="openToReferrals" render={({ field }) => (
                <label className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Open to giving referrals?</span>
                  <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 accent-coral" />
                </label>
              )} />
              <Controller control={control} name="displayCompany" render={({ field }) => (
                <label className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Display company publicly?</span>
                  <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 accent-coral" />
                </label>
              )} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="LinkedIn" placeholder="https://" {...register("linkedin")} />
            <Input label="GitHub" placeholder="https://" {...register("github")} />
            <Input label="Portfolio" placeholder="https://" {...register("portfolio")} />
          </div>
          <div className="flex justify-end"><Button type="submit" isLoading={isSubmitting}>Save changes</Button></div>
        </form>
      </Card>
    </div>
  );
}
