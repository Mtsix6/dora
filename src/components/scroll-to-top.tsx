"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Scroll-to-top bubble — fixed to the viewport (rendered via portal to body).
 * Shows when scrolled down & scrolling UP. Hides when scrolling down.
 * Listens to #main-scroll for dashboard layout.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;

    let lastY = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = el.scrollTop;
        const isScrollingUp = y < lastY;
        const isFarEnough = y > 180;
        // Show when scrolling UP and past threshold; hide when scrolling DOWN
        if (Math.abs(y - lastY) > 4) {
          setVisible(isScrollingUp && isFarEnough);
          lastY = y;
        }
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    document.getElementById("main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top-btn"
          initial={{ opacity: 0, scale: 0.35, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.35, y: 20 }}
          whileHover={{
            scale: 1.14,
            y: -5,
            boxShadow: "0 16px_40px rgba(99,91,255,0.6)",
          }}
          whileTap={{ scale: 0.86 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[990] size-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-[0_6px_28px_rgba(99,91,255,0.5)] flex items-center justify-center"
          aria-label="Back to top"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20" height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ y: [0, -2.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>,
    document.body
  );
}
