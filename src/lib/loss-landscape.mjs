/** Himmelblau's non-convex objective. Four basins attain the global value zero. */
export function loss(x, z) {
  return (x * x + z - 11) ** 2 + (x + z * z - 7) ** 2;
}
export function lossGradient(x, z) {
  const a = x * x + z - 11, b = x + z * z - 7;
  return [4 * x * a + 2 * b, 2 * a + 4 * z * b];
}
export const landscapeDomain = { min: -4.2, max: 4.2, horizontalScale: 0.31, heightScale: 0.5, heightOffset: -0.85, compression: 16 };
/** Log height is a display transform only; optimization uses the original loss. */
export function surfacePoint(x, z) {
  const d = landscapeDomain;
  return [x * d.horizontalScale, Math.log1p(loss(x, z) / d.compression) * d.heightScale + d.heightOffset, z * d.horizontalScale];
}
export function surfaceNormal(x, z) {
  const d = landscapeDomain, [gx, gz] = lossGradient(x, z);
  const slope = d.heightScale / (d.compression + loss(x, z)) / d.horizontalScale;
  const nx = -gx * slope, nz = -gz * slope, length = Math.hypot(nx, 1, nz);
  return [nx / length, 1 / length, nz / length];
}
