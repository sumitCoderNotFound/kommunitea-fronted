import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

/**
 * Guards authenticated areas.
 * - Not logged in       -> redirect to /login (remembering where they wanted to go)
 * - Logged in, not onboarded -> force /onboarding
 */
export function ProtectedRoute({ requireOnboarded = true }: { requireOnboarded?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }
  if (requireOnboarded && user && !user.isOnboarded) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }
  return <Outlet />;
}
