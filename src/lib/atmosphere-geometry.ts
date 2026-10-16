import { formationCamera, formationView } from "./atmosphere-view.mjs";

export const particleCount = 1248;
export const particleStride = 13;

/** Synthetic mixture components. L is a Cholesky factor, so covariance = L·Lᵀ.
 * Positive diagonal entries give each component a full-rank, anisotropic spread.
 */
export const latentClusters = [
  { weight: 0.38, center: [-0.57, -0.44, 0.24], factor: [0.27, 0.09, 0.13, 0.02, 0.03, 0.12], angle: -0.35, bend: 0.2 },
  { weight: 0.28, center: [-0.1, 0.3, -0.3], factor: [0.13, -0.03, 0.24, 0.04, 0.03, 0.13], angle: 0.4, bend: 0.16 },
  { weight: 0.21, center: [0.63, 0.72, 0.18], factor: [0.23, -0.045, 0.13, 0.01, 0.04, 0.16], angle: 0.18, bend: -0.18 },
  { weight: 0.13, center: [0.66, -0.54, -0.28], factor: [0.14, 0.03, 0.14, 0.035, 0, 0.11], angle: -0.6, bend: 0.1 },
] as const;

const fraction = (value: number) => value - Math.floor(value);
export function particleCluster(id: number) {
  const value = fraction((id + 1) * 0.618033989);
  let cumulative = 0;
  for (let i = 0; i < latentClusters.length - 1; i++) {
    cumulative += latentClusters[i].weight;
    if (value < cumulative) return i;
  }
  return latentClusters.length - 1;
}
function uniform(seed: number, channel: number) {
  let value = Math.imul(seed + 1, 0x9e3779b1) ^ Math.imul(channel + 1, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296 + 0.5 / 4294967296;
}
/** Deterministic Box–Muller sampling, conditioned on Mahalanobis radius ≤ 2.8.
 * Finite tails keep the sculpture contained; this is a truncated synthetic mixture.
 */
export function latentSample(id: number) {
  for (let attempt = 0; ; attempt++) {
    const seed = id + attempt * particleCount;
    const radius = Math.sqrt(-2 * Math.log(uniform(seed, 0)));
    const angle = uniform(seed, 1) * Math.PI * 2;
    const x = radius * Math.cos(angle), y = radius * Math.sin(angle);
    const z = Math.sqrt(-2 * Math.log(uniform(seed, 2))) * Math.cos(uniform(seed, 3) * Math.PI * 2);
    if (x * x + y * y + z * z <= 2.8 * 2.8) return [x, y, z] as const;
  }
}
export function formationPoint(id: number): readonly [number, number, number] {
  const component = latentClusters[particleCluster(id)];
  const [a, b, c] = latentSample(id);
  const [l00, l10, l11, l20, l21, l22] = component.factor;
  const x = l00 * a, y = l10 * a + l11 * b, z = l20 * a + l21 * b + l22 * c;
  const cosine = Math.cos(component.angle), sine = Math.sin(component.angle);
  return [component.center[0] + x * cosine - y * sine,
    component.center[1] + x * sine + y * cosine + component.bend * (a * a - 1) * 0.08,
    component.center[2] + z + Math.sin(a * 0.9) * component.bend * 0.15];
}

export const atmosphereQuality = {
  high: { stride: 1, pixelRatio: 1.5 },
  medium: { stride: 2, pixelRatio: 1.25 },
  low: { stride: 3, pixelRatio: 1 },
} as const;
export type AtmosphereQuality = keyof typeof atmosphereQuality;
/** Stable identities keep every retained particle in place when quality decreases.
 * Interleaved vertex: formation.xyz, viewport destination.xyz, identity/depth/size, cluster center/density.
 * The destination uses a low-discrepancy distribution, not frame-by-frame randomness.
 */
export function particleVertex(id: number) {
  const sample = latentSample(id);
  return [...formationPoint(id), (fraction((id + 1) * 0.754877666) * 2 - 1) * 1.05,
    (fraction((id + 1) * 0.569840291) * 2 - 1) * 1.05,
    fraction((id + 1) * 0.438579), id / particleCount,
    fraction((id + 1) * 0.618033989), fraction((id + 1) * 0.414213562),
    ...latentClusters[particleCluster(id)].center, Math.exp(-sample.reduce((sum, value) => sum + value * value, 0) / 2)];
}
export interface ParticleConnection { from: number; to: number; bridge: boolean; }
const neighborRadius = 0.26;
const distanceSquared = (a: readonly number[], b: readonly number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** Construct topology only at initialization/quality changes, never during a frame.
 * A radius-sized spatial hash bounds local searches to 27 cells. Selected anchors
 * connect to their two closest observations within that radius.
 */
function particleConnections(vertices: Map<number, number[]>, stride: number) {
  const cells = new Map<string, number[]>();
  const cell = (point: readonly number[]) => point.slice(0, 3).map(value => Math.floor(value / neighborRadius));
  for (const [id, vertex] of vertices) {
    const key = cell(vertex).join(":");
    const bucket = cells.get(key) ?? []; bucket.push(id); cells.set(key, bucket);
  }
  const edges: ParticleConnection[] = [], seen = new Set<string>();
  const add = (from: number, to: number, bridge = false) => {
    const key = `${Math.min(from, to)}:${Math.max(from, to)}`;
    if (seen.has(key)) return;
    seen.add(key); edges.push({ from, to, bridge });
  };
  for (const [id, vertex] of vertices) {
    if (id % (stride * 8) !== 0) continue;
    const [cx, cy, cz] = cell(vertex);
    let first = -1, second = -1, d1 = neighborRadius ** 2, d2 = d1;
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      for (const other of cells.get(`${cx + x}:${cy + y}:${cz + z}`) ?? []) {
        if (other === id) continue;
        const distance = distanceSquared(vertex, vertices.get(other)!);
        if (distance < d1) { second = first; d2 = d1; first = other; d1 = distance; }
        else if (distance < d2) { second = other; d2 = distance; }
      }
    }
    if (first >= 0) add(id, first);
    if (second >= 0) add(id, second);
  }
  // A tree of component relationships uses the nearest pair of boundary samples,
  // rather than drawing arbitrary long lines through cluster centers.
  const groups = latentClusters.map((_, group) => [...vertices].filter(([id]) => particleCluster(id) === group));
  for (const [a, b] of [[0, 1], [1, 2], [1, 3]]) {
    let best = Infinity, pair: [number, number] | undefined;
    for (const [from, va] of groups[a]) for (const [to, vb] of groups[b]) {
      const distance = distanceSquared(va, vb);
      if (distance < best) { best = distance; pair = [from, to]; }
    }
    if (pair) add(...pair, true);
  }
  return edges;
}
export function createParticleGeometry(quality: AtmosphereQuality = "high") {
  const { stride } = atmosphereQuality[quality];
  const vertices = new Map<number, number[]>();
  const points: number[] = [], lines: number[] = [];
  for (let id = 0; id < particleCount; id += stride) {
    const vertex = particleVertex(id); vertices.set(id, vertex); points.push(...vertex);
  }
  const connections = particleConnections(vertices, stride);
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
