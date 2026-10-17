/** Sparse coordinate ellipses, with an open arc and ticks rather than atom-like orbits.
 * Metadata shares the particle vertex layout: arc fraction, ring index, angular speed.
 */
export function createRingGeometry() {
  const data: number[] = [];
  const vertex = (angle: number, ring: number, radiusOffset = 0) => {
    const radius = 1.85 + ring * 0.19 + radiusOffset;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * (0.84 + ring * 0.045);
    const tilt = [0.12, 0.58, -0.42][ring];
    return [x, z * Math.sin(tilt) - 0.12, z * Math.cos(tilt), 0, 0, 0,
      angle / (Math.PI * 2), ring, [0.025, -0.018, 0.009][ring], 0, 1, 0, 0];
  };
  for (let ring = 0; ring < 3; ring++) {
    for (let segment = 0; segment < 120; segment++) {
      // Each ring has a small open interval and twelve fine coordinate ticks.
      if (segment >= 108 + ring * 3) continue;
      data.push(...vertex(segment / 120 * Math.PI * 2, ring), ...vertex((segment + 1) / 120 * Math.PI * 2, ring));
      if (segment % 10 === 0) data.push(...vertex(segment / 120 * Math.PI * 2, ring), ...vertex(segment / 120 * Math.PI * 2, ring, 0.035));
    }
  }
  return new Float32Array(data);
}
