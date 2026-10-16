import type { AtmosphereQuality } from "./atmosphere-geometry";

export function chooseAtmosphereQuality(cores: number, saveData: boolean): AtmosphereQuality {
  return saveData || cores <= 4 ? "low" : cores >= 8 ? "high" : "medium";
}

/** One-way adaptation avoids oscillating density or reacting to isolated slow frames. */
export function createAtmosphereBudget(initial: AtmosphereQuality) {
  let quality = initial;
  let frameRate: 30 | 60 = 60;
  let warmup = 60, samples = 0, slow = 0;
  return {
    get quality() { return quality; },
    get frameRate() { return frameRate; },
    observe(milliseconds: number) {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > 250) return;
      if (warmup > 0) { warmup--; return; }
      samples++; if (milliseconds > 24) slow++;
      if (samples < 60) return;
      if (slow >= 24) {
        if (quality === "high") quality = "medium";
        else if (quality === "medium") quality = "low";
        else frameRate = 30;
      }
      samples = 0; slow = 0;
    },
  };
}
