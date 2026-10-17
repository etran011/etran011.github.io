/** Sparse coordinate ellipses, with an open arc and ticks rather than atom-like orbits.
 * Metadata shares the particle vertex layout: arc fraction, ring index, angular speed.
 */
export function createRingGeometry(ribbon = true) {
  const data: number[] = [];
  const vertex = (angle: number, ring: number, radiusOffset = 0) => {
    const radius = 2.02 + ring * 0.15 + radiusOffset;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * (0.84 + ring * 0.045);
    const tilt = [0.08, 0.72, -0.52][ring];
    return [x, z * Math.sin(tilt) - 0.12, z * Math.cos(tilt), 0, 0, 0,
      angle / (Math.PI * 2), ring, [0.065, -0.045, 0.03][ring], 0, 1, 0, 0];
  };
  const segment = (a: number, b: number, ring: number, tick = false) => {
    const end = tick ? 0.045 : 0;
    if (!ribbon) { data.push(...vertex(a, ring), ...vertex(b, ring, end)); return; }
    // Real narrow ribbons avoid platform-dependent WebGL line-width limits.
    const side = (angle: number, radius: number, sign: number) => {
      const point = vertex(angle + (tick ? sign * 0.002 : 0), ring, radius + (tick ? 0 : sign * 0.004));
      point[6] = angle / (Math.PI * 2); // Width must not cross the arc's identity seam.
      return point;
    };
    const a0 = side(a, 0, -1), a1 = side(a, 0, 1), b0 = side(b, end, -1), b1 = side(b, end, 1);
    data.push(...a0, ...a1, ...b0, ...a1, ...b1, ...b0);
  };
  for (let ring = 0; ring < 3; ring++) {
    for (let index = 0; index < 120; index++) {
      if (index >= 108 + ring * 3) continue;
      segment(index / 120 * Math.PI * 2, (index + 1) / 120 * Math.PI * 2, ring);
      if (index % 10 === 0) segment(index / 120 * Math.PI * 2, index / 120 * Math.PI * 2, ring, true);
    }
  }
  return new Float32Array(data);
}
