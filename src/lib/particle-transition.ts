/** Bounded catch-up remains reversible even when an offscreen story settles at once. */
export function advanceExpansion(current: number, target: number, seconds: number) {
  const goal = Math.max(0, Math.min(1, target));
  const delta = Math.max(0, Math.min(0.05, seconds));
  const distance = goal - current;
  const movement = Math.min(Math.abs(distance) * (1 - Math.exp(-delta / 0.32)), delta * 0.85);
  return Math.max(0, Math.min(1, current + Math.sign(distance) * movement));
}

export interface ParticleChoreography { separation: number; release: number; links: number; shrink: number; }
const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
/** One reversible timeline: the surface loosens before its samples disperse.
 * Write into a reused object so the frame loop does not allocate state.
 */
export function resolveParticleChoreography(progress: number, target: ParticleChoreography) {
  target.separation = smoothstep(0.02, 0.3, progress) * (1 - smoothstep(0.55, 1, progress));
  target.release = smoothstep(0.18, 0.98, progress);
  target.shrink = smoothstep(0.03, 0.95, target.release);
  target.links = 1 - smoothstep(0.06, 0.36, progress);
}
