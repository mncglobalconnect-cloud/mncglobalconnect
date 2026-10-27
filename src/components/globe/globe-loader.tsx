"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { EarthFallback } from "./earth-fallback";

const InteractiveGlobe = dynamic(() => import("./interactive-globe"), {
  ssr: false,
  loading: () => <EarthFallback />,
});

class GlobeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Interactive Earth failed; displaying the static fallback.", error, info.componentStack);
  }
  render() { return this.state.failed ? <EarthFallback unavailable /> : this.props.children; }
}

export function GlobeLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const onInteraction = useCallback(() => setInteracted(true), []);
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updatePreferences = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    updatePreferences();
    motionQuery.addEventListener("change", updatePreferences);
    mobileQuery.addEventListener("change", updatePreferences);
    let inViewport = true;
    const updateVisibility = () => setVisible(inViewport && !document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      updateVisibility();
    }, { rootMargin: "40px" });
    if (containerRef.current) observer.observe(containerRef.current);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      motionQuery.removeEventListener("change", updatePreferences);
      mobileQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-earth relative mx-auto w-full">
      <GlobeBoundary>
        {unavailable ? <EarthFallback unavailable /> : (
          <>
            {!ready && <EarthFallback />}
            <div className="absolute inset-0">
              <InteractiveGlobe reducedMotion={reducedMotion} visible={visible} mobile={mobile}
                interactionRef={interactionRef} onInteraction={onInteraction} onUnavailable={onUnavailable} onReady={onReady} />
            </div>
            <div ref={interactionRef} role="group" tabIndex={0}
              aria-label="Interactive Earth. Drag to rotate, scroll or pinch to zoom. Keyboard: arrow keys rotate, plus and minus zoom, Home resets."
              className="globe-interaction absolute inset-[7%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#8abacb]/70" />
            <p aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] tracking-wide text-white/45 transition-opacity duration-500 ${interacted ? "opacity-0" : "opacity-100"}`}>
              {mobile ? "Drag to rotate · Pinch to zoom" : "Drag to explore · Scroll to zoom"}
            </p>
          </>
        )}
      </GlobeBoundary>
      <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer"
        className="absolute -bottom-3 inset-x-0 mx-auto w-fit text-[9px] text-white/40 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-white"
        title="Earth imagery by Solar System Scope, CC BY 4.0; resized and adapted">
        Earth imagery: Solar System Scope
      </a>
    </div>
  );
}
