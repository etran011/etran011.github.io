import type { AtmospherePose } from "./atmosphere-renderer";

export type AtmosphereScene = "hero" | "about" | "projects" | "skills" | "quiet";
export interface AtmosphereContext { scene: AtmosphereScene; progress: number; heroProgress: number; scroll: number; aboutStep: number; skillGroup: string | null; }
type ScenePose = Omit<AtmospherePose, "lightX" | "lightY" | "pointerStrength" | "scroll">;
const profiles: Record<AtmosphereScene, ScenePose> = {
  hero: { yaw: 0.55, pitch: 0.42, roll: -0.035, scale: 0.5, centerX: 0.43, centerY: 0.02, detail: 1 },
  about: { yaw: 0.92, pitch: -0.55, roll: -0.2, scale: 0.56, centerX: 0.7, centerY: -0.08, detail: 0.8 },
  projects: { yaw: 1.4, pitch: -0.4, roll: -0.15, scale: 0.5, centerX: 0.76, centerY: -0.05, detail: 0.18 },
  skills: { yaw: 1.1, pitch: -0.8, roll: -0.55, scale: 0.62, centerX: 0.65, centerY: 0, detail: 1.1 },
  quiet: { yaw: 0.9, pitch: -0.6, roll: -0.3, scale: 0.52, centerX: 0.78, centerY: 0.02, detail: 0.65 },
};
export const poseKeys = ["yaw", "pitch", "roll", "scale", "centerX", "centerY", "detail"] as const;

/** Writes into a reused pose; scroll never allocates geometry or changes page position. */
export function resolveAtmospherePose(context: AtmosphereContext, target: ScenePose) {
  const profile = profiles[context.scene];
  for (const key of poseKeys) target[key] = profile[key];
  target.yaw += Math.max(0, Math.min(1, context.progress)) * 0.12;
  if (context.scene === "about") {
    const step = Math.max(0, Math.min(2, context.aboutStep));
    target.yaw += step * 0.14; target.roll -= step * 0.045;
  }
  if (context.scene === "skills" && context.skillGroup) {
    const group = ["languages", "libraries", "tools"].indexOf(context.skillGroup);
    if (group >= 0) { target.yaw += group * 0.09; target.detail = 1.3; }
  }
}
