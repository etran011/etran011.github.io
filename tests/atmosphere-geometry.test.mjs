import assert from "node:assert/strict";
import { test } from "node:test";
import { createParticleGeometry, particleVertex, projectFormationPoint, formationPoint } from "../src/lib/atmosphere-geometry.ts";

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
  assert(high.points.byteLength + high.lines.byteLength < 60_000);
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
  const context = { scene: "hero", progress: 0, aboutStep: 0, skillGroup: null };
  for (const scene of ["hero", "about", "projects", "skills", "quiet"]) {
    context.scene = scene; resolveAtmospherePose(context, target);
    assert(Object.values(target).every(Number.isFinite));
    assert(target.scale <= 0.65 && target.centerX >= 0.58);
  }
  context.scene = "about"; resolveAtmospherePose(context, target); const background = target.yaw;
  context.aboutStep = 2; resolveAtmospherePose(context, target); assert(target.yaw > background);
  context.scene = "skills"; context.skillGroup = "tools"; resolveAtmospherePose(context, target); assert.equal(target.detail, 1.3);
  context.scene = "projects"; resolveAtmospherePose(context, target); assert(target.detail < 0.2);
});
