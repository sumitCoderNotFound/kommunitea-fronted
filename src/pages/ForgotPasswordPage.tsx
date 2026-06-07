import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    // Backend always returns the same generic message — we mirror that.
    try { await authService.requestPasswordReset(values.email); } catch { /* still show generic */ }
    setSent(true);
  };

  if (sent) {
    return (
      <div>
        <h2 className="font-display text-3xl font-bold">Check your email</h2>
        <p className="mt-3 text-ink-muted">
          If an account exists for that address, we've sent password reset instructions. The link expires in 1 hour.
        </p>
        <Link to={ROUTES.login} className="mt-6 inline-block font-medium text-coral hover:underline">← Back to log in</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Forgot password?</h2>
      <p className="mt-1 text-ink-muted">Enter your email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="Email" type="email" placeholder="you@university.ac.uk" error={errors.email?.message} {...register("email")} />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Send reset link</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        Remembered it? <Link to={ROUTES.login} className="font-medium text-coral hover:underline">Log in</Link>
      </p>
    </div>
  );
}
