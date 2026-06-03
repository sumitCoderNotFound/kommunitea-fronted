import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue, animate as fmAnimate } from "framer-motion";
import {
  ArrowRight, Sun, Moon, Users, Briefcase, CalendarClock, MessageCircle,
  UserCheck, ShieldCheck, BadgeCheck, GraduationCap, Compass, Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES, APP_NAME, CATEGORIES } from "@/constants";
import { useTheme } from "@/hooks/useTheme";

/* ---------------- animated count-up ---------------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = fmAnimate(mv, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    const unsub = mv.on("change", (v) => setVal(Math.floor(v)));
    return () => { controls.stop(); unsub(); };
  }, [inView, to, mv]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ---------------- live activity ticker ---------------- */
const ACTIVITY = [
  { who: "Priya", text: "joined the Northumbria group" },
  { who: "Ahmed", text: "found a referral" },
  { who: "Sarah", text: "added a JP Morgan deadline" },
  { who: "Ravi", text: "found accommodation help" },
];
function LiveActivity() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % ACTIVITY.length), 2600);
    return () => clearInterval(t);
  }, []);
  const a = ACTIVITY[i];
  return (
    <div className="flex items-center gap-2 rounded-full border border-sand-border bg-sand-card/80 px-3 py-1.5 text-xs text-ink-soft backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
          <span className="font-semibold text-ink">{a.who}</span> {a.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- floating product preview cards ---------------- */
function float(delay: number) {
  return {
    animate: { y: [0, -10, 0] },
    transition: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut" as const, delay },
  };
}
function PreviewCards() {
  return (
    <div className="relative h-[440px] w-full">
      {/* mini feed */}
      <motion.div {...float(0)} className="absolute left-0 top-4 w-60 rounded-2xl border border-sand-border bg-sand-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-xs font-bold text-coral">PS</div>
          <div><p className="text-sm font-semibold text-ink">Priya Sharma</p><p className="text-[11px] text-ink-muted">2m ago</p></div>
        </div>
        <p className="mt-2 text-xs text-ink-soft">Just landed a graduate offer at Deloitte. Thanks for the referral, Ahmed!</p>
      </motion.div>

      {/* job referral */}
      <motion.div {...float(0.8)} className="absolute right-0 top-0 w-56 rounded-2xl border border-sand-border bg-sand-card p-4 shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-wide text-coral">Job opportunity</p>
        <p className="mt-1 text-sm font-semibold text-ink">Amazon Grad Scheme</p>
        <p className="text-[11px] text-ink-muted">Referral available by 14 members</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand-border">
          <motion.div className="h-full rounded-full bg-coral" initial={{ width: 0 }} whileInView={{ width: "72%" }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }} />
        </div>
      </motion.div>

      {/* scheduler reminder */}
      <motion.div {...float(1.4)} className="absolute right-4 top-44 w-60 rounded-2xl border border-sand-border bg-sand-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500"><CalendarClock className="h-5 w-5" /></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-orange-500">Interview today</p><p className="text-sm font-semibold text-ink">Monzo Bank · 1:00 PM</p></div>
        </div>
      </motion.div>

      {/* chat notification */}
      <motion.div {...float(0.4)} className="absolute left-2 top-48 w-52 rounded-2xl border border-sand-border bg-sand-card p-3 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral"><MessageCircle className="h-4 w-4" /></div>
          <p className="text-xs text-ink-soft"><span className="font-semibold text-ink">New message</span> from your mentor</p>
        </div>
      </motion.div>

      {/* profile match */}
      <motion.div {...float(1.1)} className="absolute bottom-0 left-8 w-56 rounded-2xl border border-sand-border bg-sand-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500"><UserCheck className="h-5 w-5" /></div>
          <div><p className="text-sm font-semibold text-ink">Profile match found</p><p className="text-[11px] text-ink-muted">Same uni · same goals</p></div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- data ---------------- */
const STATS = [
  { to: 1000, suffix: "+", label: "students connecting" },
  { to: 250, suffix: "+", label: "jobs & referrals shared" },
  { to: 100, suffix: "+", label: "project teammates found" },
  { to: 24, suffix: "/7", label: "community support" },
];
const HELP = [
  { icon: Users, title: "Find your people", text: "Connect with students from your uni, or peers across the UK who share your goals." },
  { icon: Briefcase, title: "Find opportunities", text: "Tap a hidden market of graduate jobs, internships and internal referrals from the community." },
  { icon: Compass, title: "Plan your UK journey", text: "A smart scheduler built for UK life: manage deadlines, visa tasks and accommodation in one place." },
];
const TRUST = [
  { icon: Heart, title: "Free community", text: "No fees, no subscriptions. Ever." },
  { icon: ShieldCheck, title: "No paid scams", text: "We moderate listings strictly." },
  { icon: GraduationCap, title: "Student-first", text: "Built by students, for students." },
  { icon: BadgeCheck, title: "Verified members", text: "Community-driven trust and safety." },
];

export function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-sand">
      {/* glowing gradient orbs */}
      <motion.div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-coral/25 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute -left-24 top-80 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl"
        animate={{ y: [0, -28, 0] }} transition={{ duration: 13, repeat: Infinity }} />

      {/* subtle floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.span key={i} className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-coral/40"
          style={{ left: `${12 + i * 14}%`, top: `${20 + (i % 3) * 18}%` }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }} />
      ))}

      {/* HEADER */}
      <header className="container-app relative z-10 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-coral-dark font-display text-lg font-bold text-white">K</span>
          <span className="font-display text-lg font-bold text-ink">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="rounded-xl p-2 text-ink-soft hover:bg-ink/5">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to={ROUTES.login}><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to={ROUTES.register}><Button size="sm">Join free</Button></Link>
        </div>
      </header>

      {/* HERO */}
      <section className="container-app relative z-10 grid gap-12 pb-12 pt-10 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-sand-border bg-sand-card/70 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-coral" /> Free for all UK students
          </motion.div>

          <motion.h1 initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="font-display text-5xl font-bold leading-[0.98] text-ink sm:text-6xl md:text-7xl">
            {["Your UK", "community for"].map((line) => (
              <motion.span key={line} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="block">{line}</motion.span>
            ))}
            <motion.span variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="relative inline-block">
              <motion.span
                className="bg-gradient-to-r from-coral via-fuchsia-500 to-coral bg-clip-text text-transparent"
                style={{ backgroundSize: "200% auto" }}
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                everything
              </motion.span>
              <motion.svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 w-full" preserveAspectRatio="none">
                <motion.path d="M2 8 Q150 2 298 8" stroke="rgb(var(--coral))" strokeWidth="4" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} />
              </motion.svg>
            </motion.span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-7 max-w-md text-lg text-ink-muted">
            Connecting students, graduates and professionals. Share jobs, find referrals, and navigate
            your UK journey with the tribe that gets it.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={ROUTES.register}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg">Get started free <ArrowRight className="h-4 w-4" /></Button>
              </motion.div>
            </Link>
            <a href="#features">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg" variant="outline">Explore features</Button>
              </motion.div>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6">
            <LiveActivity />
          </motion.div>
        </div>

        {/* right-side floating preview */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="hidden lg:block">
          <PreviewCards />
        </motion.div>
      </section>

      {/* FEATURE MARQUEE (pause on hover, glow) */}
      <style>{`@keyframes km-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div className="group relative z-10 overflow-hidden border-y border-sand-border bg-sand-card/50 py-4">
        <div className="flex w-max gap-3 [animation:km-marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]">
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={i} className="rounded-full border border-sand-border bg-sand-card px-4 py-2 text-sm font-medium text-ink-soft transition-all hover:border-coral/50 hover:text-coral hover:shadow-[0_0_18px_rgb(var(--coral)/0.25)]">
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="container-app relative z-10 grid grid-cols-2 gap-6 py-16 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} className="text-center">
            <p className="font-display text-4xl font-bold text-ink sm:text-5xl"><Counter to={s.to} suffix={s.suffix} /></p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* HOW IT HELPS */}
      <section id="features" className="container-app relative z-10 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Built for your UK journey</h2>
          <p className="mt-3 text-ink-muted">Everything you need to thrive in the UK, from landing your first job to finding the best teammates for your next big idea.</p>
        </motion.div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {HELP.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}
              className="group rounded-3xl border border-sand-border bg-sand-card p-7 shadow-soft transition-shadow hover:shadow-lift">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-transform group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="container-app relative z-10 grid grid-cols-2 gap-6 py-16 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral"><Icon className="h-6 w-6" /></div>
            <h3 className="mt-3 font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-xs text-ink-muted">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="container-app relative z-10 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-sand-border bg-gradient-to-br from-[#1E1E2D] to-[#2A2A45] px-6 py-16 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coral/30 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">Ready to join the tribe?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/70">Join 1,000+ UK students and professionals building their futures together.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.register}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}><Button size="lg">Join for free <ArrowRight className="h-4 w-4" /></Button></motion.div>
            </Link>
            <a href="#features">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <button className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10">Explore features</button>
              </motion.div>
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-sand-border bg-sand-card">
        <div className="container-app flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-coral to-coral-dark text-sm font-bold text-white">K</span>
            <span className="font-display font-bold text-ink">{APP_NAME}</span>
          </div>
          <p className="flex items-center gap-1 text-sm text-ink-muted">Built with <Heart className="h-3.5 w-3.5 fill-coral text-coral" /> for the UK student community</p>
          <div className="flex flex-wrap justify-center gap-5 text-sm text-ink-muted">
            <Link to={ROUTES.privacy} className="hover:text-coral">Privacy</Link>
            <Link to={ROUTES.terms} className="hover:text-coral">Terms</Link>
            <Link to={ROUTES.guidelines} className="hover:text-coral">Guidelines</Link>
            <Link to={ROUTES.contact} className="hover:text-coral">Contact</Link>
          </div>
          <p className="text-xs text-ink-muted">© 2026 {APP_NAME} · A free community for UK students & graduates · 16+</p>
        </div>
      </footer>
    </div>
  );
}
