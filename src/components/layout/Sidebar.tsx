import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, FileText, Bell, Mail, Settings, X, Sparkles, CalendarClock, Search, Film, GraduationCap } from "lucide-react";
import { ROUTES, APP_NAME } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { StreakBadge } from "@/features/profile/StreakBadge";
import { useStreak } from "@/hooks/useStreak";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

const primaryNav = [
  { to: ROUTES.home, label: "Home", icon: Home },
  { to: ROUTES.explore, label: "Search", icon: Search },
  { to: ROUTES.clips, label: "Clips", icon: Film },
  { to: ROUTES.studyMatch, label: "Study Match", icon: GraduationCap },
  { to: ROUTES.plan, label: "Plan", icon: CalendarClock },
  { to: ROUTES.inbox, label: "Inbox", icon: Mail },
];

const secondaryNav = [
  { to: ROUTES.notifications, label: "Notifications", icon: Bell },
  { to: ROUTES.myPosts, label: "My Posts", icon: FileText },
  { to: ROUTES.careerTools, label: "Career Tools", icon: Sparkles },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { currentStreak } = useStreak();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive ? "bg-coral/10 text-coral" : "text-ink-soft hover:bg-ink/5");

  return (
    <nav className="space-y-1">
      {/* Me */}
      {user && (
        <NavLink to={ROUTES.me(user.id)} onClick={onNavigate} className={linkClass}>
          <User className="h-5 w-5" /> Me
        </NavLink>
      )}

      {/* Primary sections */}
      {primaryNav.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate} className={linkClass} end={to === ROUTES.home}>
          <Icon className="h-5 w-5" /> {label}
        </NavLink>
      ))}

      {/* Secondary sections */}
      <div className="pt-4">
        {secondaryNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </div>

      <div className="pt-5">
        <Card className="bg-orange-500/10 p-4">
          <StreakBadge streak={currentStreak} size="sm" />
          <p className="mt-2 text-xs text-ink-muted">Open {APP_NAME} every day to grow your streak 🔥</p>
        </Card>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  return (
    <>
      {/* Desktop: sticky static sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile: slide-in drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/50" onClick={toggleSidebar} />
            <motion.div
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-sand p-5 shadow-lift">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold">{APP_NAME}</span>
                <button onClick={toggleSidebar} className="rounded-lg p-1.5 hover:bg-ink/5"><X className="h-5 w-5" /></button>
              </div>
              <SidebarContent onNavigate={toggleSidebar} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
