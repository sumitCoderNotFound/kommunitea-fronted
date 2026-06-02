import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      const user = await login(values.email, values.password);
      const dest = !user.isOnboarded ? ROUTES.onboarding : (location.state?.from?.pathname ?? ROUTES.feed);
      navigate(dest, { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <h2 className="font-display text-3xl font-bold">Welcome back 👋</h2>
      <p className="mt-1 text-ink-muted">Log in to continue to your tribe.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="Email" type="email" placeholder="you@university.ac.uk" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        New here? <Link to={ROUTES.register} className="font-medium text-coral hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
