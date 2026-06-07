import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });
type Values = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const toast = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      await authService.confirmPasswordReset(token, values.password);
      toast.success("Password updated. Please log in.");
      navigate(ROUTES.login, { replace: true });
    } catch (e) {
      toast.error((e as Error).message || "This reset link is invalid or has expired.");
    }
  };

  if (!token) {
    return (
      <div>
        <h2 className="font-display text-3xl font-bold">Invalid link</h2>
        <p className="mt-3 text-ink-muted">This password reset link is missing or malformed. Please request a new one.</p>
        <Link to={ROUTES.forgotPassword} className="mt-6 inline-block font-medium text-coral hover:underline">Request a new link</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Set a new password</h2>
      <p className="mt-1 text-ink-muted">Choose a strong password you don't use elsewhere.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="New password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register("confirm")} />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Update password</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to={ROUTES.login} className="font-medium text-coral hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
