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
export function createParticleGeometry(quality: AtmosphereQuality = "high") {
  const { stride } = atmosphereQuality[quality];
  const points: number[] = [], lines: number[] = [];
  for (let id = 0; id < particleCount; id += stride) points.push(...particleVertex(id));
  return { points: new Float32Array(points), lines: new Float32Array(lines) };
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
