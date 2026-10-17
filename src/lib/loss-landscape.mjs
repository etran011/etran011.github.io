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

/** Gradient descent on the original objective with Armijo backtracking.
 * 0.004 is below the reciprocal Hessian row-sum bound on the displayed domain.
 */
export function gradientDescent(start = [0.6, 3.8], maxSteps = 1024) {
  const steps = [{ x: start[0], z: start[1], value: loss(...start), rate: 0 }];
  for (let i = 0; i < maxSteps; i++) {
    const current = steps.at(-1), [gx, gz] = lossGradient(current.x, current.z);
    const normSquared = gx * gx + gz * gz;
    if (normSquared < 1e-14) break;
    let rate = 0.004, accepted = false;
    for (let attempt = 0; attempt < 30; attempt++, rate *= 0.5) {
      const x = current.x - rate * gx, z = current.z - rate * gz, value = loss(x, z);
      if (x >= landscapeDomain.min && x <= landscapeDomain.max && z >= landscapeDomain.min && z <= landscapeDomain.max && value <= current.value - 1e-4 * rate * normSquared) {
        steps.push({ x, z, value, rate }); accepted = true; break;
      }
    }
    if (!accepted) break;
  }
  return steps;
}

/** Densify parameter segments, re-evaluating height so the trail hugs the surface. */
export function descentPath() {
  const steps = gradientDescent(), path = [], distances = [];
  let distance = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i], b = steps[i + 1];
    const subdivisions = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.025));
    for (let part = 0; part < subdivisions; part++) {
      const t = part / subdivisions;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      if (path.length) distance += Math.hypot(x - path.at(-1).x, z - path.at(-1).z);
      path.push({ x, z }); distances.push(distance);
    }
  }
  const last = steps.at(-1);
  distance += Math.hypot(last.x - path.at(-1).x, last.z - path.at(-1).z);
  path.push({ x: last.x, z: last.z }); distances.push(distance);
  return { steps, path, progress: distances.map(value => value / distance) };
}
const clamp = value => Math.max(0, Math.min(1, value));
/** Retimed playback, not a different optimizer. Fade to zero before restarting. */
export function descentPlayback(time, trajectory, target) {
  const cycle = time % 12;
  target.alpha = clamp(cycle / 0.7) * clamp((11.4 - cycle) / 0.8);
  target.progress = clamp((cycle - 0.7) / 8.5);
  let low = 0, high = trajectory.progress.length - 1;
  while (low + 1 < high) {
    const middle = (low + high) >>> 1;
    if (trajectory.progress[middle] <= target.progress) low = middle; else high = middle;
  }
  const a = trajectory.path[low], b = trajectory.path[high];
  const t = clamp((target.progress - trajectory.progress[low]) / Math.max(1e-12, trajectory.progress[high] - trajectory.progress[low]));
  const point = surfacePoint(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t);
  target.x = point[0]; target.y = point[1] + 0.012; target.z = point[2];
}
