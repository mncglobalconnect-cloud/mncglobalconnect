"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending, BackSide, CatmullRomCurve3, Group, Mesh,
  Spherical, SRGBColorSpace, TextureLoader, Vector2, Vector3,
} from "three";
import {
  dampValue, GLOBE_CAMERA, idleRotationSpeed, pinchDistance, zoomDistance,
} from "@/lib/globe-motion";
import { EarthFallback } from "./earth-fallback";

type Coordinate = readonly [number, number];
type GlobeProps = {
  reducedMotion: boolean;
  visible: boolean;
  mobile: boolean;
  interactionRef: RefObject<HTMLDivElement | null>;
  onInteraction: () => void;
  onUnavailable: () => void;
  onReady: () => void;
};

const india: Coordinate = [78, 22];
const destinations: Coordinate[] = [[55, 25], [104, 1], [102, 4], [10, 51], [37, -1], [-74, 41]];

function coordinateToVector([longitude, latitude]: Coordinate, radius: number) {
  const phi = (90 - latitude) * Math.PI / 180;
  const theta = (longitude + 180) * Math.PI / 180;
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function GlobeControls({
  interactionRef, onInteraction, reducedMotion, visible,
}: Pick<GlobeProps, "interactionRef" | "onInteraction" | "reducedMotion" | "visible">) {
  const { camera, invalidate } = useThree();
  const motion = useRef({
    theta: GLOBE_CAMERA.defaultTheta,
    phi: GLOBE_CAMERA.defaultPhi,
    distance: GLOBE_CAMERA.defaultDistance,
    targetTheta: GLOBE_CAMERA.defaultTheta,
    targetPhi: GLOBE_CAMERA.defaultPhi,
    targetDistance: GLOBE_CAMERA.defaultDistance,
    lastInteraction: -Infinity,
    autoSpeed: 0,
    pointerX: 0,
    pointerY: 0,
    parallaxX: 0,
    parallaxY: 0,
  });
  const pointers = useRef(new Map<number, Vector2>());
  const spherical = useMemo(() => new Spherical(), []);

  useEffect(() => {
    const element = interactionRef.current;
    if (!element) return;
    const state = motion.current;
    const activePointers = pointers.current;
    let span = 0;
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
    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      element.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, new Vector2(event.clientX, event.clientY));
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
          invalidate();
        }
        return;
      }
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      previous.set(event.clientX, event.clientY);
      if (activePointers.size === 1) {
        const scale = 3.5 / Math.max(240, element.clientWidth);
        state.targetTheta -= dx * scale;
        state.targetPhi = Math.max(0.25, Math.min(Math.PI - 0.25, state.targetPhi - dy * scale));
      } else if (activePointers.size === 2) {
        const nextSpan = getSpan();
        state.targetDistance = pinchDistance(state.targetDistance, span, nextSpan);
        span = nextSpan;
      }
      interact();
    };
    const up = (event: PointerEvent) => {
      if (!activePointers.delete(event.pointerId)) return;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      span = getSpan();
      element.dataset.dragging = activePointers.size ? "true" : "false";
      interact();
    };
    const leave = () => {
      state.pointerX = 0;
      state.pointerY = 0;
      invalidate();
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      state.targetDistance = zoomDistance(state.targetDistance, delta);
      interact();
    };
    const reset = () => {
      state.targetTheta = state.theta + Math.atan2(
        Math.sin(GLOBE_CAMERA.defaultTheta - state.theta),
        Math.cos(GLOBE_CAMERA.defaultTheta - state.theta),
      );
      state.targetPhi = GLOBE_CAMERA.defaultPhi;
      state.targetDistance = GLOBE_CAMERA.defaultDistance;
    };
    const keydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft": state.targetTheta -= 0.12; break;
        case "ArrowRight": state.targetTheta += 0.12; break;
        case "ArrowUp": state.targetPhi = Math.max(0.25, state.targetPhi - 0.12); break;
        case "ArrowDown": state.targetPhi = Math.min(Math.PI - 0.25, state.targetPhi + 0.12); break;
        case "+": case "=": state.targetDistance = zoomDistance(state.targetDistance, -120); break;
        case "-": state.targetDistance = zoomDistance(state.targetDistance, 120); break;
        case "Home": reset(); break;
        default: return;
      }
      event.preventDefault();
      interact();
    };
    const doubleClick = () => {
      if (state.targetDistance < 2.8) reset();
      else state.targetDistance = 2.6;
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
    element.addEventListener("dblclick", doubleClick);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("lostpointercapture", up);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("keydown", keydown);
      element.removeEventListener("dblclick", doubleClick);
      activePointers.clear();
      element.dataset.dragging = "false";
    };
  }, [interactionRef, invalidate, onInteraction]);

  useFrame((_, delta) => {
    if (!visible) return;
    const state = motion.current;
    state.autoSpeed = idleRotationSpeed(
      state.autoSpeed, performance.now() / 1000 - state.lastInteraction,
      pointers.current.size > 0, reducedMotion, delta,
    );
    state.targetTheta += state.autoSpeed * Math.min(delta, 0.05);
    state.theta = dampValue(state.theta, state.targetTheta, delta);
    state.phi = dampValue(state.phi, state.targetPhi, delta);
    state.distance = dampValue(state.distance, state.targetDistance, delta);
    state.parallaxX = dampValue(state.parallaxX, reducedMotion ? 0 : state.pointerX, delta, 3);
    state.parallaxY = dampValue(state.parallaxY, reducedMotion ? 0 : state.pointerY, delta, 3);
    spherical.set(state.distance, state.phi + state.parallaxY, state.theta + state.parallaxX);
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    const settling = Math.abs(state.distance - state.targetDistance)
      + Math.abs(state.theta - state.targetTheta) + Math.abs(state.phi - state.targetPhi)
      + Math.abs(state.parallaxX - (reducedMotion ? 0 : state.pointerX))
      + Math.abs(state.parallaxY - (reducedMotion ? 0 : state.pointerY));
    if (reducedMotion && settling > 0.00001) invalidate();
  });
  return null;
}

