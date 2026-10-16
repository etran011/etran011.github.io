import { writeFileSync } from "node:fs";
import { createParticleGeometry, projectFormationPoint } from "../src/lib/atmosphere-geometry.ts";

const { lines, points } = createParticleGeometry("low");
const project = (p) => { const [x, y] = projectFormationPoint(p); return [600 + x * 290, 500 - y * 290]; };
let paths = "", dots = "";
for (let i = 0; i < lines.length; i += 18) {
  const a = project(lines.slice(i, i + 3)), b = project(lines.slice(i + 9, i + 12));
  paths += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}
for (let i = 0; i < points.length; i += 9) {
  const [x, y] = project(points.slice(i, i + 3));
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.2" opacity="${(0.35 + points[i + 7] * 0.4).toFixed(2)}"/>`;
}
writeFileSync(new URL("../public/images/atmosphere/data-formation.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" fill="none"><path d="${paths}" stroke="#88adf5" stroke-width=".7" opacity=".25"/><g fill="#b5cdff">${dots}</g></svg>\n`);
