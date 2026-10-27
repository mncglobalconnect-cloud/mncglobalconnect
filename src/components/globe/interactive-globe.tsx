"use client";

import { Html, Line, Stars } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  AdditiveBlending, BackSide, CatmullRomCurve3, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Raycaster,
  Sphere, Spherical, SRGBColorSpace, TextureLoader, Vector2, Vector3, type Texture,
} from "three";
import {
  clampPhi, coordinateToCamera, dampValue, expandedFov, GLOBE_CAMERA, GLOBE_FOV, idleRotationSpeed, nearestAngle,
  pinchDistance, surfaceScale, zoomDistance,
} from "@/lib/globe-motion";
import { hubLocation } from "@/lib/member-locations";
import type { MemberLocation } from "@/types/member-location";
import { EarthFallback } from "./earth-fallback";

type Coordinate = readonly [number, number];
/** Where the globe is shown: in its hero slot, gliding out, full screen, or gliding back. */
export type GlobeStage = "hero" | "opening" | "open" | "closing";
type HoverRef = RefObject<string | null>;
type GlobeProps = {
  reducedMotion: boolean;
  visible: boolean;
  mobile: boolean;
  stage: GlobeStage;
  locations: MemberLocation[];
  selectedId: string | null;
  resetSignal: number;
  interactionRef: RefObject<HTMLDivElement | null>;
  onInteraction: () => void;
  onSelect: (id: string | null) => void;
  /** Asks the page to open the full-screen explore view (zooming in or clicking the globe). */
  onRequestExpand: () => void;
  /** Asks the page to return the globe to the hero (zooming back out in full screen). */
  onRequestCollapse: () => void;
  onUnavailable: () => void;
  onReady: () => void;
};
type CameraState = {
  theta: number; phi: number; distance: number;
  targetTheta: number; targetPhi: number; targetDistance: number;
  focused: boolean;
};

