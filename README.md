# UK Job Tribe (UJT) — Frontend

A production-ready React + TypeScript community platform for UK students and graduates.
Pairs with the UJT Django backend.

## Tech stack
- **React 18 + TypeScript** (Vite)
- **React Router v6** — nested routes, layouts, guards
- **Zustand** — lightweight global state (auth + UI)
- **React Query (TanStack)** — server state, caching, mutations
- **React Hook Form + Zod** — typed, validated forms
- **Tailwind CSS** — custom brand design system
- **Axios** — API client with auth interceptors
- **lucide-react** — icons

## Getting started
```bash
npm install
cp .env.example .env      # point VITE_API_URL at your Django backend
npm run dev               # http://localhost:5173
npm run build             # production build -> dist/
```

The app ships with **mock data** (`src/services/mockData.ts`) so every screen renders
before the backend is connected. Swap the mock imports for the `usePosts()` / service
calls (commented in each page) when the API is live.

## Folder structure
```
src/
  assets/        global styles, fonts
  components/
    ui/          design-system primitives (Button, Input, Modal, Avatar…)
    layout/      Navbar, Sidebar
    feedback/    Toast, EmptyState
  layouts/       AppLayout (authed shell), AuthLayout (login/register)
  pages/         one component per route
  features/      domain modules (auth, posts, profile, onboarding)
  hooks/         reusable hooks (useToast, usePosts)
  services/      API layer (apiClient + per-domain services)
  store/         Zustand stores (auth, ui)
  routes/        AppRouter + ProtectedRoute
  types/         shared TypeScript domain types
  utils/         helpers (cn, format)
  constants/     routes, categories, options
```

## Architecture notes
- **Separation of concerns:** pages compose features; features use services; services
  talk to the API. UI primitives never know about the domain.
- **State split:** Zustand for *client* state (who's logged in, is a modal open);
  React Query for *server* state (posts, profiles) so caching/refetch is automatic.
- **Auth flow:** `ProtectedRoute` redirects unauthenticated users to `/login` and
  forces incomplete profiles to `/onboarding`. Tokens live in localStorage and are
  attached by the Axios request interceptor.
- **Forms:** every form is a Zod schema + React Hook Form, so validation is typed and
  consistent. See `OnboardingForm` (multi-step) and `CreatePostModal`.
- **Design system:** brand tokens live in `tailwind.config.js` (navy ink + coral accent,
  Clash Display + Satoshi fonts). Components use these tokens, never hard-coded colours.

## Routing
| Route | Access | Page |
|-------|--------|------|
| `/` | public | Landing |
| `/login`, `/register` | public | Auth |
| `/onboarding` | auth | Onboarding (multi-step) |
| `/feed` | auth + onboarded | Community feed |
| `/profile/:id` | auth | Profile |
| `/settings/profile` | auth | Edit profile |
| `/my-posts` | auth | My posts |
| `/settings` | auth | Settings |
| `/notifications` | auth | Notifications |
| `*` | — | 404 |

## Connecting to the backend
The service layer already expects these endpoints (matching the Django API):
`/auth/login`, `/auth/register`, `/auth/me`, `/posts`, `/posts/:id/like`,
`/profiles/me`, `/profiles/:id/follow`, etc. Implement the auth + posts endpoints on
the Django side, set `VITE_API_URL`, and remove the mock-data imports.

## ✅ Backend integration (LIVE)
This frontend is wired to the UJT Django backend:
- `App.tsx` restores the session from a stored JWT on load (`/auth/me`)
- `FeedPage`, `ProfilePage`, `MyPostsPage` use React Query hooks (`usePosts`, `useProfile`, `useMyPosts`) that call the real API
- `CreatePostModal`, `OnboardingForm`, login & register all POST/PATCH to the backend
- Mock data remains only as a **graceful fallback** if the API is unreachable

### Run both together
```bash
# terminal 1 — backend
cd ujt-backend && python manage.py runserver

# terminal 2 — frontend
cd ujt-frontend && npm install && npm run dev
```
Set `VITE_API_URL=http://localhost:8000/api` in `.env` (already done).
