"use client";

import { ChevronLeft, ChevronRight, MapPin, Maximize2, X } from "lucide-react";
import { animate, motion, useMotionTemplate, useMotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { GLOBE_CANVAS_BLEED, heroToFullscreen } from "@/lib/globe-motion";
import { parseMemberLocations } from "@/lib/member-locations";
import type { MemberLocation } from "@/types/member-location";
import { EarthFallback } from "./earth-fallback";
import type { GlobeStage } from "./interactive-globe";

const InteractiveGlobe = dynamic(() => import("./interactive-globe"), {
  ssr: false,
  loading: () => <EarthFallback />,
});

const REFRESH_MS = 60_000;
const numberFormat = new Intl.NumberFormat("en");
const canvasInset = `${-(GLOBE_CANVAS_BLEED - 1) / 2 * 100}%`;
// Gentle start, long soft landing: reads as the globe being lifted out and settled.
const ease = [0.83, 0, 0.17, 1] as const;
const TRANSITION_SECONDS = 0.95;

type Box = { top: number; left: number; width: number; height: number };

/** Radius that covers the whole viewport from a point, which may sit near (or below) a screen edge. */
function coverRadius(x: number, y: number) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return Math.max(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y)) + 2;
}

function measureBox(element: HTMLElement | null): Box | null {
  const rect = element?.getBoundingClientRect();
  return rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null;
}

class GlobeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Interactive Earth failed; displaying the static fallback.", error, info.componentStack);
  }
  render() { return this.state.failed ? <EarthFallback unavailable /> : this.props.children; }
}

function useMemberLocations() {
  const [locations, setLocations] = useState<MemberLocation[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let controller: AbortController | null = null;
    const load = async () => {
      controller?.abort();
      const current = controller = new AbortController();
      try {
        const response = await fetch("/api/member-locations", { signal: current.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setLocations(parseMemberLocations(await response.json()));
        setFailed(false);
      } catch (error) {
        if (current.signal.aborted) return;
        console.error("Member locations could not be loaded.", error);
        setFailed(true);
      }
    };
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      controller?.abort();
    };
  }, []);
  return { locations, failed };
}

