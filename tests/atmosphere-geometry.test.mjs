import assert from "node:assert/strict";
import { test } from "node:test";
import { createParticleGeometry, particleVertex, projectFormationPoint, formationPoint, gaussianDensity, formationContours } from "../src/lib/atmosphere-geometry.ts";

test("quality reductions retain exact particle identities and bounded GPU buffers", () => {
  const high = createParticleGeometry("high");
  assert.equal(high.points.length / 9, 1248);
  for (const [quality, stride] of [["medium", 2], ["low", 3]]) {
    const geometry = createParticleGeometry(quality);
    assert.equal(geometry.points.length / 9, 1248 / stride);
    assert(geometry.lines.length % 18 === 0);
    for (let i = 0; i < geometry.points.length / 9; i++) {
      assert.deepEqual(geometry.points.slice(i * 9, i * 9 + 9), high.points.slice(i * stride * 9, i * stride * 9 + 9));
    }
  }
  assert(high.points.byteLength + high.lines.byteLength < 72_000);
});
test("Gaussian surface preserves the PDF, symmetry and exact sigma contours", () => {
  assert.equal(gaussianDensity(0, 0), 1 / (2 * Math.PI));
  assert(Math.abs(gaussianDensity(1, 0) / gaussianDensity(0, 0) - Math.exp(-0.5)) < 1e-12);
  for (let id = 0; id < 1248; id++) {
    const [x, y, z] = formationPoint(id);
    const expectedHeight = gaussianDensity(x / 0.48, z / 0.48) * 2 * Math.PI * 1.9 - 0.68;
    assert(Math.abs(y - expectedHeight) < 1e-12);
    const opposite = formationPoint(Math.floor(id / 48) * 48 + (id % 48 + 24) % 48);
    assert(Math.abs(x + opposite[0]) < 1e-12 && Math.abs(z + opposite[2]) < 1e-12);
    assert(Math.abs(y - opposite[1]) < 1e-12);
  }
  for (const [index, ring] of formationContours.entries()) {
    const sigma = index + 1;
    for (let angle = 0; angle < 48; angle++) {
      const [x, y, z] = formationPoint(ring * 48 + angle);
      assert(Math.abs(Math.hypot(x, z) / 0.48 - sigma) < 1e-12);
      assert(Math.abs((y + 0.68) / 1.9 - Math.exp(-sigma * sigma / 2)) < 1e-12);
    }
  }
});
test("contour edges close at every quality and never jump between density levels", () => {
  for (const quality of ["high", "medium", "low"]) {
    const { lines } = createParticleGeometry(quality);
    for (let sigma = 1; sigma <= 3; sigma++) {
      const edges = [];
      for (let i = 0; i < lines.length; i += 18) {
        const a = Math.hypot(lines[i], lines[i + 2]) / 0.48;
        const b = Math.hypot(lines[i + 9], lines[i + 11]) / 0.48;
        if (Math.abs(a - sigma) < 1e-6 && Math.abs(b - sigma) < 1e-6) edges.push(i);
      }
      assert.equal(edges.length, quality === "high" ? 48 : quality === "medium" ? 24 : 16);
      assert.deepEqual(lines.slice(edges.at(-1) + 9, edges.at(-1) + 18), lines.slice(edges[0], edges[0] + 9));
    }
  }
});

test("destinations cover all viewport quadrants with finite depth and no random regeneration", () => {
  const quadrants = [0, 0, 0, 0];
  for (let id = 0; id < 1248; id++) {
    const vertex = particleVertex(id);
    assert.deepEqual(vertex, particleVertex(id));
    assert(vertex.every(Number.isFinite));
    assert(Math.abs(vertex[3]) <= 1.05 && Math.abs(vertex[4]) <= 1.05);
    assert(vertex[5] >= 0 && vertex[5] < 1);
    quadrants[(vertex[3] > 0 ? 1 : 0) + (vertex[4] > 0 ? 2 : 0)]++;
    const projected = projectFormationPoint(formationPoint(id));
    assert(projected.every(Number.isFinite));
    assert(Math.abs(projected[0]) < 2 && Math.abs(projected[1]) < 2);
  }
  assert(quadrants.every(count => count > 280 && count < 345));
});

test("scene poses keep the model restrained and respond to real narrative states", async () => {
  const { resolveAtmospherePose } = await import("../src/lib/atmosphere-scene.ts");
  const target = {};
  const context = { scene: "hero", progress: 0, heroProgress: 0, scroll: 0, aboutStep: 0, skillGroup: null };
  for (const scene of ["hero", "about", "projects", "skills", "quiet"]) {
    context.scene = scene; resolveAtmospherePose(context, target);
    assert(Object.values(target).every(Number.isFinite));
    assert(target.scale <= 0.65 && target.centerX >= 0.4);
  }
  context.scene = "about"; resolveAtmospherePose(context, target); const background = target.yaw;
  context.aboutStep = 2; resolveAtmospherePose(context, target); assert(target.yaw > background);
  context.scene = "skills"; context.skillGroup = "tools"; resolveAtmospherePose(context, target); assert.equal(target.detail, 1.3);
  context.scene = "projects"; resolveAtmospherePose(context, target); assert(target.detail < 0.2);
});
