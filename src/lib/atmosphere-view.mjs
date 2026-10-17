/** Shared static/live rest view. Plain ESM also supports the standalone SVG generator. */
export const formationCamera = 8.0;
export const formationView = { yaw: 0.68, pitch: 0.52, roll: -0.09, scale: 0.47, centerX: 0.24, centerY: 0 };

/** Projected envelope of the framed ring ribbons at every orbital orientation. */
export const sculptureRadius = 2.08;
export function fitSculptureScale(pose, aspect) {
  const horizontal = Math.max(0.04, 0.96 - Math.abs(pose.centerX)) * Math.max(0.1, aspect) / sculptureRadius;
  const vertical = Math.max(0.04, 0.96 - Math.abs(pose.centerY)) / sculptureRadius;
  return Math.min(pose.scale, horizontal, vertical);
}

/** Move the complete formation right using spare room, without changing its scale. */
export function positionSculptureCenter(pose, aspect) {
  const scale = fitSculptureScale(pose, aspect);
  const spare = 0.96 - pose.centerX - sculptureRadius * scale / Math.max(0.1, aspect);
  return pose.centerX + Math.min(0.16, Math.max(0, spare));
}