export function GlobeLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  // The globe glides between its hero slot and a full-screen space view: hero → opening → open → closing → hero.
  const [stage, setStage] = useState<GlobeStage>("hero");
  const stageRef = useRef(stage);
  // Transition values, set imperatively so each hand-over between canvases lands in a single painted frame.
  const glideX = useMotionValue(0);
  const glideY = useMotionValue(0);
  const glideScale = useMotionValue(1);
  const revealRadius = useMotionValue(0);
  const revealX = useMotionValue(0);
  const revealY = useMotionValue(0);
  const clipPath = useMotionTemplate`circle(${revealRadius}px at ${revealX}px ${revealY}px)`;
  const transitionRef = useRef<{ stop: () => void }[]>([]);
  const { locations, failed } = useMemberLocations();
  const onInteraction = useCallback(() => {}, []);
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  const onReady = useCallback(() => setReady(true), []);
  const full = stage === "opening" || stage === "open";

  useEffect(() => { stageRef.current = stage; }, [stage]);

  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => { reducedMotionRef.current = reducedMotion; }, [reducedMotion]);

  /** Runs the glide and circular reveal together; resolves when the slowest finishes. */
  const runTransition = useCallback((target: { x: number; y: number; scale: number; radius: number }) => {
    transitionRef.current.forEach((control) => control.stop());
    const options = { duration: reducedMotionRef.current ? 0 : TRANSITION_SECONDS, ease };
    const controls = [
      animate(glideX, target.x, options),
      animate(glideY, target.y, options),
      animate(glideScale, target.scale, options),
      animate(revealRadius, target.radius, options),
    ];
    transitionRef.current = controls;
    return Promise.all(controls);
  }, [glideX, glideY, glideScale, revealRadius]);

  // Start / end positions are applied in a layout effect, so they reach the screen in the same frame as the
  // switch between the hero canvas and the full-screen stage (motion values otherwise apply a frame early).
  const pending = useRef<{ x: number; y: number; scale: number; radius: number } | null>(null);

  const expand = useCallback(() => {
    if (stageRef.current !== "hero") return;
    const box = measureBox(containerRef.current);
    if (!box) return;
    const flip = heroToFullscreen(box, { width: window.innerWidth, height: window.innerHeight });
    revealX.set(box.left + box.width / 2);
    revealY.set(box.top + box.height / 2);
    pending.current = { ...flip, radius: box.height * 0.48 };
    stageRef.current = "opening";
    setStage("opening");
  }, [revealX, revealY]);

  const collapse = useCallback(() => {
    if (stageRef.current !== "open" && stageRef.current !== "opening") return;
    const box = measureBox(containerRef.current);
    if (!box) return;
    const flip = heroToFullscreen(box, { width: window.innerWidth, height: window.innerHeight });
    revealX.set(box.left + box.width / 2);
    revealY.set(box.top + box.height / 2);
    stageRef.current = "closing";
    interactionRef.current?.blur();
    setSelectedId(null);
    setResetSignal((value) => value + 1);
    setStage("closing");
    void runTransition({ ...flip, radius: box.height * 0.48 }).then(() => {
      if (stageRef.current !== "closing") return;
      stageRef.current = "hero";
      setStage("hero");
    });
  }, [revealX, revealY, runTransition]);

  useLayoutEffect(() => {
    if (stage === "opening" && pending.current) {
      // Start the full-screen canvas exactly over the hero globe, inside a circle the size of the globe.
      const start = pending.current;
      pending.current = null;
      glideX.set(start.x);
      glideY.set(start.y);
      glideScale.set(start.scale);
      revealRadius.set(start.radius);
      void runTransition({ x: 0, y: 0, scale: 1, radius: coverRadius(revealX.get(), revealY.get()) }).then(() => {
        if (stageRef.current !== "opening") return;
        stageRef.current = "open";
        setStage("open");
      });
    } else if (stage === "hero") {
      glideX.set(0);
      glideY.set(0);
      glideScale.set(1);
    }
  }, [stage, glideX, glideY, glideScale, revealRadius, revealX, revealY, runTransition]);

  useEffect(() => () => transitionRef.current.forEach((control) => control.stop()), []);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) expand();
  }, [expand]);

  const selectedIndex = locations.findIndex((location) => location.id === selectedId);
  const selected = selectedIndex >= 0 ? locations[selectedIndex] : null;
  const totalMembers = locations.reduce((sum, location) => sum + location.members, 0);
  const step = (offset: number) => {
    if (!locations.length) return;
    select(locations[(selectedIndex + offset + locations.length) % locations.length].id);
  };
  const backToGlobe = () => {
    setSelectedId(null);
    setResetSignal((value) => value + 1);
    interactionRef.current?.focus();
  };

  useEffect(() => {
    if (stage === "hero") return;
    // The hero is its own stacking context; raise it above the sticky header while the globe is lifted out.
    const hero = containerRef.current?.closest("section");
    const previousZ = hero?.style.zIndex ?? "";
    if (hero) hero.style.zIndex = "90";
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") collapse(); };
    const resize = () => { if (stageRef.current === "open") revealRadius.set(coverRadius(revealX.get(), revealY.get())); };
    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    return () => {
      if (hero) hero.style.zIndex = previousZ;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resize);
    };
  }, [stage, collapse, revealRadius, revealX, revealY]);

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
          <motion.div
            role={full ? "dialog" : undefined}
            aria-modal={full || undefined}
            aria-label={full ? "Explore member locations" : undefined}
            style={{ clipPath: stage === "hero" ? "none" : clipPath }}
            className={stage === "hero" ? "absolute inset-0" : "fixed inset-0 z-[80] overflow-hidden"}
          >
            <motion.div
              aria-hidden="true"
              className="globe-space pointer-events-none absolute inset-0"
              initial={false}
              animate={{ opacity: full ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : full ? 0.6 : TRANSITION_SECONDS * 0.8, ease }}
            />
            {!ready && <EarthFallback />}
            <motion.div
              className={`globe-stage-canvas pointer-events-none absolute will-change-transform ${stage === "hero" ? "globe-canvas" : "inset-0"}`}
              style={{ x: glideX, y: glideY, scale: glideScale, ...(stage === "hero" ? { inset: canvasInset } : {}) }}
            >
              <InteractiveGlobe reducedMotion={reducedMotion} visible={visible} mobile={mobile} stage={stage}
                locations={locations} selectedId={selectedId} resetSignal={resetSignal}
                interactionRef={interactionRef} onInteraction={onInteraction} onSelect={select}
                onRequestExpand={expand} onRequestCollapse={collapse}
                onUnavailable={onUnavailable} onReady={onReady} />
            </motion.div>
            <div ref={interactionRef} role="group" tabIndex={0}
              aria-label="Interactive Earth showing member locations. Click a marker or anywhere on Earth to fly there in full screen. Drag to rotate, scroll or pinch to zoom; zoom out to return. Keyboard: Enter or N next location, P previous, arrow keys rotate, plus and minus zoom, Escape exits."
              className={`globe-interaction absolute outline-none focus-visible:ring-2 focus-visible:ring-[#8abacb]/70 ${stage === "hero" ? "inset-[7%] rounded-full" : "inset-0"}`} />
            {locations.length > 0 && (stage === "hero" || full) && (
              <p key={full ? "full" : "hero"} className={`${full ? "globe-ui-in " : ""}pointer-events-none absolute z-30 flex items-center gap-2 rounded-full border border-white/15 bg-[#06213f]/80 px-3 py-1.5 font-medium text-white/80 backdrop-blur ${full ? "left-5 top-5 text-[12.5px] sm:left-8 sm:top-7" : "left-1 top-2 text-[11px]"}`}>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#35be84] opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#35be84]" />
                </span>
                {numberFormat.format(totalMembers)} members · {locations.length} cities
              </p>
            )}
            {failed && !locations.length && (
              <p role="status" className="pointer-events-none absolute left-1 top-2 text-[11px] text-white/55">
                Member locations are unavailable right now.
              </p>
            )}
            {full ? (
              <button type="button" onClick={collapse} aria-label="Exit full-screen globe"
                className="globe-ui-in absolute right-5 top-5 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-[#06213f]/80 py-2 pl-3 pr-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:bg-[#0b3a75] sm:right-8 sm:top-7">
                <X aria-hidden="true" className="size-4" /> Close
              </button>
            ) : stage === "hero" ? (
              <button type="button" onClick={expand} aria-label="Explore the globe in full screen"
                className="absolute right-1 top-1 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-[#06213f]/60 text-white/80 backdrop-blur transition hover:bg-[#0b3a75] hover:text-white">
                <Maximize2 aria-hidden="true" className="size-4" />
              </button>
            ) : null}
            {selected && full && (
              <div aria-live="polite"
                className="globe-ui-in absolute bottom-8 left-1/2 z-30 flex w-[min(92%,400px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-[#06213f]/85 p-3 text-white shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md sm:bottom-10">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ffcf6e]/15 text-[#ffcf6e]">
                  <MapPin aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">
                    {selected.city}
                    {selected.hub && <span className="ml-2 rounded-full bg-[#35be84]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#7ef2c3]">Hub</span>}
                  </p>
                  <p className="truncate text-[12px] text-white/65">
                    {selected.country} · {numberFormat.format(selected.members)} members
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => step(-1)} aria-label="Previous location"
                    className="flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white">
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next location"
                    className="flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white">
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                  <button type="button" onClick={backToGlobe} aria-label="Back to full globe"
                    className="flex size-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white">
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
            )}
            {!selected && stage === "open" && (
              <p aria-hidden="true" className="globe-ui-in pointer-events-none absolute inset-x-0 bottom-8 text-center text-[12.5px] tracking-wide text-white/55">
                {mobile ? "Tap a location to fly there · Pinch out to return" : "Click a location to fly there · Scroll out or press Esc to return"}
              </p>
            )}
          </motion.div>
        )}
      </GlobeBoundary>
    </div>
  );
}
