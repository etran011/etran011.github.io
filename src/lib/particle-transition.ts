/** Bounded catch-up remains reversible even when an offscreen story settles at once. */
export function advanceExpansion(current: number, target: number, seconds: number) {
  const goal = Math.max(0, Math.min(1, target));
  const delta = Math.max(0, Math.min(0.05, seconds));
  const distance = goal - current;
  const movement = Math.min(Math.abs(distance) * (1 - Math.exp(-delta / 0.32)), delta * 0.85);
  return Math.max(0, Math.min(1, current + Math.sign(distance) * movement));
}
