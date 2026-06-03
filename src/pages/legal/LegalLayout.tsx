import { Link } from "react-router-dom";
import { ROUTES, APP_NAME } from "@/constants";

export function LegalLayout({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-sand-border bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to={ROUTES.landing} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral-dark font-display text-lg font-bold text-white">K</span>
            <span className="font-display text-lg font-bold text-ink">{APP_NAME}</span>
          </Link>
          <Link to={ROUTES.landing} className="text-sm font-medium text-coral hover:underline">← Back to home</Link>
        </div>
      </header>
      <main className="container-app max-w-3xl py-10">
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        {updated && <p className="mt-1 text-sm text-ink-muted">Last updated: {updated}</p>}
        <div className="legal-body mt-6 space-y-5 text-[15px] leading-relaxed text-ink-soft">
          {children}
        </div>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-sand-border pt-6 text-sm text-ink-muted">
          <Link to={ROUTES.privacy} className="hover:text-coral">Privacy</Link>
          <Link to={ROUTES.terms} className="hover:text-coral">Terms</Link>
          <Link to={ROUTES.guidelines} className="hover:text-coral">Community Guidelines</Link>
          <Link to={ROUTES.contact} className="hover:text-coral">Contact</Link>
        </div>
      </main>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold text-ink pt-2">{children}</h2>;
}
