export const GLOBE_CAMERA = {
  minDistance: 1.45,
  maxDistance: 4.5,
  defaultDistance: 3.25,
  focusDistance: 1.65,
  defaultTheta: 2.75,
  defaultPhi: 1.22,
  minPhi: 0.25,
  idleDelay: 2.5,
  autoSpeed: 0.025,
};

/** The canvas is this many times larger than the globe's slot so a zoomed Earth fades out instead of hitting a box edge. */
export const GLOBE_CANVAS_BLEED = 1.6;

/** Field of view that keeps the globe the same size within its slot as a 42° view without bleed. */
export const GLOBE_FOV = 2 * Math.atan(GLOBE_CANVAS_BLEED * Math.tan(21 * Math.PI / 180)) * 180 / Math.PI;

export function clampDistance(distance: number) {
  return Math.max(GLOBE_CAMERA.minDistance, Math.min(GLOBE_CAMERA.maxDistance, distance));
}

export function clampPhi(phi: number) {
  return Math.max(GLOBE_CAMERA.minPhi, Math.min(Math.PI - GLOBE_CAMERA.minPhi, phi));
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

/** The equivalent of `target` closest to `current`, so the camera takes the short way round. */
export function nearestAngle(current: number, target: number) {
  return current + Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

/** Camera spherical angles (three.js Spherical) that look straight down at a coordinate. */
export function coordinateToCamera(longitude: number, latitude: number) {
  return {
    theta: (longitude + 90) * Math.PI / 180,
    phi: clampPhi((90 - latitude) * Math.PI / 180),
  };
}

/** Drag and marker size shrink as the camera nears the surface (radius 1). */
export function surfaceScale(distance: number) {
  return Math.max(0.2, Math.min(1.3, (distance - 1) / (GLOBE_CAMERA.defaultDistance - 1)));
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

/** Vertical field of view of the full-screen explore view (widened in portrait so the globe fits the width). */
export function expandedFov(aspect: number) {
  const base = 40;
  return aspect >= 1 ? base : 2 * Math.atan(Math.tan(base * Math.PI / 360) / aspect) * 180 / Math.PI;
}

/** Field of view that draws the globe in an un-bled canvas the same size as GLOBE_FOV does in the bleed canvas. */
export const SLOT_FOV = 42;

/**
 * Translate and uniform scale that place the full-screen globe exactly over the hero globe, so the
 * transition can glide between them with transforms only. The globe's on-screen size is proportional
 * to canvas height / tan(fov / 2) in both views.
 */
export function heroToFullscreen(
  box: { top: number; left: number; width: number; height: number },
  viewport: { width: number; height: number },
) {
  const tanFull = Math.tan(expandedFov(viewport.width / viewport.height) * Math.PI / 360);
  const tanSlot = Math.tan(SLOT_FOV * Math.PI / 360);
  return {
    x: box.left + box.width / 2 - viewport.width / 2,
    y: box.top + box.height / 2 - viewport.height / 2,
    scale: (box.height * tanFull) / (viewport.height * tanSlot),
  };
}
