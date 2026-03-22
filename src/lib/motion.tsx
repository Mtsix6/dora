"use client";

import { motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

/* ── Shared easing curves ────────────────────────────────────────────── */

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];

/* ── Reusable animation variants ─────────────────────────────────────── */

/** Fade up — great for cards, sections, headings */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO, delay: i * 0.06 },
  }),
};

/** Fade in — for flat items like badges, text */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

/** Scale in — for cards, dialogs */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO, delay: i * 0.06 },
  }),
};

/** Slide from left — for sidebar items */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO, delay: i * 0.03 },
  }),
};

/** Stagger container — wraps children with staggered delays */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

/* ── Page transition wrapper ─────────────────────────────────────────── */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

/* ── Animated list item ──────────────────────────────────────────────── */

export function AnimatedItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}
