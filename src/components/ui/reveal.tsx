"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after the element enters the viewport. */
  delay?: number;
  /** Starting vertical offset in pixels. */
  y?: number;
  as?: "div" | "section" | "li";
};

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 18, as = "div" }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
