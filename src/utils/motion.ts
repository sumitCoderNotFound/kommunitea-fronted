import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion language for Kommunitea.
 * Punchy, springy, a little playful, but never noisy.
 * Custom springs + overshoot easing give it personality
 * instead of the default fade-everything look.
 */

export const springy: Transition = { type: "spring", stiffness: 420, damping: 28, mass: 0.7 };
export const snappy: Transition = { type: "spring", stiffness: 600, damping: 32 };
export const overshoot = [0.34, 1.56, 0.64, 1] as const; // back-out, gives a little pop

// Stagger a list of children into view, one after another
export const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// Each item rises + scales in with a tiny overshoot
export const popIn: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: overshoot } },
};

// Slide in from the left with character
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: overshoot } },
};

// Big headline words that drop in
export const dropWord: Variants = {
  hidden: { opacity: 0, y: 40, rotate: -3 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.6, ease: overshoot } },
};
