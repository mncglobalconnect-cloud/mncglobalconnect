"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function GlobeFallback() {
  return (
    <div
      role="img"
      aria-label="Illustration of global business connections"
      className="globe-fallback absolute inset-0 rounded-full"
    >
      <div className="absolute inset-[10%] rounded-full border border-[#20b7d5]/20" />
      <div className="absolute inset-[22%] rounded-full border border-[#20b7d5]/15" />
      <span className="absolute left-[24%] top-[31%] size-2 rounded-full bg-[#35be84] shadow-[0_0_18px_#35be84]" />
      <span className="absolute left-[65%] top-[55%] size-2 rounded-full bg-[#20b7d5] shadow-[0_0_18px_#20b7d5]" />
    </div>
  );
}

const InteractiveGlobe = dynamic(
  () => import("@/components/globe/interactive-globe"),
  {
    ssr: false,
    loading: () => <GlobeFallback />,
  },
);

const floatingSignals = [
  { metric: "195+", label: "Countries", className: "-left-2 top-[12%] sm:-left-5" },
  { metric: "50,000+", label: "Business network", className: "-right-2 top-[33%] sm:-right-4" },
  { metric: "500+", label: "Opportunities", className: "bottom-[24%] -right-2 sm:-right-3" },
  { metric: "", label: "Global partnerships", className: "bottom-[10%] left-[4%] sm:left-0" },
];

export function GlobeLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const updatePreferences = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    updatePreferences();
    motionQuery.addEventListener("change", updatePreferences);
    mobileQuery.addEventListener("change", updatePreferences);

    const element = containerRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      return () => {
        motionQuery.removeEventListener("change", updatePreferences);
        mobileQuery.removeEventListener("change", updatePreferences);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updatePreferences);
      mobileQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-[560px]"
    >
      <div className="globe-ambient pointer-events-none absolute inset-[8%] rounded-full" />
      <div className="absolute inset-[5%] overflow-hidden rounded-full">
        <InteractiveGlobe reducedMotion={reducedMotion} visible={visible} mobile={mobile} />
      </div>
      {floatingSignals.map((signal) => (
        <div
          key={signal.label}
          className={`globe-signal glass-card absolute z-10 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-medium text-white/90 sm:px-3.5 sm:text-[11px] ${signal.className}`}
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#35be84] opacity-40" />
            <span className="relative inline-flex size-2 rounded-full bg-[#35be84]" />
          </span>
          <span>
            {signal.metric && (
              <span className="block text-xs font-semibold text-white sm:text-sm">
                {signal.metric}
              </span>
            )}
            <span className="block text-white/65">{signal.label}</span>
          </span>
        </div>
      ))}
      <div className="absolute bottom-1 right-1 flex items-center gap-2 rounded-full border border-white/10 bg-[#082b59]/75 px-3 py-2 text-[9px] font-medium tracking-[0.1em] text-white/55 backdrop-blur">
        <span className="size-1.5 animate-pulse rounded-full bg-[#35be84]" />
        GLOBAL CONNECTIONS
      </div>
    </div>
  );
}
