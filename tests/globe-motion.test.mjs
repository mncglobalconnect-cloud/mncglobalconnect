import assert from "node:assert/strict";
import test from "node:test";
import {
  GLOBE_CAMERA, coordinateToCamera, dampValue, idleRotationSpeed, nearestAngle, pinchDistance, zoomDistance,
} from "../src/lib/globe-motion.ts";

// Mirrors coordinateToVector in interactive-globe.tsx (three.js Spherical convention).
function surfacePoint(longitude, latitude) {
  const phi = (90 - latitude) * Math.PI / 180;
  const theta = (longitude + 180) * Math.PI / 180;
  return [-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
}

test("focusing a coordinate puts the camera directly above it", () => {
  for (const [longitude, latitude] of [[80.27, 13.08], [-74, 40.7], [151.2, -33.9], [0, 0], [-179, 10]]) {
    const { theta, phi } = coordinateToCamera(longitude, latitude);
    const camera = [Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)];
    const point = surfacePoint(longitude, latitude);
    const dot = camera.reduce((sum, value, i) => sum + value * point[i], 0);
    assert.ok(dot > 0.9999, `${longitude},${latitude} -> ${dot}`);
  }
});

test("focus rotation takes the shortest way round", () => {
  assert.ok(Math.abs(nearestAngle(0.1, 2 * Math.PI - 0.1) - -0.1) < 1e-9);
  assert.ok(Math.abs(nearestAngle(20, 1) - (1 + 6 * Math.PI)) < 1e-9);
});

test("wheel direction and bounds keep the camera outside the Earth", () => {
  assert.ok(zoomDistance(3.25, -100) < 3.25);
  assert.ok(zoomDistance(3.25, 100) > 3.25);
  let distance = 3.25;
  for (let i = 0; i < 100; i++) distance = zoomDistance(distance, -1000);
  assert.equal(distance, GLOBE_CAMERA.minDistance);
  for (let i = 0; i < 100; i++) distance = zoomDistance(distance, 1000);
  assert.equal(distance, GLOBE_CAMERA.maxDistance);
});

test("pinch spread zooms in, pinch close zooms out, and degenerate spans do not jump", () => {
  assert.equal(pinchDistance(3.25, 100, 200), 1.625);
  assert.equal(pinchDistance(3.25, 100, 400), GLOBE_CAMERA.minDistance);
  assert.equal(pinchDistance(3.25, 200, 100), 4.5);
  assert.equal(pinchDistance(3.25, 0, 100), 3.25);
  assert.equal(pinchDistance(3.25, 100, 0), 3.25);
});

test("camera damping converges smoothly without overshooting or jumping after tab suspension", () => {
  const first = dampValue(3.25, 2.2, 1 / 60);
  assert.ok(first > 2.2 && first < 3.25);
  let distance = 3.25;
  for (let i = 0; i < 120; i++) distance = dampValue(distance, 2.2, 1 / 60);
  assert.ok(Math.abs(distance - 2.2) < 0.0001);
  assert.ok(dampValue(3.25, 2.2, 60) > 2.2);
});

test("auto rotation waits 2.5 seconds, gradually resumes, and stops for reduced motion or interaction", () => {
  assert.equal(idleRotationSpeed(0.02, 2.49, false, false, 1 / 60), 0);
  const speed = idleRotationSpeed(0, 2.5, false, false, 1 / 60);
  assert.ok(speed > 0 && speed < GLOBE_CAMERA.autoSpeed / 10);
  assert.equal(idleRotationSpeed(speed, 10, true, false, 1 / 60), 0);
  assert.equal(idleRotationSpeed(speed, 10, false, true, 1 / 60), 0);
});

test("hero-to-fullscreen transform puts the globe over the hero slot at the same size", async () => {
  const { heroToFullscreen, expandedFov, SLOT_FOV } = await import("../src/lib/globe-motion.ts");
  const box = { top: 113, left: 691, width: 640, height: 640 };
  const viewport = { width: 1440, height: 900 };
  const { x, y, scale } = heroToFullscreen(box, viewport);
  assert.equal(x, 691 + 320 - 720);
  assert.equal(y, 113 + 320 - 450);
  // Globe radius ∝ canvas height / tan(fov/2): full-screen radius × scale must equal the hero radius.
  const radius = (height, fov) => height / Math.tan(fov * Math.PI / 360);
  assert.ok(Math.abs(radius(900, expandedFov(1440 / 900)) * scale - radius(640, SLOT_FOV)) < 1e-9);
  // Portrait screens widen the lens so the globe still fits the width.
  assert.ok(expandedFov(390 / 844) > expandedFov(1.6));
});
