import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CreatePostModal } from "@/features/posts/CreatePostModal";
import { ImportComposer } from "@/features/import/ImportComposer";
import { Loader } from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import { overshoot } from "@/utils/motion";
import { cn } from "@/utils/cn";

// Bottom nav only shows on the main root tabs (mobile browser). Detail/input
// pages hide it so the chat box, forms and back buttons aren't obscured.
const ROOT_PATHS = ["/feed", "/tribe", "/plan", "/inbox"];

export function AppLayout() {
  const location = useLocation();
  const myId = useAuthStore((s) => s.user?.id);
  const showBottomNav =
    ROOT_PATHS.includes(location.pathname) ||
    (!!myId && location.pathname === `/profile/${myId}`);

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <div className={cn("mx-auto flex w-full max-w-7xl gap-6 px-4 pt-6 sm:px-6", showBottomNav ? "pb-24 lg:pb-6" : "pb-6")}>
        <Sidebar />
        <main className="min-w-0 flex-1">
          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<Loader label="Loading..." />}>
              <AnimatePresence mode="wait">
                <motion.div key={location.pathname}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: overshoot }}>
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <CreatePostModal />
      <ImportComposer />
      {showBottomNav && <BottomNav />}
    </div>
  );
}
