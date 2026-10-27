"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const format = new Intl.NumberFormat("en");

/**
 * Counts from zero to the number in `value` when it scrolls into view, keeping any
 * prefix or suffix such as "+" in "50,000+". Server-rendered text is the final value.
 */
export function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    const match = value.match(/^(\D*)([\d,]+)(.*)$/);
    if (!element || !inView || reducedMotion || !match) return;
    const [, prefix, digits, suffix] = match;
    const target = Number(digits.replace(/,/g, ""));
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => { element.textContent = `${prefix}${format.format(Math.round(latest))}${suffix}`; },
    });
    return () => controls.stop();
  }, [inView, reducedMotion, value, duration]);

  return <span ref={ref} className="tabular-nums">{value}</span>;
}
