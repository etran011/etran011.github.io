import { loss, lossGradient } from './loss-landscape.mjs';

/** Isolines of the actual objective, using triangle cells to avoid saddle ambiguity.
 * Every crossing is refined against the analytic loss, rather than a random mesh.
 */
export function createMathematicalDetails(quality) {
  const [columns, rows, levels] = quality === 'high' ? [48, 32, [2, 8, 24, 64, 160, 400]]
    : quality === 'medium' ? [32, 24, [8, 64, 400]] : [24, 16, [24, 160]];
  const contours = [], vectors = [];
  const crossing = (a, b, level) => {
    let lo = 0, hi = 1;
    const below = loss(...a) < level;
    for (let i = 0; i < 16; i++) {
      const t = (lo + hi) / 2;
      if ((loss(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) < level) === below) lo = t;
      else hi = t;
    }
    const t = (lo + hi) / 2;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const x = -4.2 + col / columns * 8.4, z = -4.2 + row / rows * 8.4;
    const a = [x, z], b = [x + 8.4 / columns, z], c = [x + 8.4 / columns, z + 8.4 / rows], d = [x, z + 8.4 / rows];
    for (const triangle of [[a, b, c], [a, c, d]]) for (const level of levels) {
      const hits = [];
      for (let edge = 0; edge < 3; edge++) {
        const from = triangle[edge], to = triangle[(edge + 1) % 3];
        if ((loss(...from) < level) !== (loss(...to) < level)) hits.push(crossing(from, to, level));
      }
      if (hits.length === 2) contours.push({ from: hits[0], to: hits[1], level });
    }
  }
  const count = quality === 'high' ? 5 : 3;
  for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
    const from = [-3.4 + col / (count - 1) * 6.8, -3.4 + row / (count - 1) * 6.8];
    const [gx, gz] = lossGradient(...from), norm = Math.hypot(gx, gz);
    if (norm < 1e-6) continue;
    const step = Math.min(.004, .24 / norm), to = [from[0] - gx * step, from[1] - gz * step];
    if (loss(...to) >= loss(...from)) continue;
    const dx = to[0] - from[0], dz = to[1] - from[1];
    vectors.push({ from, to },
      { from: to, to: [to[0] - dx * .3 + dz * .2, to[1] - dz * .3 - dx * .2] },
      { from: to, to: [to[0] - dx * .3 - dz * .2, to[1] - dz * .3 + dx * .2] });
  }
  return { contours, vectors };
}