function RouteArc({ destination, index, reducedMotion }: {
  destination: Coordinate; index: number; reducedMotion: boolean;
}) {
  const particleRef = useRef<Mesh>(null);
  const progress = useRef(index / destinations.length);
  const curve = useMemo(() => {
    const start = coordinateToVector(india, 1);
    const end = coordinateToVector(destination, 1);
    const points = Array.from({ length: 49 }, (_, i) => {
      const t = i / 48;
      return start.clone().lerp(end, t).normalize().multiplyScalar(1.012 + Math.sin(Math.PI * t) * 0.16);
    });
    return new CatmullRomCurve3(points);
  }, [destination]);
  useFrame((_, delta) => {
    if (reducedMotion || !particleRef.current) return;
    progress.current = (progress.current + Math.min(delta, 0.05) * 0.025) % 1;
    curve.getPoint(progress.current, particleRef.current.position);
  });
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.0016, 5, false]} />
        <meshBasicMaterial color="#8bbecb" transparent opacity={0.38} />
      </mesh>
      <mesh position={coordinateToVector(destination, 1.016)}>
        <sphereGeometry args={[0.006, 10, 10]} />
        <meshBasicMaterial color="#a6d9d4" />
      </mesh>
      {!reducedMotion && (
        <mesh ref={particleRef} position={curve.getPoint(index / destinations.length)}>
          <sphereGeometry args={[0.006, 10, 10]} />
          <meshBasicMaterial color="#c7e9e6" />
        </mesh>
      )}
    </group>
  );
}

function Earth({ mobile, reducedMotion, onReady }: Pick<GlobeProps, "mobile" | "reducedMotion" | "onReady">) {
  const [day, clouds, normal, roughness] = useLoader(TextureLoader, [
    `/images/earth/${mobile ? "day-mobile" : "day"}.webp`,
    "/images/earth/clouds.webp", "/images/earth/normal.webp", "/images/earth/roughness.webp",
  ]);
  const cloudRef = useRef<Mesh>(null);
  const lightingRef = useRef<Group>(null);
  useEffect(() => onReady(), [onReady]);
  useFrame(({ camera }, delta) => {
    if (lightingRef.current) lightingRef.current.quaternion.copy(camera.quaternion);
    if (cloudRef.current && !reducedMotion) cloudRef.current.rotation.y += Math.min(delta, 0.05) * 0.004;
  });
  return (
    <>
      <group ref={lightingRef}>
        <directionalLight position={[3, 4, 5]} color="#f0f5ff" intensity={2.5} />
        <directionalLight position={[-4, -1, 2]} color="#92abc5" intensity={0.35} />
      </group>
      <ambientLight intensity={0.32} />
      <mesh>
        <sphereGeometry args={[1, mobile ? 64 : 96, mobile ? 48 : 64]} />
        <meshStandardMaterial map={day} map-colorSpace={SRGBColorSpace} normalMap={normal} normalScale={new Vector2(0.45, 0.45)}
          roughnessMap={roughness} roughness={1} metalness={0.08} />
      </mesh>
      <mesh ref={cloudRef} scale={1.007}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color="#edf3f7" alphaMap={clouds} transparent opacity={0.24}
          depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial transparent depthWrite={false} side={BackSide} blending={AdditiveBlending}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
              vNormal = normalize(normalMatrix * normal);
              vView = -viewPosition.xyz;
              gl_Position = projectionMatrix * viewPosition;
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
              gl_FragColor = vec4(0.3, 0.56, 0.8, rim * 0.28);
            }
          `}
        />
      </mesh>
      {destinations.slice(0, mobile ? 4 : destinations.length).map((destination, index) => (
        <RouteArc key={destination.join(",")} destination={destination} index={index} reducedMotion={reducedMotion} />
      ))}
      <group position={coordinateToVector(india, 1.017)}>
        <mesh>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshBasicMaterial color="#a3d8ba" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#65b99f" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
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
  return (
    <Canvas
      aria-label="Three-dimensional Earth with international business connections"
      className="pointer-events-none"
      dpr={[1, props.mobile ? 1.25 : 2]}
      camera={{ position: coordinateToVector([68, 20], GLOBE_CAMERA.defaultDistance).toArray(), fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={!props.visible ? "never" : props.reducedMotion ? "demand" : "always"}
      fallback={<EarthFallback />}
    >
      <ContextMonitor onUnavailable={props.onUnavailable} />
      <GlobeControls {...props} />
      <Suspense fallback={null}>
        <Earth mobile={props.mobile} reducedMotion={props.reducedMotion} onReady={props.onReady} />
      </Suspense>
    </Canvas>
  );
}
