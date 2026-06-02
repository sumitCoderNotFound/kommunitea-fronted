import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, FileText, Bell, Mail, Settings, Compass, X, Sparkles } from "lucide-react";
import { ROUTES, CATEGORIES, APP_NAME } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { StreakBadge } from "@/features/profile/StreakBadge";
import { useStreak } from "@/hooks/useStreak";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

const nav = [
  { to: ROUTES.feed, label: "Community Feed", icon: Home },
  { to: ROUTES.myPosts, label: "My Posts", icon: FileText },
  { to: ROUTES.aiTools, label: "AI Tools", icon: Sparkles },
  { to: ROUTES.messages, label: "Messages", icon: Mail },
  { to: ROUTES.notifications, label: "Notifications", icon: Bell },
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
      {user && (
        <NavLink to={ROUTES.profile(user.id)} onClick={onNavigate} className={linkClass}>
          <User className="h-5 w-5" /> My Profile
        </NavLink>
      )}
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
          <Icon className="h-5 w-5" /> {label}
        </NavLink>
      ))}

      <div className="pt-5">
        <p className="flex items-center gap-2 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          <Compass className="h-3.5 w-3.5" /> Categories
        </p>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <NavLink key={c.value} to={`${ROUTES.feed}?category=${c.value}`} onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-ink/5">
              <span>{c.emoji}</span> {c.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="pt-5">
        <Card className="bg-gradient-to-br from-orange-50 to-coral/10 p-4">
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
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={toggleSidebar} />
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
