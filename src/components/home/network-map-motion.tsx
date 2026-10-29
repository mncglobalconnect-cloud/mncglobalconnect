"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function NetworkMapMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return (
    <div ref={ref} className="network-map relative mx-auto w-full max-w-[1040px]" data-animated={inView && visible}>
      {children}
    </div>
  );
}
