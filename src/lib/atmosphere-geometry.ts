/** Standard bivariate normal density: x and z are measured in standard deviations. */
export function gaussianDensity(x: number, z: number) {
  return Math.exp(-(x * x + z * z) / 2) / (2 * Math.PI);
}

export const formationContours = [6, 14, 23] as const;
const contourRadii = new Map<number, number>([[6, 1], [14, 2], [23, 3]]);

/** 48 azimuths × 26 radii. Nonlinear radial sampling concentrates observations
 * around the peak; three exact sigma radii provide meaningful density contours.
 */
export function formationPoint(id: number): readonly [number, number, number] {
  const angle = (id % 48) / 48 * Math.PI * 2;
  const ring = Math.floor(id / 48);
  const radius = contourRadii.get(ring) ?? 3.2 * Math.pow((ring + 0.25) / 25.25, 0.8);
  const x = radius * Math.cos(angle), z = radius * Math.sin(angle);
  // Display height is normalized by the PDF's peak; density itself remains exact.
  return [x * 0.48, gaussianDensity(x, z) * (2 * Math.PI) * 1.9 - 0.68, z * 0.48];
}

export const atmosphereQuality = {
  high: { stride: 1, pixelRatio: 1.5 },
  medium: { stride: 2, pixelRatio: 1.25 },
  low: { stride: 3, pixelRatio: 1 },
} as const;
export type AtmosphereQuality = keyof typeof atmosphereQuality;
const fraction = (value: number) => value - Math.floor(value);

/** Stable identities keep every retained particle in place when quality decreases.
 * Interleaved vertex: formation.xyz, viewport destination.xyz, identity/depth/size.
 * The destination uses a low-discrepancy distribution, not frame-by-frame randomness.
 */
export function particleVertex(id: number) {
  return [...formationPoint(id), (fraction((id + 1) * 0.754877666) * 2 - 1) * 1.05,
    (fraction((id + 1) * 0.569840291) * 2 - 1) * 1.05,
    fraction((id + 1) * 0.438579), id / 1248,
    fraction((id + 1) * 0.618033989), fraction((id + 1) * 0.414213562)];
}
export function createParticleGeometry(quality: AtmosphereQuality = "high") {
  const { stride } = atmosphereQuality[quality];
  const points: number[] = [], lines: number[] = [];
  for (let id = 0; id < 1248; id += stride) {
    points.push(...particleVertex(id));
    const ring = Math.floor(id / 48), angle = id % 48;
    if (formationContours.includes(ring as typeof formationContours[number])) {
      const neighbor = ring * 48 + (angle + stride) % 48;
      lines.push(...particleVertex(id), ...particleVertex(neighbor));
    }
    // Eight meridians expose the bell silhouette, including on lower quality tiers.
    if (angle % 6 === 0 && ring < 25) {
      lines.push(...particleVertex(id), ...particleVertex(id + 48));
    }
  }
  return { points: new Float32Array(points), lines: new Float32Array(lines) };
}

/** Same rest projection as the shader, for the no-script/static vector fallback. */
export function projectFormationPoint([x, y, z]: readonly number[]) {
  const yaw = 0.55, pitch = 0.42, roll = -0.035;
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
  const perspective = 4.5 / (4.5 + depth);
  return [(xx * Math.cos(roll) - yy * Math.sin(roll)) * perspective,
    (xx * Math.sin(roll) + yy * Math.cos(roll)) * perspective, depth];
}
