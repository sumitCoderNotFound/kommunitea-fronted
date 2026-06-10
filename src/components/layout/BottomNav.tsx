import { NavLink } from "react-router-dom";
import { Home, Search, Film, CalendarClock, User } from "lucide-react";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";

/** Bottom tab bar shown only on small screens (mobile browser). */
export function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const items = [
    { to: ROUTES.home, label: "Home", icon: Home, end: true },
    { to: ROUTES.explore, label: "Search", icon: Search },
    { to: ROUTES.clips, label: "Clips", icon: Film },
    { to: ROUTES.plan, label: "Plan", icon: CalendarClock },
    { to: user ? ROUTES.me(user.id) : ROUTES.login, label: "Me", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-border bg-sand/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={label} to={to} end={end}
            className={({ isActive }) => cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              isActive ? "text-coral" : "text-ink-muted",
            )}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
