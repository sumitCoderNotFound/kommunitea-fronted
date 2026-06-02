import { Outlet, Link } from "react-router-dom";
import { ROUTES, APP_NAME, APP_TAGLINE } from "@/constants";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-sky/10 blur-3xl" />
        <Link to={ROUTES.landing} className="relative flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral-dark font-display text-xl font-bold text-white shadow-soft">K</span>
          <span className="font-display text-xl font-bold">{APP_NAME}</span>
        </Link>
        <div className="relative">
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Your UK student<br />community, <span className="text-coral">together.</span>
          </h1>
          <p className="mt-4 max-w-md text-white/85">
            Join a free community of UK students and graduates sharing jobs, advice,
            referrals and real support. {APP_TAGLINE}
          </p>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} {APP_NAME}</p>
      </div>
      {/* Form panel */}
      <div className="flex items-center justify-center bg-sand p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
