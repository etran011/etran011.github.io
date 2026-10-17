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
