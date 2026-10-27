export const GLOBE_CAMERA = {
  minDistance: 2.2,
  maxDistance: 4.5,
  defaultDistance: 3.25,
  defaultTheta: 2.75,
  defaultPhi: 1.22,
  idleDelay: 2.5,
  autoSpeed: 0.025,
};

export function clampDistance(distance: number) {
  return Math.max(GLOBE_CAMERA.minDistance, Math.min(GLOBE_CAMERA.maxDistance, distance));
}

export function zoomDistance(distance: number, delta: number) {
  return clampDistance(distance * Math.exp(Math.max(-1, Math.min(1, delta * 0.0015))));
}

export function pinchDistance(distance: number, previousSpan: number, nextSpan: number) {
  return nextSpan > 0 && previousSpan > 0
    ? clampDistance(distance * previousSpan / nextSpan)
    : distance;
}

export function dampValue(current: number, target: number, delta: number, rate = 9) {
  return current + (target - current) * (1 - Math.exp(-rate * Math.min(delta, 0.05)));
}

export function idleRotationSpeed(
  current: number,
  secondsSinceInteraction: number,
  interacting: boolean,
  reducedMotion: boolean,
  delta: number,
) {
  if (interacting || reducedMotion || secondsSinceInteraction < GLOBE_CAMERA.idleDelay) return 0;
  return dampValue(current, GLOBE_CAMERA.autoSpeed, delta, 1.5);
}
