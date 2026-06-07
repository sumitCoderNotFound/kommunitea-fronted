import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UsernameInput } from "@/features/auth/UsernameInput";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { ROUTES } from "@/constants";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type Values = z.infer<typeof schema>;

export function RegisterPage() {
  const { login } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [usernameOk, setUsernameOk] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    if (!usernameOk) { toast.error("Please choose an available username."); return; }
    try {
      const res = await authService.register({ ...values, username: username.trim().toLowerCase() });
      await login(values.email, values.password);
      if (res.detail?.includes("could not be sent")) {
        toast.error("Account created, but the verification email couldn't be sent. You can resend it from the verify page.");
      } else {
        toast.success("Account created! Check your email to verify your address.");
      }
      navigate(ROUTES.onboarding, { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Join the tribe</h2>
      <p className="mt-1 text-ink-muted">Free forever. Takes 30 seconds.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="Full name" placeholder="Faraz Mohammed" error={errors.fullName?.message} {...register("fullName")} />
        <UsernameInput value={username} onChange={setUsername} onAvailabilityChange={setUsernameOk} />
        <Input label="Email" type="email" placeholder="you@university.ac.uk" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Create account</Button>
      </form>
      <GoogleSignInButton />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already a member? <Link to={ROUTES.login} className="font-medium text-coral hover:underline">Log in</Link>
      </p>
    </div>
  );
}
