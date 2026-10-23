"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BackSide,
  CanvasTexture,
  Group,
  Mesh,
  QuadraticBezierCurve3,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from "three";
import { feature } from "topojson-client";
import type {
  GeometryCollection,
  GeometryObject,
  Topology,
} from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";
import { useEffect, useMemo, useRef } from "react";

type Coordinate = readonly [longitude: number, latitude: number];
type Route = {
  from: Coordinate;
  to: Coordinate;
  color: string;
  phase: number;
};

const routes: Route[] = [
  { from: [78, 22], to: [55, 25], color: "#35be84", phase: 0 },
  { from: [78, 22], to: [104, 1], color: "#20b7d5", phase: 0.12 },
  { from: [78, 22], to: [-2, 54], color: "#148ce0", phase: 0.24 },
  { from: [78, 22], to: [10, 51], color: "#35be84", phase: 0.36 },
  { from: [78, 22], to: [-74, 41], color: "#20b7d5", phase: 0.48 },
  { from: [78, 22], to: [102, 4], color: "#148ce0", phase: 0.6 },
  { from: [78, 22], to: [134, -25], color: "#35be84", phase: 0.72 },
  { from: [78, 22], to: [46, 24], color: "#20b7d5", phase: 0.84 },
];

type WorldTopology = Topology<{
  countries: GeometryCollection;
  land: GeometryObject;
}>;

function coordinateToVector([longitude, latitude]: Coordinate, radius: number) {
  const phi = ((90 - latitude) * Math.PI) / 180;
  const theta = ((longitude + 180) * Math.PI) / 180;
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function drawGeometry(
  context: CanvasRenderingContext2D,
  geometry: GeoJSON.Geometry,
  width: number,
  height: number,
) {
  const drawRing = (coordinates: number[][]) => {
    coordinates.forEach(([longitude, latitude], index) => {
      const x = ((longitude + 180) / 360) * width;
      const y = ((90 - latitude) / 180) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
  };

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(drawRing);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => polygon.forEach(drawRing));
  }
}

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the globe texture canvas.");
  }

  const ocean = context.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#0b3b70");
  ocean.addColorStop(0.48, "#082b59");
  ocean.addColorStop(1, "#061f40");
  context.fillStyle = ocean;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(97, 196, 229, 0.12)";
  context.lineWidth = 1.3;
  for (let longitude = 0; longitude <= 360; longitude += 15) {
    const x = (longitude / 360) * canvas.width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let latitude = 0; latitude <= 180; latitude += 15) {
    const y = (latitude / 180) * canvas.height;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  const topology = worldAtlas as unknown as WorldTopology;
  const countries = feature(topology, topology.objects.countries);
  context.beginPath();
  countries.features.forEach((country) => {
    if (country.geometry) {
      drawGeometry(context, country.geometry, canvas.width, canvas.height);
    }
  });

  const continents = context.createLinearGradient(0, 140, 0, canvas.height - 100);
  continents.addColorStop(0, "#39adbd");
  continents.addColorStop(0.54, "#1b8d9f");
  continents.addColorStop(1, "#147083");
  context.fillStyle = continents;
  context.shadowColor = "rgba(32, 183, 213, 0.42)";
  context.shadowBlur = 16;
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = "rgba(164, 244, 234, 0.48)";
  context.lineWidth = 1.15;
  context.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function RouteArc({
  route,
  index,
  reducedMotion,
}: {
  route: Route;
  index: number;
  reducedMotion: boolean;
}) {
  const curve = useMemo(() => {
    const start = coordinateToVector(route.from, 1.013);
    const end = coordinateToVector(route.to, 1.013);
    const control = start.clone().add(end).multiplyScalar(0.5);
    control.normalize().multiplyScalar(1.13 + (index % 3) * 0.035);
    return new QuadraticBezierCurve3(start, control, end);
  }, [index, route]);
  const geometry = useMemo(
    () => new TubeGeometry(curve, 56, 0.0024, 5, false),
    [curve],
  );
  const routeRef = useRef<Mesh>(null);
  const particleRef = useRef<Mesh>(null);
  const elapsedRef = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (reducedMotion) {
      if (particleRef.current) particleRef.current.visible = false;
      return;
    }

    elapsedRef.current += delta;
    const active = (elapsedRef.current / 24 + route.phase) % 1 < 0.64;
    if (routeRef.current) routeRef.current.visible = active;

    const progress = (elapsedRef.current * 0.075 + route.phase) % 1;
    const particleActive = active && progress < 0.2;
    if (particleRef.current) {
      particleRef.current.visible = particleActive;
      if (particleActive) {
        particleRef.current.position.copy(curve.getPoint(progress / 0.2));
      }
    }
  });

  return (
    <group>
      <mesh ref={routeRef} geometry={geometry}>
        <meshBasicMaterial color={route.color} transparent opacity={0.66} />
      </mesh>
      <mesh ref={particleRef} visible={false}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color={route.color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HubNode({
  coordinate,
  primary = false,
}: {
  coordinate: Coordinate;
  primary?: boolean;
}) {
  const pulseRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const elapsedRef = useRef(0);
  const position = useMemo(() => coordinateToVector(coordinate, 1.025), [coordinate]);

  useFrame((_, delta) => {
    if (!pulseRef.current || !haloRef.current) return;
    elapsedRef.current += delta;
    const pulse =
      1 + Math.sin(elapsedRef.current * (primary ? 2.4 : 1.7)) * 0.16;
    pulseRef.current.scale.setScalar(pulse);
    haloRef.current.scale.setScalar(pulse * (primary ? 2.3 : 1.8));
  });

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[primary ? 0.035 : 0.023, 12, 12]} />
        <meshBasicMaterial
          color={primary ? "#35be84" : "#20b7d5"}
          transparent
          opacity={0.2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[primary ? 0.017 : 0.011, 12, 12]} />
        <meshBasicMaterial
          color={primary ? "#8affc7" : "#86f3ef"}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[primary ? 0.008 : 0.006, 8, 8]} />
        <meshBasicMaterial color={primary ? "#35be84" : "#20b7d5"} />
      </mesh>
    </group>
  );
}

