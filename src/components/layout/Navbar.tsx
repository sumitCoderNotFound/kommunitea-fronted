import { Link, useNavigate } from "react-router-dom";
import { Bell, Plus, LogOut, Menu, Mail, Sun, Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { messageService } from "@/services/messageService";
import { useTheme } from "@/hooks/useTheme";
import { UserSearch } from "@/features/profile/UserSearch";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { ROUTES, APP_NAME } from "@/constants";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { setCreatePostOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { data: unread = 0 } = useQuery({
    queryKey: ["notif-count"],
    queryFn: notificationService.unreadCount,
    refetchInterval: 15000,
  });
  // Total unread messages = sum of unread across all conversations
  const { data: msgUnread = 0 } = useQuery({
    queryKey: ["msg-unread"],
    queryFn: async () => {
      const convos = await messageService.conversations();
      return (convos ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    },
    refetchInterval: 15000,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-sand-border bg-sand">
      <div className="container-app flex h-16 items-center gap-4">
        <button className="lg:hidden" onClick={toggleSidebar} aria-label="Menu">
          <Menu className="h-6 w-6 text-ink" />
        </button>

        <Link to={ROUTES.feed} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral-dark font-display text-lg font-bold text-white shadow-soft">K</span>
          <span className="hidden font-display text-lg font-bold text-ink sm:block">{APP_NAME}</span>
        </Link>

        <div className="ml-2 hidden flex-1 md:block">
          <UserSearch />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setCreatePostOpen(true)} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" /> Post
          </Button>
          <button onClick={toggle} className="rounded-xl p-2 hover:bg-ink/5" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5 text-ink-soft" /> : <Moon className="h-5 w-5 text-ink-soft" />}
          </button>
          <Link to={ROUTES.messages} className="relative rounded-xl p-2 hover:bg-ink/5" aria-label="Messages">
            <Mail className="h-5 w-5 text-ink-soft" />
            {msgUnread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {msgUnread > 9 ? "9+" : msgUnread}
              </span>
            )}
          </Link>
          <Link to={ROUTES.notifications} className="relative rounded-xl p-2 hover:bg-ink/5" aria-label="Notifications">
            <Bell className="h-5 w-5 text-ink-soft" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          {user && (
            <Link to={ROUTES.profile(user.id)}>
              <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            </Link>
          )}
          <button
            onClick={() => { logout(); navigate(ROUTES.landing); }}
            className="rounded-xl p-2 hover:bg-ink/5"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5 text-ink-soft" />
          </button>
        </div>
      </div>
    </header>
  );
}
