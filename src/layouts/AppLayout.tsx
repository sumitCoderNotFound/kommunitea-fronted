import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreatePostModal } from "@/features/posts/CreatePostModal";
import { overshoot } from "@/utils/motion";

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <ErrorBoundary key={location.pathname}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: overshoot }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
      <CreatePostModal />
    </div>
  );
}
