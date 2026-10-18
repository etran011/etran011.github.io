/** Scientific coordinate rings with nested tracks, calibrated ticks and fiducial nodes.
 * Metadata shares the particle vertex layout: arc fraction, ring index, angular speed.
 */
export function createRingGeometry(ribbon = true) {
  const data: number[] = [];
  const vertex = (angle: number, ring: number, radiusOffset = 0, detail = 0) => {
    const radius = 2.02 + ring * 0.15 + radiusOffset;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * (0.84 + ring * 0.045);
    const tilt = [0.08, 0.72, -0.52][ring];
    return [x, z * Math.sin(tilt) - 0.12, z * Math.cos(tilt),
      angle / (Math.PI * 2), ring, [0.065, -0.045, 0.03][ring], 0, 1, 0, detail];
  };
  const segment = (a: number, b: number, ring: number, tick = false, offset = 0, detail = 0, major = false) => {
    const end = tick ? (major ? 0.045 : 0.022) : 0;
    const width = detail === 1 ? 0.0018 : 0.0035;
    if (!ribbon) { data.push(...vertex(a, ring, offset, detail), ...vertex(b, ring, offset + end, detail)); return; }
    // Real narrow ribbons avoid platform-dependent WebGL line-width limits.
    const side = (angle: number, radius: number, sign: number) => {
      const point = vertex(angle + (tick ? sign * 0.002 : 0), ring, offset + radius + (tick ? 0 : sign * width), detail);
      point[3] = angle / (Math.PI * 2); // Width must not cross the arc's identity seam.
      return point;
    };
    const a0 = side(a, 0, -1), a1 = side(a, 0, 1), b0 = side(b, end, -1), b1 = side(b, end, 1);
    data.push(...a0, ...a1, ...b0, ...a1, ...b1, ...b0);
  };
  for (let ring = 0; ring < 3; ring++) {
    for (let index = 0; index < 180; index++) {
      const angle = index / 180 * Math.PI * 2;
      if (index < 162 + ring * 4 && index % 45 < 42) segment(angle, (index + 1) / 180 * Math.PI * 2, ring);
      if (index % 5 === 0 && index < 162 + ring * 4) segment(angle, angle, ring, true, 0, 2, index % 15 === 0);
    }
    for (let track = 0; track < 2; track++) for (let index = 0; index < 120; index++) {
      if (index === 119 || (index + ring * 7 + track * 11) % 40 > 29) continue;
      segment(index / 120 * Math.PI * 2, (index + 1) / 120 * Math.PI * 2, ring, false, -.08 - track * .08, 1);
    }
    for (const index of [20, 70, 130]) {
      const angle = index / 180 * Math.PI * 2;
      segment(angle - .008, angle + .008, ring, false, -.04, 3);
      segment(angle, angle, ring, true, -.062, 3, true);
    }
  }
  return new Float32Array(data);
}
