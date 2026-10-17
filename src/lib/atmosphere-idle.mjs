import { landscapeDomain } from "./loss-landscape.mjs";

/** One active clock drives the sculpture; the renderer already pauses it while hidden. */
export const idleWave = { amplitude: 0.065, detail: 0.022 };
export function displayWave(x, z, seconds) {
  return Math.sin(x * 2.4 + z * 1.7 - seconds * (2 * Math.PI / 4.4)) * idleWave.amplitude +
    Math.sin(x * 4.1 - z * 2.2 + seconds * (2 * Math.PI / 6.8)) * idleWave.detail;
}
/** Shared primary rhythm; secondary spatial waves avoid uniform whole-model scaling. */
export function idleBreath(seconds) { return 0.5 + 0.5 * Math.sin(seconds * (2 * Math.PI / 4.4)); }
export const displayWaveGLSL = `
float idleBreath(float time) { return 0.5 + 0.5 * sin(time * 1.427997); }
float displayWave(vec2 p, float time) {
  return sin(p.x * 2.4 + p.y * 1.7 - time * 1.427997) * ${idleWave.amplitude.toFixed(3)} +
    sin(p.x * 4.1 - p.y * 2.2 + time * 0.923998) * ${idleWave.detail.toFixed(3)};
}`;
/** Reused output avoids allocations; a bounded orbit preserves the hero silhouette. */
export function resolveIdleRotation(seconds, pose, target) {
  target.yaw = pose.yaw + Math.sin(seconds * 0.22) * 0.22 + Math.sin(seconds * 0.075) * 0.055;
  target.pitch = pose.pitch + Math.sin(seconds * 0.16) * 0.055;
  target.roll = pose.roll + Math.sin(seconds * 0.13) * 0.025;
}

/** An emission lasts one secondary cycle; its origin is sampled once, never chased. */
export const energyCycle = 6.8;
export function energyWave(distance, age) {
  const front = distance - age * 0.62;
  const launch = Math.min(1, Math.max(0, age / 0.55));
  const fade = Math.min(1, Math.max(0, (energyCycle - age) / 0.8));
  return Math.exp(-front * front / 0.0441) * launch * launch * (3 - 2 * launch) * fade * fade * (3 - 2 * fade) / (1 + distance * 0.22);
}
export const energyWaveGLSL = `
float energyWave(float distance, float age) {
  float front = distance - age * 0.62;
  return exp(-front * front / 0.0441) * smoothstep(0.0, 0.55, age) *
    (1.0 - smoothstep(${(energyCycle - .8).toFixed(1)}, ${energyCycle.toFixed(1)}, age)) / (1.0 + distance * 0.22);
}
// The marker reuses the trail buffer, so evaluate its actual current normal.
vec3 markerNormal(vec2 p) {
  vec2 q = p / ${landscapeDomain.horizontalScale};
  float a = q.x * q.x + q.y - 11.0;
  float b = q.x + q.y * q.y - 7.0;
  vec2 gradient = vec2(4.0 * q.x * a + 2.0 * b, 2.0 * a + 4.0 * q.y * b);
  vec2 slope = gradient * (${landscapeDomain.heightScale} / ${landscapeDomain.horizontalScale}) / (${landscapeDomain.compression.toFixed(1)} + a * a + b * b);
  return normalize(vec3(-slope.x, 1.0, -slope.y));
}`;