const MARKER_RADIUS = 1.009;
// Sun direction in camera space: lit from the upper right so a terminator with city lights shows on the left limb.
const SUN_VIEW_DIRECTION = new Vector3(0.82, 0.36, 0.45).normalize();
const earthSphere = new Sphere(new Vector3(), 1);
// Zooming in closer than this from the hero opens the full-screen view; zooming out past COLLAPSE returns.
const EXPAND_DISTANCE = 2.75;
const COLLAPSE_DISTANCE = 4.2;
// Matches the page's hero <-> full-screen glide, so camera and canvas move as one motion.
const STAGE_TRANSITION_SECONDS = 0.95;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function coordinateToVector([longitude, latitude]: Coordinate, radius: number) {
  const phi = (90 - latitude) * Math.PI / 180;
  const theta = (longitude + 180) * Math.PI / 180;
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function vectorToCoordinate(point: Vector3): Coordinate {
  const latitude = Math.asin(point.y / point.length()) * 180 / Math.PI;
  const longitude = ((Math.atan2(point.z, -point.x) * 180 / Math.PI + 360) % 360) - 180;
  return [longitude, latitude];
}

function focusCamera(state: CameraState, [longitude, latitude]: Coordinate) {
  const { theta, phi } = coordinateToCamera(longitude, latitude);
  state.targetTheta = nearestAngle(state.theta, theta);
  state.targetPhi = phi;
  state.targetDistance = Math.min(state.targetDistance, GLOBE_CAMERA.focusDistance);
  state.focused = true;
}

function resetCamera(state: CameraState) {
  state.targetTheta = nearestAngle(state.theta, GLOBE_CAMERA.defaultTheta);
  state.targetPhi = GLOBE_CAMERA.defaultPhi;
  state.targetDistance = GLOBE_CAMERA.defaultDistance;
  state.focused = false;
}

function GlobeControls({
  interactionRef, onInteraction, onSelect, onRequestExpand, onRequestCollapse, reducedMotion, visible, stage, locations,
  selectedId, resetSignal, hoverRef,
}: Pick<GlobeProps, "interactionRef" | "onInteraction" | "onSelect" | "onRequestExpand" | "onRequestCollapse"
  | "reducedMotion" | "visible" | "stage" | "locations" | "selectedId" | "resetSignal"> & { hoverRef: HoverRef }) {
  const { camera, gl, invalidate } = useThree();
  const motion = useRef({
    theta: GLOBE_CAMERA.defaultTheta,
    phi: GLOBE_CAMERA.defaultPhi,
    distance: GLOBE_CAMERA.defaultDistance,
    targetTheta: GLOBE_CAMERA.defaultTheta,
    targetPhi: GLOBE_CAMERA.defaultPhi,
    targetDistance: GLOBE_CAMERA.defaultDistance,
    focused: false,
    lastInteraction: -Infinity,
    autoSpeed: 0,
    pointerX: 0,
    pointerY: 0,
    parallaxX: 0,
    parallaxY: 0,
  });
  const pointers = useRef(new Map<number, Vector2>());
  const spherical = useMemo(() => new Spherical(), []);
  const tween = useRef<{ theta: number; phi: number; distance: number; start: number } | null>(null);
  const expanded = stage === "open" || stage === "opening";
  const transitioning = stage === "opening" || stage === "closing";
  const latest = useRef({ locations, selectedId, onSelect, onRequestExpand, onRequestCollapse, expanded, transitioning });
  useEffect(() => {
    latest.current = { locations, selectedId, onSelect, onRequestExpand, onRequestCollapse, expanded, transitioning };
  });

  useEffect(() => {
    const location = locations.find((item) => item.id === selectedId);
    if (!location) return;
    focusCamera(motion.current, [location.longitude, location.latitude]);
    invalidate();
  }, [locations, selectedId, invalidate]);

  useEffect(() => {
    // Zooming in only opens the explore view: it lands on the whole globe, not on the zoom that triggered it.
    // Flying to a clicked location keeps its focus (that effect above runs first and sets `focused`).
    if (stage !== "opening" || motion.current.focused) return;
    motion.current.targetDistance = GLOBE_CAMERA.defaultDistance;
    invalidate();
  }, [stage, invalidate]);

  useEffect(() => {
    if (!resetSignal) return;
    resetCamera(motion.current);
    invalidate();
  }, [resetSignal, invalidate]);

  useEffect(() => {
    if (!transitioning) return;
    const state = motion.current;
    tween.current = reducedMotion ? null : { theta: state.theta, phi: state.phi, distance: state.distance, start: performance.now() };
    invalidate();
  }, [transitioning, reducedMotion, invalidate]);

  useEffect(() => {
    const element = interactionRef.current;
    if (!element) return;
    const state = motion.current;
    const activePointers = pointers.current;
    const raycaster = new Raycaster();
    const projected = new Vector3();
    const hit = new Vector3();
    let span = 0;
    let press: { x: number; y: number; moved: boolean } | null = null;

    const interact = () => {
      state.lastInteraction = performance.now() / 1000;
      state.autoSpeed = 0;
      onInteraction();
      invalidate();
    };
    const getSpan = () => {
      const points = [...activePointers.values()];
      return points.length === 2 ? points[0].distanceTo(points[1]) : 0;
    };
    // Nearest visible marker within a finger- or cursor-sized radius of the pointer.
    const markerAt = (clientX: number, clientY: number, radius: number) => {
      const bounds = gl.domElement.getBoundingClientRect();
      let best: MemberLocation | null = null;
      let bestDistance = radius;
      for (const location of latest.current.locations) {
        const point = coordinateToVector([location.longitude, location.latitude], MARKER_RADIUS);
        if (point.dot(projected.copy(camera.position).sub(point)) <= 0) continue;
        projected.copy(point).project(camera);
        const distance = Math.hypot(
          bounds.left + (projected.x + 1) / 2 * bounds.width - clientX,
          bounds.top + (1 - projected.y) / 2 * bounds.height - clientY,
        );
        if (distance < bestDistance) {
          best = location;
          bestDistance = distance;
        }
      }
      return best;
    };
    const surfaceAt = (clientX: number, clientY: number) => {
      const bounds = gl.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new Vector2(
        (clientX - bounds.left) / bounds.width * 2 - 1,
        -((clientY - bounds.top) / bounds.height) * 2 + 1,
      ), camera);
      return raycaster.ray.intersectSphere(earthSphere, hit) ? vectorToCoordinate(hit) : null;
    };
    const select = (id: string | null) => {
      if (latest.current.selectedId !== id) latest.current.onSelect(id);
    };
    const expandIfZoomedIn = () => {
      if (!latest.current.expanded && state.targetDistance < EXPAND_DISTANCE) latest.current.onRequestExpand();
    };
    const collapseIfZoomedOut = () => {
      if (latest.current.expanded && state.targetDistance > COLLAPSE_DISTANCE) latest.current.onRequestCollapse();
    };

    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      element.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, new Vector2(event.clientX, event.clientY));
      press = activePointers.size === 1 ? { x: event.clientX, y: event.clientY, moved: false } : null;
      span = getSpan();
      element.dataset.dragging = "true";
      interact();
    };
    const move = (event: PointerEvent) => {
      const previous = activePointers.get(event.pointerId);
      if (!previous) {
        if (event.pointerType === "mouse") {
          const bounds = element.getBoundingClientRect();
          state.pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.018;
          state.pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.012;
          const hovered = markerAt(event.clientX, event.clientY, 14)?.id ?? null;
          hoverRef.current = hovered;
          element.dataset.hover = hovered ? "true" : "false";
          invalidate();
        }
        return;
      }
      if (press && !press.moved) {
        if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6) return;
        press.moved = true;
        state.focused = false;
        select(null);
      }
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      previous.set(event.clientX, event.clientY);
      if (activePointers.size === 1) {
        const scale = 3.5 / Math.max(240, element.clientWidth) * surfaceScale(state.distance);
        state.targetTheta -= dx * scale;
        state.targetPhi = clampPhi(state.targetPhi - dy * scale);
      } else if (activePointers.size === 2) {
        const nextSpan = getSpan();
        if (latest.current.transitioning) { span = nextSpan; return; }
        state.targetDistance = pinchDistance(state.targetDistance, span, nextSpan);
        span = nextSpan;
        expandIfZoomedIn();
        collapseIfZoomedOut();
      }
      interact();
    };
    const up = (event: PointerEvent) => {
      if (!activePointers.delete(event.pointerId)) return;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (event.type === "pointerup" && press && !press.moved && activePointers.size === 0) {
        const marker = markerAt(event.clientX, event.clientY, event.pointerType === "mouse" ? 14 : 24);
        if (marker) {
          select(marker.id);
        } else {
          const coordinate = surfaceAt(event.clientX, event.clientY);
          if (coordinate) {
            select(null);
            focusCamera(state, coordinate);
            if (!latest.current.expanded) latest.current.onRequestExpand();
          }
        }
      }
      press = null;
      span = getSpan();
      element.dataset.dragging = activePointers.size ? "true" : "false";
      interact();
    };
    const leave = () => {
      state.pointerX = 0;
      state.pointerY = 0;
      hoverRef.current = null;
      element.dataset.hover = "false";
      invalidate();
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      // Ignore the rest of a wheel gesture while the globe glides between views.
      if (latest.current.transitioning) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      state.targetDistance = zoomDistance(state.targetDistance, delta);
      if (delta < 0) expandIfZoomedIn();
      else collapseIfZoomedOut();
      interact();
    };
    const cycle = (step: number) => {
      const { locations: items, selectedId: current } = latest.current;
      if (!items.length) return;
      const index = items.findIndex((item) => item.id === current);
      select(items[(index + step + items.length) % items.length].id);
    };
    const keydown = (event: KeyboardEvent) => {
      const step = 0.12 * surfaceScale(state.distance);
      switch (event.key) {
        case "ArrowLeft": state.targetTheta -= step; state.focused = false; break;
        case "ArrowRight": state.targetTheta += step; state.focused = false; break;
        case "ArrowUp": state.targetPhi = clampPhi(state.targetPhi - step); state.focused = false; break;
        case "ArrowDown": state.targetPhi = clampPhi(state.targetPhi + step); state.focused = false; break;
        case "+": case "=": state.targetDistance = zoomDistance(state.targetDistance, -120); expandIfZoomedIn(); break;
        case "-": state.targetDistance = zoomDistance(state.targetDistance, 120); collapseIfZoomedOut(); break;
        case "Enter": case "n": cycle(1); break;
        case "p": cycle(-1); break;
        case "Home": case "Escape": select(null); resetCamera(state); break;
        default: return;
      }
      event.preventDefault();
      interact();
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("lostpointercapture", up);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("keydown", keydown);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("lostpointercapture", up);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("keydown", keydown);
      activePointers.clear();
      element.dataset.dragging = "false";
    };
  }, [interactionRef, invalidate, onInteraction, camera, gl, hoverRef]);

  useFrame((_, delta) => {
    if (!visible) return;
    const state = motion.current;
    state.autoSpeed = idleRotationSpeed(
      state.autoSpeed, performance.now() / 1000 - state.lastInteraction,
      pointers.current.size > 0 || state.focused, reducedMotion, delta,
    );
    state.targetTheta += state.autoSpeed * Math.min(delta, 0.05);
    // Longer flights ease a little slower so the zoom reads as travel rather than a jump.
    const flight = tween.current;
    if (flight) {
      // During a view change, follow the glide's timing instead of springing ahead of it.
      const t = Math.min(1, (performance.now() - flight.start) / 1000 / STAGE_TRANSITION_SECONDS);
      const e = easeInOutCubic(t);
      state.theta = flight.theta + (state.targetTheta - flight.theta) * e;
      state.phi = flight.phi + (state.targetPhi - flight.phi) * e;
      state.distance = flight.distance + (state.targetDistance - flight.distance) * e;
      if (t >= 1) tween.current = null;
    } else {
      const rate = state.focused ? 4.5 : 9;
      state.theta = dampValue(state.theta, state.targetTheta, delta, rate);
      state.phi = dampValue(state.phi, state.targetPhi, delta, rate);
      state.distance = dampValue(state.distance, state.targetDistance, delta, rate);
    }
    const parallax = reducedMotion || state.focused ? 0 : 1;
    state.parallaxX = dampValue(state.parallaxX, state.pointerX * parallax, delta, 3);
    state.parallaxY = dampValue(state.parallaxY, state.pointerY * parallax, delta, 3);
    spherical.set(state.distance, state.phi + state.parallaxY, state.theta + state.parallaxX);
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    const settling = Math.abs(state.distance - state.targetDistance)
      + Math.abs(state.theta - state.targetTheta) + Math.abs(state.phi - state.targetPhi)
      + Math.abs(state.parallaxX - state.pointerX * parallax)
      + Math.abs(state.parallaxY - state.pointerY * parallax);
    if (reducedMotion && settling > 0.00001) invalidate();
  });
  return null;
}

