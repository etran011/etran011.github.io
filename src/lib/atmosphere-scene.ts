import { formationView } from "./atmosphere-view.mjs";
import type { AtmospherePose } from "./atmosphere-renderer";

export type AtmosphereScene = "hero" | "about" | "projects" | "skills" | "quiet";
export interface AtmosphereContext { scene: AtmosphereScene; heroProgress: number; }
type ScenePose = Omit<AtmospherePose, "lightX" | "lightY" | "pointerStrength">;
export const poseKeys = ["yaw", "pitch", "roll", "scale", "centerX", "centerY", "detail"] as const;

/** One continuous camera, rather than jumping between per-section scene profiles.
 * Expansion is applied once in the renderer, to every mathematical layer together.
 */
export function resolveAtmospherePose(context: AtmosphereContext, target: ScenePose) {
  Object.assign(target, formationView, { detail: 1 });
  const progress = Math.max(0, Math.min(1, context.heroProgress));
  target.yaw += progress * .1;
  target.pitch -= progress * .08;
  // Keep the composition broad and centered behind the islands.
  target.centerX -= progress * .22;
}
