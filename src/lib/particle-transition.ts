/** Brief, bounded smoothing follows scroll input without letting large jumps teleport the model. */
export function advanceExpansion(current: number, target: number, seconds: number) {
  const goal = Math.max(0, Math.min(1, target));
  const delta = Math.max(0, Math.min(0.05, seconds));
  const distance = goal - current;
  const movement = Math.min(Math.abs(distance) * (1 - Math.exp(-delta / 0.07)), delta * 4);
  return Math.max(0, Math.min(1, current + Math.sign(distance) * movement));
}

export interface ParticleChoreography { scale: number; links: number; shrink: number; }
const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
/** A single proportional projection keeps the surface, trail and rings together.
 * Smaller samples and retained links reveal an intact atmospheric landscape.
 */
export function resolveParticleChoreography(progress: number, target: ParticleChoreography) {
  const expansion = smoothstep(progress);
  target.scale = 1 + expansion * 1.65;
  target.shrink = expansion;
  target.links = 1 - expansion * 0.18;
}

export interface RingChoreography { opacity: number; }
/** Ring geometry always stays intact and shares the landscape's projection scale. */
export function resolveRingChoreography(progress: number, target: RingChoreography) {
  target.opacity = 1 + smoothstep(progress) * 0.12;
}
