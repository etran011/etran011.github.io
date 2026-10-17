/** One active clock drives the sculpture; the renderer already pauses it while hidden. */
export const idleWave = { amplitude: 0.012, detail: 0.004 };
export function displayWave(x, z, seconds) {
  return Math.sin(x * 2.4 + z * 1.7 - seconds * 0.95) * idleWave.amplitude +
    Math.sin(x * 4.1 - z * 2.2 + seconds * 1.35) * idleWave.detail;
}
export const displayWaveGLSL = `
float displayWave(vec2 p, float time) {
  return sin(p.x * 2.4 + p.y * 1.7 - time * 0.95) * ${idleWave.amplitude.toFixed(3)} +
    sin(p.x * 4.1 - p.y * 2.2 + time * 1.35) * ${idleWave.detail.toFixed(3)};
}`;
/** Reused output avoids allocations; a bounded orbit preserves the hero silhouette. */
export function resolveIdleRotation(seconds, pose, target) {
  target.yaw = pose.yaw + Math.sin(seconds * 0.22) * 0.22 + Math.sin(seconds * 0.075) * 0.055;
  target.pitch = pose.pitch + Math.sin(seconds * 0.16) * 0.055;
  target.roll = pose.roll + Math.sin(seconds * 0.13) * 0.025;
}