const hubs: { label: string; coordinate: Coordinate; primary?: boolean }[] = [
  { label: "India", coordinate: [78, 22], primary: true },
  { label: "Dubai", coordinate: [55, 25] },
  { label: "Singapore", coordinate: [104, 1] },
  { label: "London", coordinate: [-2, 54] },
  { label: "Germany", coordinate: [10, 51] },
  { label: "New York", coordinate: [-74, 41] },
  { label: "Malaysia", coordinate: [102, 4] },
  { label: "Australia", coordinate: [134, -25] },
];

function Earth({
  reducedMotion,
  mobile,
}: {
  reducedMotion: boolean;
  mobile: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const texture = useMemo(() => createEarthTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.018;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0.12, 0]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.72}
          metalness={0.16}
        />
      </mesh>
      <mesh scale={1.009}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#7ce7ec"
          wireframe
          transparent
          opacity={0.035}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.055}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#148ce0"
          side={BackSide}
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
      <group>
        {routes.slice(0, mobile ? 5 : routes.length).map((route, index) => (
          <RouteArc
            key={`${route.to[0]}-${route.to[1]}`}
            route={route}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
        {hubs.map((hub) => (
          <HubNode key={hub.label} {...hub} />
        ))}
      </group>
    </group>
  );
}

export default function InteractiveGlobe({
  reducedMotion,
  visible = true,
  mobile = false,
}: {
  reducedMotion: boolean;
  visible?: boolean;
  mobile?: boolean;
}) {
  return (
    <Canvas
      aria-label="Interactive three-dimensional globe showing international business connections"
      dpr={mobile ? 1 : 1.35}
      camera={{ position: [0, 0, 3.1], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={visible ? "always" : "never"}
      fallback={<div className="globe-fallback absolute inset-0 rounded-full" />}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 2, 4]} intensity={2.15} color="#d9fbff" />
      <pointLight position={[-3, -1, 2]} intensity={1.2} color="#148ce0" />
      <Earth reducedMotion={reducedMotion} mobile={mobile} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!mobile}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.35}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.22}
      />
    </Canvas>
  );
}
