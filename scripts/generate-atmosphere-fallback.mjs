import { writeFileSync } from "node:fs";
import { createRibbonGeometry, projectRibbonPoint } from "../src/lib/atmosphere-geometry.ts";

const { lines, points } = createRibbonGeometry("medium");
const project = (p) => { const [x, y, z] = projectRibbonPoint(p); return [600 + x * 290, 500 - y * 290, z]; };
const paths = [];
for (let i = 0; i < lines.length; i += 6) {
  const a = project(lines.slice(i, i + 3)); const b = project(lines.slice(i + 3, i + 6));
  paths.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" opacity="${(0.12 + (1 - Math.min(1, Math.max(0, (a[2] + 1.6) / 3.2))) * 0.42).toFixed(2)}"/>`);
}
const dots = [];
for (let i = 0; i < points.length; i += 3) { const [x, y] = project(points.slice(i, i + 3)); dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1"/>`); }
// Group into a few paths by depth to keep the fallback small and independently cacheable.
const groups = new Map();
for (const path of paths) { const [, d, opacity] = path.match(/d="([^"]+)" opacity="([^"]+)"/); const key = (Math.round(Number(opacity) * 8) / 8).toFixed(3); groups.set(key, (groups.get(key) ?? "") + d); }
writeFileSync(new URL("../public/images/atmosphere/signal-ribbon.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" fill="none"><g stroke="#88adf5" stroke-width="0.8">${[...groups].map(([opacity, d]) => `<path d="${d}" opacity="${opacity}"/>`).join("")}</g><g fill="#b5cdff" opacity=".6">${dots.join("")}</g></svg>\n`);
