import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, Briefcase, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES, APP_NAME, CATEGORIES } from "@/constants";
import { listStagger, dropWord, popIn, springy, overshoot } from "@/utils/motion";

const features = [
  { icon: Users, title: "Real community", text: "Talk to UK students and grads who actually help each other out." },
  { icon: Briefcase, title: "Jobs & referrals", text: "Job leads, internships and referrals shared by the tribe. Free." },
  { icon: ShieldCheck, title: "Verified members", text: "University-verified profiles you can trust." },
  { icon: Sparkles, title: "Smart matches", text: "Find people from your uni, course or skillset in seconds." },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sand">
      {/* playful floating blobs */}
      <motion.div
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-coral/20 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity }} />
      <motion.div
        className="pointer-events-none absolute -left-20 top-72 h-80 w-80 rounded-full bg-sky/15 blur-3xl"
        animate={{ y: [0, -24, 0] }} transition={{ duration: 11, repeat: Infinity }} />

      <header className="container-app relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral font-display text-lg font-bold text-white">K</span>
          <span className="font-display text-lg font-bold">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.login}><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to={ROUTES.register}><Button size="sm">Join free</Button></Link>
        </div>
      </header>

      {/* HERO: asymmetric, oversized, words drop in */}
      <section className="container-app relative pb-10 pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ ...springy, delay: 0.1 }}
          className="mb-6 inline-block rotate-[-2deg] rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">
          🇬🇧 Free community · No paid scams
        </motion.div>

        <motion.h1 variants={listStagger} initial="hidden" animate="show"
          className="max-w-4xl font-display text-6xl font-bold leading-[0.95] sm:text-7xl md:text-8xl">
          <motion.span variants={dropWord} className="block">Your UK</motion.span>
          <motion.span variants={dropWord} className="block">
            community for <motion.span
              className="relative inline-block text-coral"
              whileHover={{ rotate: [0, -3, 3, 0] }}>
              everything
              <motion.svg viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }}>
                <motion.path d="M2 8 Q150 2 298 8" stroke="#5B5FEF" strokeWidth="4" fill="none" strokeLinecap="round" />
              </motion.svg>
            </motion.span>
          </motion.span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease: overshoot, duration: 0.6 }}
          className="mt-7 max-w-xl text-lg text-ink-muted">
          Come in, talk, and share anything with UK students and graduates. Jobs, advice,
          housing, visa tips, wins, whatever is on your mind. We figure it out together.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, ease: overshoot, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-3">
          <Link to={ROUTES.register}>
            <motion.div whileHover={{ scale: 1.05, rotate: -1 }} whileTap={{ scale: 0.96 }}>
              <Button size="lg">Join the tribe <ArrowRight className="h-4 w-4" /></Button>
            </motion.div>
          </Link>
          <Link to={ROUTES.login}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button size="lg" variant="outline">I have an account</Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* scrolling category marquee */}
      <div className="relative overflow-hidden border-y border-sand-border bg-white/60 py-4">
        <motion.div className="flex gap-3 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={i} className="rounded-full border border-sand-border bg-white px-4 py-2 text-sm font-medium text-ink-soft">
              {c.emoji} {c.label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* feature cards */}
      <motion.section variants={listStagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        className="container-app grid gap-4 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} variants={popIn} whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
            className="rounded-2xl border border-sand-border bg-white p-6 shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-coral"><Icon className="h-6 w-6" /></div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{text}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