function RouteArc({ start, end, index, count, reducedMotion }: {
  start: Coordinate; end: Coordinate; index: number; count: number; reducedMotion: boolean;
}) {
  const particleRef = useRef<Mesh>(null);
  const progress = useRef(index / count);
  const { curve, points } = useMemo(() => {
    const from = coordinateToVector(start, 1);
    const to = coordinateToVector(end, 1);
    const height = Math.min(0.1, 0.012 + from.angleTo(to) * 0.045);
    const path = new CatmullRomCurve3(Array.from({ length: 49 }, (_, i) => {
      const t = i / 48;
      return from.clone().lerp(to, t).normalize().multiplyScalar(MARKER_RADIUS + Math.sin(Math.PI * t) * height);
    }));
    return { curve: path, points: path.getPoints(96) };
  }, [start, end]);
  useFrame(({ camera }, delta) => {
    if (reducedMotion || !particleRef.current) return;
    progress.current = (progress.current + Math.min(delta, 0.05) * 0.06) % 1;
    curve.getPoint(progress.current, particleRef.current.position);
    // Keep the travelling dot a similar on-screen size as the camera zooms in.
    particleRef.current.scale.setScalar(surfaceScale(camera.position.length()));
  });
  return (
    <group>
      {/* Screen-space line: a constant pixel width at every zoom level. */}
      <Line points={points} color="#8bd3e6" lineWidth={1.1} transparent opacity={0.55} depthWrite={false} />
      {!reducedMotion && (
        <mesh ref={particleRef} position={curve.getPoint(index / count)}>
          <sphereGeometry args={[0.005, 10, 10]} />
          <meshBasicMaterial color="#e2fbff" />
        </mesh>
      )}
    </group>
  );
}

