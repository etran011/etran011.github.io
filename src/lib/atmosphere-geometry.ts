/** Original Möbius ribbon: a continuous half-twist, sampled as woven signal lines. */
export function ribbonPoint(u: number, v: number): readonly [number, number, number] {
  const radius = 1.18 + v * 0.38 * Math.cos(u / 2);
  return [radius * Math.cos(u), v * 0.64 * Math.sin(u / 2), radius * Math.sin(u)];
}

export const atmosphereQuality = {
  high: { segments: 160, lanes: 18, pixelRatio: 1.5 },
  medium: { segments: 112, lanes: 12, pixelRatio: 1.25 },
  low: { segments: 80, lanes: 8, pixelRatio: 1 },
} as const;
export type AtmosphereQuality = keyof typeof atmosphereQuality;

export function createRibbonGeometry(quality: AtmosphereQuality = "high") {
  const { segments, lanes } = atmosphereQuality[quality];
  const lines: number[] = [];
  const points: number[] = [];
  for (let lane = 0; lane <= lanes; lane++) {
    const v = lane / lanes * 2 - 1;
    for (let segment = 0; segment < segments; segment++) {
      const u = segment / segments * Math.PI * 2;
      lines.push(...ribbonPoint(u, v), ...ribbonPoint((segment + 1) / segments * Math.PI * 2, v));
      // Details belong to the surface, rather than an unrelated random particle field.
      if (segment % 8 === 0 && lane % 3 === 0) points.push(...ribbonPoint(u, v));
    }
  }
  for (let segment = 0; segment < segments; segment += 4) {
    const u = segment / segments * Math.PI * 2;
    for (let lane = 0; lane < lanes; lane++) lines.push(...ribbonPoint(u, lane / lanes * 2 - 1), ...ribbonPoint(u, (lane + 1) / lanes * 2 - 1));
  }
  return { lines: new Float32Array(lines), points: new Float32Array(points) };
}

/** Matching rest pose for the static SVG; no WebGL or runtime script is needed. */
export function projectRibbonPoint([x, y, z]: readonly number[]) {
  const yaw = 0.48;
  const pitch = -0.7;
  const roll = -0.38;
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
  const perspective = 4.5 / (4.5 + depth);
  return [(xx * Math.cos(roll) - yy * Math.sin(roll)) * perspective, (xx * Math.sin(roll) + yy * Math.cos(roll)) * perspective, depth];
}
