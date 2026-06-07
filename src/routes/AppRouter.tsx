import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "@/constants";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { ChooseUsernamePage } from "@/pages/ChooseUsernamePage";
import { UsernameProfilePage } from "@/pages/UsernameProfilePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { FeedPage } from "@/pages/FeedPage";
import { ImportSharePage } from "@/pages/ImportSharePage";
import { TribePage } from "@/pages/TribePage";
import { StudyMatchHomePage } from "@/pages/study/StudyMatchHomePage";
import { StudyMatchStartPage } from "@/pages/study/StudyMatchStartPage";
import { StudyMatchResultsPage } from "@/pages/study/StudyMatchResultsPage";
import { StudyMatchCountriesPage } from "@/pages/study/StudyMatchCountriesPage";
import {
  StudyMatchCitiesPage, StudyMatchCoursesPage, StudyMatchSavedPage,
  StudyMatchChecklistPage, StudyMatchUniversitiesPage,
} from "@/pages/study/StudyMatchMiscPages";
import { CareerToolsPage } from "@/pages/CareerToolsPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { JobDetailPage } from "@/pages/JobDetailPage";
import { FollowListPage } from "@/pages/FollowListPage";
import { EditProfilePage } from "@/pages/EditProfilePage";
import { MyPostsPage } from "@/pages/MyPostsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SchedulerPage } from "@/pages/SchedulerPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPage } from "@/pages/legal/PrivacyPage";
import { TermsPage } from "@/pages/legal/TermsPage";
import { GuidelinesPage } from "@/pages/legal/GuidelinesPage";
import { ContactPage } from "@/pages/legal/ContactPage";

// Heavy pages are code-split (lazy) to shrink the initial bundle.
const CommunityDetailPage = lazy(() => import("@/pages/CommunityDetailPage").then((m) => ({ default: m.CommunityDetailPage })));
const SponsorshipJobFinderPage = lazy(() => import("@/pages/SponsorshipJobFinderPage").then((m) => ({ default: m.SponsorshipJobFinderPage })));
const CVReviewPage = lazy(() => import("@/pages/CVReviewPage").then((m) => ({ default: m.CVReviewPage })));
const ReferralTrackerPage = lazy(() => import("@/pages/ReferralTrackerPage").then((m) => ({ default: m.ReferralTrackerPage })));
const InterviewPrepPage = lazy(() => import("@/pages/InterviewPrepPage").then((m) => ({ default: m.InterviewPrepPage })));
const MessagesPage = lazy(() => import("@/pages/MessagesPage").then((m) => ({ default: m.MessagesPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));

const router = createBrowserRouter([
  { path: ROUTES.landing, element: <LandingPage /> },
  // Public legal / info pages
  { path: ROUTES.privacy, element: <PrivacyPage /> },
  { path: ROUTES.terms, element: <TermsPage /> },
  { path: ROUTES.guidelines, element: <GuidelinesPage /> },
  { path: ROUTES.contact, element: <ContactPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
      { path: ROUTES.verifyEmail, element: <VerifyEmailPage /> },
      { path: ROUTES.chooseUsername, element: <ChooseUsernamePage /> },
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
          { path: "/import-share", element: <ImportSharePage /> },
          // Tribe
          { path: "/tribe", element: <TribePage /> },
          { path: ROUTES.studyMatch, element: <StudyMatchHomePage /> },
          { path: ROUTES.studyMatchStart, element: <StudyMatchStartPage /> },
          { path: "/study-match/results/:id", element: <StudyMatchResultsPage /> },
          { path: ROUTES.studyMatchCountries, element: <StudyMatchCountriesPage /> },
          { path: ROUTES.studyMatchCourses, element: <StudyMatchCoursesPage /> },
          { path: ROUTES.studyMatchUniversities, element: <StudyMatchUniversitiesPage /> },
          { path: ROUTES.studyMatchCities, element: <StudyMatchCitiesPage /> },
          { path: ROUTES.studyMatchSaved, element: <StudyMatchSavedPage /> },
          { path: ROUTES.studyMatchChecklist, element: <StudyMatchChecklistPage /> },
          { path: "/communities/:id", element: <CommunityDetailPage /> },
          // Career Tools hub + tools
          { path: "/career-tools", element: <CareerToolsPage /> },
          { path: "/plan/sponsorship-jobs", element: <SponsorshipJobFinderPage /> },
          { path: "/plan/cv-review", element: <CVReviewPage /> },
          { path: "/plan/referrals", element: <ReferralTrackerPage /> },
          { path: "/plan/interview-prep", element: <InterviewPrepPage /> },
          { path: "/jobs/:id", element: <JobDetailPage /> },
          { path: "/posts/:id", element: <PostDetailPage /> },
          { path: "/@:username", element: <UsernameProfilePage /> },
          { path: "/profile/:id/followers", element: <FollowListPage mode="followers" /> },
          { path: "/profile/:id/following", element: <FollowListPage mode="following" /> },
          { path: ROUTES.profile(), element: <ProfilePage /> },
          { path: ROUTES.editProfile, element: <EditProfilePage /> },
          { path: ROUTES.myPosts, element: <MyPostsPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
          { path: ROUTES.notifications, element: <NotificationsPage /> },
          // Inbox (new canonical) + /messages back-compat + thread route
          { path: "/inbox", element: <MessagesPage /> },
          { path: "/inbox/:conversationId", element: <MessagesPage /> },
          { path: "/messages", element: <MessagesPage /> },
          // Plan (new canonical) + /scheduler back-compat
          { path: "/plan", element: <SchedulerPage /> },
          { path: "/scheduler", element: <SchedulerPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
