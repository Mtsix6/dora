"use client";

import { motion, useInView, type Variants, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";

/* ── Shared easing curves ────────────────────────────────────────────── */

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
export const EASE_OUT_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const SPRING_SNAPPY = { type: "spring", stiffness: 500, damping: 38 } as const;
export const SPRING_SMOOTH = { type: "spring", stiffness: 300, damping: 30 } as const;
export const SPRING_BOUNCY = { type: "spring", stiffness: 380, damping: 22 } as const;
export const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 26 } as const;

/* ── Reusable animation variants ─────────────────────────────────────── */

/** Fade up — cards, sections, headings */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE_OUT_EXPO, delay: i * 0.06 },
  }),
};

/** Fade in — badges, text, flat items */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_OUT_QUART, delay: i * 0.05 },
  }),
};

/** Scale in — cards, dialogs, modals */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: EASE_OUT_EXPO, delay: i * 0.06 },
  }),
};

/** Pop in — dropdowns, tooltips, small floating elements */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 3,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

/** Slide from left — sidebar items, drawer panels */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO, delay: i * 0.03 },
  }),
};

/** Slide from right — panels, detail views */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO, delay: i * 0.03 },
  }),
};

/** List item — table rows, feed items */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 7 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_OUT_EXPO },
  },
};

/** Stagger container — wraps children with staggered delays */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
};

/** Slide up from bottom — modals, sheets, overlays */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/** Tab content — smooth crossfade with subtle slide */
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/* ── Page transition wrapper ─────────────────────────────────────────── */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(1px)" }}
        transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Scroll-triggered fade-up ────────────────────────────────────────── */

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.58, ease: EASE_OUT_EXPO, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Staggered list ──────────────────────────────────────────────────── */

export function MotionList({
  children,
  className,
  stagger = 0.055,
  delay = 0.04,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Staggered list item ─────────────────────────────────────────────── */

export function MotionItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={listItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Single animated item ────────────────────────────────────────────── */

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
