import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants";

/** Resolves /@:username to the canonical /profile/:id route (keeps existing profile logic). */
export function UsernameProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    authService.getPublicProfile(username.replace(/^@/, ""))
      .then((u) => navigate(ROUTES.profile(u.id), { replace: true }))
      .catch(() => setNotFound(true));
  }, [username, navigate]);

  if (notFound) {
    return <div className="mx-auto max-w-md py-20 text-center text-ink-muted">That profile doesn't exist.</div>;
  }
  return <div className="mx-auto max-w-md py-20 text-center text-ink-muted">Loading…</div>;
}
