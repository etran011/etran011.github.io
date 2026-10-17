/** Shared direction for one-time reveals; content stays usable throughout. */
export const cinematicMotion = {
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  entrance: 640,
  quietEntrance: 520,
} as const;

/** Active animation time pauses with the renderer. No separate intro loop or clock. */
export function openingCameraWeight(seconds: number) {
  const progress = Math.max(0, Math.min(1, seconds / 1.6));
  return (1 - progress) ** 3;
}
