import { writeFileSync } from "node:fs";
import { createParticleGeometry, projectFormationPoint } from "../src/lib/atmosphere-geometry.ts";
import { formationView } from "../src/lib/atmosphere-view.mjs";

const { lines, points } = createParticleGeometry("low");
const project = (p) => {
  const [x, y, depth] = projectFormationPoint(p);
  return [(1 + formationView.centerX) * 720 + x * formationView.scale * 500,
    (1 - formationView.centerY) * 500 - y * formationView.scale * 500, depth];
};
let dots = "";
const paths = new Map();
for (let i = 0; i < lines.length; i += 18) {
  const a = project(lines.slice(i, i + 3)), b = project(lines.slice(i + 9, i + 12));
  const opacity = (0.22 + Math.max(0, Math.min(1, (1.8 - (a[2] + b[2]) / 2) / 3.6)) * 0.3).toFixed(1);
  paths.set(opacity, (paths.get(opacity) ?? "") + `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
}
for (let i = 0; i < points.length; i += 9) {
  const [x, y] = project(points.slice(i, i + 3));
  const density = (points[i + 1] + 0.68) / 1.9;
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.1 + density * 0.35).toFixed(2)}" opacity="${(0.3 + density * 0.4 + points[i + 7] * 0.15).toFixed(2)}"/>`;
}
writeFileSync(new URL("../public/images/atmosphere/data-formation.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" fill="none"><g stroke="#88adf5" stroke-width=".8">${[...paths].map(([opacity, d]) => `<path d="${d}" opacity="${opacity}"/>`).join("")}</g><g fill="#b5cdff">${dots}</g></svg>\n`);