function Marker({ location, maxMembers, selected, hoverRef, reducedMotion }: {
  location: MemberLocation; maxMembers: number; selected: boolean; hoverRef: HoverRef; reducedMotion: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const { position, quaternion } = useMemo(() => {
    const point = coordinateToVector([location.longitude, location.latitude], MARKER_RADIUS);
    return {
      position: point,
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), point.clone().normalize()),
    };
  }, [location.longitude, location.latitude]);
  const size = 0.75 + 0.65 * Math.sqrt(location.members / Math.max(1, maxMembers));
  const phase = useMemo(() => (location.latitude * 7.3 + location.longitude * 3.1) % 1, [location.latitude, location.longitude]);
  const color = selected ? "#ffcf6e" : location.hub ? "#7ef2c3" : "#5fd4f5";

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    const emphasis = selected ? 1.7 : hoverRef.current === location.id ? 1.35 : 1;
    groupRef.current.scale.setScalar(surfaceScale(camera.position.length()) * size * emphasis);
    if (ringRef.current) {
      const t = reducedMotion ? 0.35 : (clock.elapsedTime * 0.55 + phase + 1) % 1;
      ringRef.current.scale.setScalar(1 + t * 1.6);
      (ringRef.current.material as MeshBasicMaterial).opacity = (1 - t) * (selected ? 0.9 : 0.55);
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.012, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh position-z={0.0004}>
        <circleGeometry args={[0.0055, 20]} />
        <meshBasicMaterial color="#ffffff" depthWrite={false} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.013, 0.016, 40]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

