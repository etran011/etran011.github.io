import { landscapeDomain, surfacePoint, surfaceNormal, loss } from "./loss-landscape.mjs";
import { formationCamera, formationView } from "./atmosphere-view.mjs";

export const particleCount = 1248;
export const particleStride = 13;

const fraction = (value: number) => value - Math.floor(value);
export function surfaceCoordinates(id: number) {
  const { min, max } = landscapeDomain;
  return [min + (id % 48) / 47 * (max - min), min + Math.floor(id / 48) / 25 * (max - min)] as const;
}
export function formationPoint(id: number): readonly [number, number, number] {
  return surfacePoint(...surfaceCoordinates(id)) as [number, number, number];
}

export const atmosphereQuality = {
  high: { stride: 1, pixelRatio: 1.5 },
  medium: { stride: 2, pixelRatio: 1.25 },
  low: { stride: 3, pixelRatio: 1 },
} as const;
export type AtmosphereQuality = keyof typeof atmosphereQuality;
/** Stable identities keep every retained particle in place when quality decreases.
 * Interleaved vertex: formation.xyz, viewport destination.xyz, identity/depth/size, surface normal/relative loss.
 * The destination uses a low-discrepancy distribution, not frame-by-frame randomness.
 */
export function particleVertex(id: number) {
  const coordinates = surfaceCoordinates(id);
  return [...formationPoint(id), (fraction((id + 1) * 0.754877666) * 2 - 1) * 1.05,
    (fraction((id + 1) * 0.569840291) * 2 - 1) * 1.05,
    fraction((id + 1) * 0.438579), id / particleCount,
    fraction((id + 1) * 0.618033989), fraction((id + 1) * 0.414213562),
    ...surfaceNormal(...coordinates), Math.log1p(loss(...coordinates) / 16) / 4];
}
export interface ParticleConnection { from: number; to: number; }
export function createParticleGeometry(quality: AtmosphereQuality = "high") {
  const { stride } = atmosphereQuality[quality];
  const vertices = new Map<number, number[]>(), connections: ParticleConnection[] = [];
  const points: number[] = [], lines: number[] = [];
  for (let id = 0; id < particleCount; id += stride) {
    const vertex = particleVertex(id); vertices.set(id, vertex); points.push(...vertex);
    const column = id % 48, row = Math.floor(id / 48);
    if (row % 5 === 0 && column + stride < 48) connections.push({ from: id, to: id + stride });
    if (column % 12 === 0 && row < 25) connections.push({ from: id, to: id + 48 });
  }
  for (const { from, to } of connections) lines.push(...vertices.get(from)!, ...vertices.get(to)!);
  return { points: new Float32Array(points), lines: new Float32Array(lines), connections };
}

/** Same rest projection as the shader, for the no-script/static vector fallback. */
export function projectFormationPoint([x, y, z]: readonly number[]) {
  const { yaw, pitch, roll } = formationView;
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
  const perspective = formationCamera / (formationCamera + depth);
  return [(xx * Math.cos(roll) - yy * Math.sin(roll)) * perspective,
    (xx * Math.sin(roll) + yy * Math.cos(roll)) * perspective, depth];
}
