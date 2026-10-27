import assert from "node:assert/strict";
import test from "node:test";
import { GLOBE_CAMERA, dampValue, idleRotationSpeed, pinchDistance, zoomDistance } from "../src/lib/globe-motion.ts";

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
  assert.equal(pinchDistance(3.25, 100, 200), 2.2);
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