const LABEL_OFFSET = 14;
const LABEL_HEIGHT = 20;
const LABEL_GAP = 4;

/**
 * City names for every visible marker. Labels are placed largest city first (selected
 * city always first) and skipped where they would overlap, so more appear as you zoom in.
 */
function MarkerLabels({ locations, selectedId }: { locations: MemberLocation[]; selectedId: string | null }) {
  const elements = useRef(new Map<string, HTMLDivElement>());
  const widths = useRef(new Map<string, number>());
  const anchors = useMemo(() => locations.map((location) => ({
    location,
    point: coordinateToVector([location.longitude, location.latitude], MARKER_RADIUS),
  })), [locations]);
  const toCamera = useMemo(() => new Vector3(), []);
  const projected = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size, gl }) => {
    const settling = Math.abs(size.width - gl.domElement.clientWidth) > 2 || Math.abs(size.height - gl.domElement.clientHeight) > 2;
    if (settling) {
      for (const element of elements.current.values()) element.style.opacity = "0";
      return;
    }
    const placed: { left: number; right: number; top: number; bottom: number }[] = [];
    const ordered = [...anchors].sort((a, b) => Number(b.location.id === selectedId) - Number(a.location.id === selectedId));
    for (const { location, point } of ordered) {
      const element = elements.current.get(location.id);
      if (!element) continue;
      // The selected label uses larger text, so its width is measured separately.
      const widthKey = `${location.id}:${location.id === selectedId}`;
      let width = widths.current.get(widthKey);
      if (!width) {
        width = element.offsetWidth;
        if (width) widths.current.set(widthKey, width);
      }
      // Hide labels on the far side and near the limb, where they would float off the surface.
      toCamera.copy(camera.position).sub(point).normalize();
      let show = toCamera.dot(point) / point.length() > 0.25;
      if (show) {
        projected.copy(point).project(camera);
        const x = (projected.x + 1) / 2 * size.width;
        const y = (1 - projected.y) / 2 * size.height - LABEL_OFFSET;
        const box = {
          left: x - (width ?? 0) / 2 - LABEL_GAP, right: x + (width ?? 0) / 2 + LABEL_GAP,
          top: y - LABEL_HEIGHT / 2 - LABEL_GAP, bottom: y + LABEL_HEIGHT / 2 + LABEL_GAP,
        };
        show = !placed.some((other) => box.left < other.right && box.right > other.left
          && box.top < other.bottom && box.bottom > other.top);
        if (show) placed.push(box);
      }
      element.style.opacity = show ? "1" : "0";
    }
  });

  return anchors.map(({ location, point }) => {
    const selected = location.id === selectedId;
    return (
      <Html key={location.id} position={point} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={(element) => {
            if (element) elements.current.set(location.id, element);
            else elements.current.delete(location.id);
          }}
          style={{ transform: `translateY(-${LABEL_OFFSET}px)`, opacity: 0 }}
          className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm transition-opacity duration-300 ${selected
            ? "border-[#ffcf6e]/60 bg-[#06213f]/90 text-[12px] text-[#ffe3a6]"
            : "border-white/15 bg-[#06213f]/70 text-[10px] text-white/90"}`}
        >
          {location.city}
        </div>
      </Html>
    );
  });
}

const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const earthFragmentShader = `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D roughnessMap;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(cameraPosition - vPosition);
    vec3 sun = normalize(sunDirection);
    float light = dot(normal, sun);
    float daylight = smoothstep(-0.12, 0.22, light);

    vec3 color = texture2D(dayMap, vUv).rgb * (max(light, 0.0) * 1.85 + 0.05);
    // Oceans are smooth in the roughness map, giving a soft sun glint on water only.
    float ocean = 1.0 - texture2D(roughnessMap, vUv).r;
    color += vec3(1.0, 0.92, 0.78) * pow(max(dot(normal, normalize(sun + view)), 0.0), 45.0) * ocean * 0.5 * daylight;
    color += texture2D(nightMap, vUv).rgb * vec3(1.0, 0.82, 0.55) * 1.6 * (1.0 - daylight);

    float rim = pow(1.0 - max(dot(normal, view), 0.0), 2.6);
    color = mix(color, vec3(0.32, 0.6, 1.0) * (0.3 + max(light, 0.0)), rim * 0.6 * smoothstep(-0.35, 0.4, light));
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 sunDirection;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    float rim = pow(1.0 - abs(dot(normal, normalize(cameraPosition - vPosition))), 4.0);
    float lit = 0.15 + 0.85 * smoothstep(-0.35, 0.5, dot(normal, normalize(sunDirection)));
    gl_FragColor = vec4(0.32, 0.6, 1.0, rim * 0.55 * lit);
  }
`;

/** Loads a sharper day map the first time the camera zooms in, so the initial download stays small. */
function useHighResolutionDay(mobile: boolean) {
  const { gl, invalidate } = useThree();
  const requested = useRef(false);
  const [texture, setTexture] = useState<Texture | null>(null);
  const request = (distance: number) => {
    if (requested.current || distance > 2.4) return;
    requested.current = true;
    const desktop8k = !mobile && gl.capabilities.maxTextureSize >= 8192;
    if (!mobile && !desktop8k) return;
    new TextureLoader().load(`/images/earth/${desktop8k ? "day-8k" : "day-4k"}.webp`, (loaded) => {
      loaded.colorSpace = SRGBColorSpace;
      loaded.anisotropy = gl.capabilities.getMaxAnisotropy();
      setTexture(loaded);
      invalidate();
    }, undefined, (error) => console.error("High-resolution Earth texture failed; keeping the standard map.", error));
  };
  return [texture, request] as const;
}

function Earth({ mobile, reducedMotion, onReady, locations, selectedId, hoverRef }: Pick<GlobeProps,
  "mobile" | "reducedMotion" | "onReady" | "locations" | "selectedId"> & { hoverRef: HoverRef }) {
  const { gl } = useThree();
  const [day, night, clouds, roughness] = useLoader(TextureLoader, [
    `/images/earth/${mobile ? "day-mobile" : "day-4k"}.webp`,
    `/images/earth/${mobile ? "night-mobile" : "night"}.webp`,
    "/images/earth/clouds.webp", "/images/earth/roughness.webp",
  ]);
  const [sharpDay, upgradeDay] = useHighResolutionDay(mobile);
  const sun = useMemo(() => ({ value: SUN_VIEW_DIRECTION.clone() }), []);
  const uniforms = useMemo(() => {
    for (const texture of [day, night]) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    }
    return { dayMap: { value: sharpDay ?? day }, nightMap: { value: night }, roughnessMap: { value: roughness }, sunDirection: sun };
  }, [day, sharpDay, night, roughness, sun, gl]);
  const cloudRef = useRef<Mesh>(null);
  const lightingRef = useRef<Group>(null);
  useEffect(() => onReady(), [onReady]);
  useFrame(({ camera }, delta) => {
    sun.value.copy(SUN_VIEW_DIRECTION).applyQuaternion(camera.quaternion);
    upgradeDay(camera.position.length());
    if (lightingRef.current) lightingRef.current.quaternion.copy(camera.quaternion);
    if (cloudRef.current && !reducedMotion) cloudRef.current.rotation.y += Math.min(delta, 0.05) * 0.004;
  });

  const maxMembers = locations.reduce((max, location) => Math.max(max, location.members), 0);
  const routes = useMemo(() => {
    const hub = hubLocation(locations);
    if (!hub) return [];
    const origin: Coordinate = [hub.longitude, hub.latitude];
    // Every member city links back to the hub, so all markers are connected.
    return locations.filter((location) => location.id !== hub.id)
      .map((location) => ({ id: location.id, start: origin, end: [location.longitude, location.latitude] as Coordinate }));
  }, [locations]);

  return (
    <>
      <group ref={lightingRef}>
        <directionalLight position={SUN_VIEW_DIRECTION.clone().multiplyScalar(5)} color="#fff8ee" intensity={2.4} />
      </group>
      <ambientLight intensity={0.08} />
      <mesh>
        <sphereGeometry args={[1, mobile ? 96 : 160, mobile ? 64 : 112]} />
        <shaderMaterial uniforms={uniforms} vertexShader={earthVertexShader} fragmentShader={earthFragmentShader} />
      </mesh>
      <mesh ref={cloudRef} scale={1.006}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshStandardMaterial color="#f4f8fb" alphaMap={clouds} transparent opacity={0.3}
          depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial transparent depthWrite={false} side={BackSide} blending={AdditiveBlending}
          uniforms={{ sunDirection: sun }}
          vertexShader={earthVertexShader} fragmentShader={atmosphereFragmentShader} />
      </mesh>
      <group>
        {routes.map((route, index) => (
          <RouteArc key={route.id} start={route.start} end={route.end} index={index} count={routes.length}
            reducedMotion={reducedMotion} />
        ))}
      </group>
      {locations.map((location) => (
        <Marker key={location.id} location={location} maxMembers={maxMembers} selected={location.id === selectedId}
          hoverRef={hoverRef} reducedMotion={reducedMotion} />
      ))}
      <MarkerLabels locations={locations} selectedId={selectedId} />
    </>
  );
}

/**
 * Projects for the canvas's on-screen box rather than its drawing buffer. After a hand-over between the hero
 * and full-screen canvases the buffer keeps its old size for a few frames; projecting for the new box (and
 * stretching the buffer to fill it) keeps those frames geometrically correct, only briefly softer.
 */
function CameraLens() {
  useFrame(({ camera, gl, invalidate }) => {
    const lens = camera as PerspectiveCamera;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;
    if (!width || !height) return;
    const fullScreen = Math.abs(width - window.innerWidth) < 2 && Math.abs(height - window.innerHeight) < 2;
    const fov = fullScreen ? expandedFov(width / height) : GLOBE_FOV;
    const aspect = width / height;
    if (Math.abs(lens.fov - fov) < 0.001 && Math.abs(lens.aspect - aspect) < 0.0001) return;
    lens.fov = fov;
    lens.aspect = aspect;
    lens.updateProjectionMatrix();
    invalidate();
  });
  return null;
}

function ContextMonitor({ onUnavailable }: Pick<GlobeProps, "onUnavailable">) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const contextLost = (event: Event) => {
      event.preventDefault();
      console.error("Earth WebGL context lost; displaying the static fallback.");
      onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => canvas.removeEventListener("webglcontextlost", contextLost);
  }, [gl, onUnavailable]);
  return null;
}

export default function InteractiveGlobe(props: GlobeProps) {
  const hoverRef = useRef<string | null>(null);
  return (
    <Canvas
      aria-label="Three-dimensional Earth showing MNC Global Connect member locations"
      className="pointer-events-none"
      dpr={[1, props.mobile ? 1.25 : 1.5]}
      // Measure layout size, not the transformed box: the page glides this canvas with scale transforms.
      resize={{ offsetSize: true, scroll: false, debounce: 0 }}
      camera={{ position: coordinateToVector([68, 20], GLOBE_CAMERA.defaultDistance).toArray(), fov: GLOBE_FOV, near: 0.05 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={!props.visible ? "never" : props.reducedMotion ? "demand" : "always"}
      fallback={<EarthFallback />}
    >
      <ContextMonitor onUnavailable={props.onUnavailable} />
      <CameraLens />
      <GlobeControls {...props} hoverRef={hoverRef} />
      {props.stage !== "hero" && (
        <Stars radius={60} depth={40} count={props.mobile ? 2500 : 6000} factor={3.2} saturation={0} fade
          speed={props.reducedMotion ? 0 : 0.6} />
      )}
      <Suspense fallback={null}>
        <Earth mobile={props.mobile} reducedMotion={props.reducedMotion} onReady={props.onReady}
          locations={props.locations} selectedId={props.selectedId} hoverRef={hoverRef} />
      </Suspense>
    </Canvas>
  );
}
