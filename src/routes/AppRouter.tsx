import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "@/constants";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { FeedPage } from "@/pages/FeedPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { EditProfilePage } from "@/pages/EditProfilePage";
import { MyPostsPage } from "@/pages/MyPostsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { AIToolsPage } from "@/pages/AIToolsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  { path: ROUTES.landing, element: <LandingPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
  // Onboarding: authenticated but does NOT require completed onboarding
  {
    element: <ProtectedRoute requireOnboarded={false} />,
    children: [{ path: ROUTES.onboarding, element: <OnboardingPage /> }],
  },
  // Main app: authenticated + onboarded
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.feed, element: <FeedPage /> },
          { path: ROUTES.profile(), element: <ProfilePage /> },
          { path: ROUTES.editProfile, element: <EditProfilePage /> },
          { path: ROUTES.myPosts, element: <MyPostsPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
          { path: ROUTES.notifications, element: <NotificationsPage /> },
          { path: ROUTES.messages, element: <MessagesPage /> },
          { path: ROUTES.aiTools, element: <AIToolsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
