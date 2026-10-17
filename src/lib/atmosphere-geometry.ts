import { createMathematicalDetails } from "./atmosphere-contours.mjs";
import { landscapeDomain, surfacePoint, surfaceNormal, loss, descentPath } from "./loss-landscape.mjs";
import { formationCamera, formationView } from "./atmosphere-view.mjs";

export const surfaceColumns = 72;
export const surfaceRows = 42;
export const surfaceCount = surfaceColumns * surfaceRows;
export const particleCount = surfaceCount + 576;
export const particleStride = 13;

const fraction = (value: number) => value - Math.floor(value);
export function surfaceCoordinates(id: number) {
  const { min, max } = landscapeDomain;
  if (id >= surfaceCount) return [min + (.08 + fraction((id + 1) * .754877666) * .84) * (max - min), min + (.08 + fraction((id + 1) * .569840291) * .84) * (max - min)] as const;
  return [min + (id % surfaceColumns) / (surfaceColumns - 1) * (max - min), min + Math.floor(id / surfaceColumns) / (surfaceRows - 1) * (max - min)] as const;
}
export function formationPoint(id: number): readonly [number, number, number] {
  const coordinates = surfaceCoordinates(id), position = surfacePoint(...coordinates);
  if (id >= surfaceCount) {
    const normal = surfaceNormal(...coordinates), tier = id < surfaceCount + 384 ? 1 : 2;
    const offset = tier === 1 ? .055 + fraction(id * .618033989) * .045 : .14 + fraction(id * .414213562) * .06;
    for (let axis = 0; axis < 3; axis++) position[axis] += normal[axis] * offset;
  }
  return position as [number, number, number];
}

export const atmosphereQuality = {
  high: { stride: 1, pixelRatio: 1.5 },
  medium: { stride: 3, pixelRatio: 1.25 },
  low: { stride: 6, pixelRatio: 1 },
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
    ...surfaceNormal(...coordinates), id >= surfaceCount ? (id < surfaceCount + 384 ? -1 : -2) : Math.log1p(loss(...coordinates) / 16) / 4];
}
export interface ParticleConnection { from: number; to: number; }
export function createParticleGeometry(quality: AtmosphereQuality = "high") {
  const { stride } = atmosphereQuality[quality];
  const vertices = new Map<number, number[]>(), connections: ParticleConnection[] = [];
  const points: number[] = [], lines: number[] = [];
  for (let id = 0; id < particleCount; id += stride) {
    const vertex = particleVertex(id); vertices.set(id, vertex); points.push(...vertex);
    if (id >= surfaceCount) continue;
    const column = id % surfaceColumns, row = Math.floor(id / surfaceColumns);
    if (row % 4 === 0 && column + stride < surfaceColumns) connections.push({ from: id, to: id + stride });
    if (column % 12 === 0 && row < surfaceRows - 1) connections.push({ from: id, to: id + surfaceColumns });
    if (row % 8 === 0 && column % 12 === 0 && row < surfaceRows - 1 && column + stride < surfaceColumns) connections.push({ from: id, to: id + surfaceColumns + stride });
  }
  for (const { from, to } of connections) lines.push(...vertices.get(from)!, ...vertices.get(to)!);
  const detail = createMathematicalDetails(quality);
  const append = (coordinate: number[], identity: number, kind: number) => {
    const vertex = particleVertex(identity % surfaceCount), position = surfacePoint(...coordinate), normal = surfaceNormal(...coordinate);
    position[1] += .008;
    vertex.splice(0, 3, ...position); vertex.splice(9, 4, ...normal, kind);
    lines.push(...vertex);
  };
  [...detail.contours, ...detail.vectors].forEach((edge, index) => {
    const kind = index < detail.contours.length ? 2 : 3;
    append(edge.from, index * 2, kind); append(edge.to, index * 2 + 1, kind);
  });
  return { points: new Float32Array(points), lines: new Float32Array(lines), connections };
}

/** One static trail buffer; the moving marker reuses its first vertex. */
export function createTrajectoryGeometry() {
  const trajectory = descentPath(), data: number[] = [];
  trajectory.path.forEach(({ x, z }, index) => {
    const position = surfacePoint(x, z); position[1] += 0.012;
    data.push(...position, 0, 0, 0, trajectory.progress[index], 0.5, 0.5, ...surfaceNormal(x, z), 0);
  });
  return { data: new Float32Array(data), trajectory };
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
