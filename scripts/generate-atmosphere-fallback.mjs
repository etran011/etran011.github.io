import { createRingGeometry } from "../src/lib/atmosphere-rings.ts";
import { writeFileSync } from "node:fs";
import { createParticleGeometry, projectFormationPoint, particleStride, createTrajectoryGeometry } from "../src/lib/atmosphere-geometry.ts";
import { formationView, fitSculptureScale } from "../src/lib/atmosphere-view.mjs";

const viewScale = fitSculptureScale(formationView, 1440 / 1000);
const { lines, points } = createParticleGeometry("low");
const project = (p) => {
  const [x, y, depth] = projectFormationPoint(p);
  return [(1 + formationView.centerX) * 720 + x * viewScale * 500,
    (1 - formationView.centerY) * 500 - y * viewScale * 500, depth];
};
let ringPath = "";
const rings = createRingGeometry(false);
for (let i = 0; i < rings.length; i += particleStride * 2) {
  const a = project(rings.slice(i, i + 3).map(value => value * 0.85)), b = project(rings.slice(i + particleStride, i + particleStride + 3).map(value => value * 0.85));
  ringPath += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}
let dots = "";
const paths = new Map();
for (let i = 0; i < lines.length; i += particleStride * 2) {
  const a = project(lines.slice(i, i + 3)), b = project(lines.slice(i + particleStride, i + particleStride + 3));
  const opacity = (0.35 + Math.max(0, Math.min(1, (1.8 - (a[2] + b[2]) / 2) / 3.6)) * 0.3).toFixed(1);
  paths.set(opacity, (paths.get(opacity) ?? "") + `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
}
for (let i = 0; i < points.length; i += particleStride) {
  const [x, y] = project(points.slice(i, i + 3));
  const density = points[i + 12];
  dots += `<circle vector-effect="non-scaling-stroke" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.8 + density * 0.45).toFixed(2)}" opacity="${(0.5 + density * 0.3 + points[i + 7] * 0.12).toFixed(2)}"/>`;
}
const trail = createTrajectoryGeometry().data;
let trajectoryPath = "";
for (let i = 0; i < trail.length; i += particleStride) {
  const [x, y] = project(trail.slice(i, i + 3));
  trajectoryPath += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
}
const end = project(trail.slice(-particleStride, -particleStride + 3));
writeFileSync(new URL("../public/images/atmosphere/data-formation.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" fill="none"><path d="${ringPath}" stroke="#88adf5" stroke-width="1.25" opacity=".55" vector-effect="non-scaling-stroke"/><g stroke="#88adf5" stroke-width=".8">${[...paths].map(([opacity, d]) => `<path vector-effect="non-scaling-stroke" d="${d}" opacity="${opacity}"/>`).join("")}</g><g fill="#b5cdff" stroke="#b5cdff" stroke-width=".65">${dots}</g><path d="${trajectoryPath}" stroke="#b5cdff" stroke-width="1.2" vector-effect="non-scaling-stroke" opacity=".8"/><circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="3.5" fill="#b5cdff"/></svg>\n`);
