/** A layered sampling lattice: waves in the surface suggest correlated observations. */
export function formationPoint(id: number): readonly [number, number, number] {
  const column = id % 24, row = Math.floor(id / 24) % 13, layer = Math.floor(id / 312);
  const x = (column / 23 - 0.5) * 2.8;
  const y = (row / 12 - 0.5) * 1.6;
  const z = (layer / 3 - 0.5) * 0.9;
  return [x, y + Math.sin(x * 2 + z * 2) * 0.22, z + Math.cos(y * 3 + x) * 0.16];
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
    // Sparse local links reveal the sampling lattice without drawing a solid mesh.
    if (id % (stride * 8) === 0 && id % 24 + stride < 24) {
      lines.push(...particleVertex(id), ...particleVertex(id + stride));
    }
  }
  return { points: new Float32Array(points), lines: new Float32Array(lines) };
}

/** Same rest projection as the shader, for the no-script/static vector fallback. */
export function projectFormationPoint([x, y, z]: readonly number[]) {
  const yaw = 0.48, pitch = -0.7, roll = -0.38;
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
  const perspective = 4.5 / (4.5 + depth);
  return [(xx * Math.cos(roll) - yy * Math.sin(roll)) * perspective,
    (xx * Math.sin(roll) + yy * Math.cos(roll)) * perspective, depth];
}
