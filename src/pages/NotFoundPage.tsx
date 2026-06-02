import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand text-center">
      <p className="font-display text-7xl font-bold text-coral">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to={ROUTES.feed} className="mt-6"><Button>Back to feed</Button></Link>
    </div>
  );
}
