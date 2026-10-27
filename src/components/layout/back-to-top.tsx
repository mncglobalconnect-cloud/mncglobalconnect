"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Floating button that appears after scrolling past the first screen. */
export function BackToTop() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-[#082b59] text-white shadow-[0_12px_30px_rgba(8,43,89,0.35)] transition hover:-translate-y-0.5 hover:bg-[#0b3a75] sm:bottom-7 sm:right-7"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
