import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { profileService } from "@/services/profileService";
import { useToast } from "@/hooks/useToast";
import type { User } from "@/types";

export function EditProfilePage() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Partial<User>>({
    defaultValues: {
      fullName: user?.fullName, university: user?.university, course: user?.course,
      city: user?.city, careerGoals: user?.careerGoals, bio: user?.bio,
      linkedin: user?.linkedin, github: user?.github, portfolio: user?.portfolio,
    },
  });

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register("fullName")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="University" {...register("university")} />
            <Input label="Course" {...register("course")} />
            <Input label="City" {...register("city")} />
            <Input label="Career goals" {...register("careerGoals")} />
          </div>
          <Textarea label="Bio" {...register("bio")} />
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
