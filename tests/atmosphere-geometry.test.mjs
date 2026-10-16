import assert from "node:assert/strict";
import { test } from "node:test";
import { createParticleGeometry, particleVertex, projectFormationPoint, formationPoint, latentSample, latentClusters, particleCluster, particleStride } from "../src/lib/atmosphere-geometry.ts";

test("quality reductions retain exact particle identities and bounded GPU buffers", () => {
  const high = createParticleGeometry("high");
  assert.equal(high.points.length / particleStride, 1248);
  for (const [quality, stride] of [["medium", 2], ["low", 3]]) {
    const geometry = createParticleGeometry(quality);
    assert.equal(geometry.points.length / particleStride, 1248 / stride);
    assert(geometry.lines.length % (particleStride * 2) === 0);
    for (let i = 0; i < geometry.points.length / particleStride; i++) {
      assert.deepEqual(geometry.points.slice(i * particleStride, i * particleStride + particleStride), high.points.slice(i * stride * particleStride, i * stride * particleStride + particleStride));
    }
  }
  assert(high.points.byteLength + high.lines.byteLength < 110_000);
});
test("synthetic mixture keeps all four components at every quality and matches their weights", () => {
  for (const stride of [1, 2, 3]) {
    const counts = [0, 0, 0, 0];
    for (let id = 0; id < 1248; id += stride) counts[particleCluster(id)]++;
    counts.forEach((count, index) => assert(Math.abs(count / (1248 / stride) - latentClusters[index].weight) < 0.015));
  }
});
test("deterministic Gaussian samples have finite bounded tails and distinct non-spherical components", () => {
  const sums = latentClusters.map(() => [0, 0, 0, 0]);
  for (let id = 0; id < 1248; id++) {
    const sample = latentSample(id);
    assert.deepEqual(sample, latentSample(id));
    assert(sample.every(Number.isFinite));
    assert(sample.reduce((sum, value) => sum + value * value, 0) <= 2.8 ** 2);
    const group = particleCluster(id), point = formationPoint(id);
    for (let axis = 0; axis < 3; axis++) sums[group][axis] += point[axis];
    sums[group][3]++;
  }
  latentClusters.forEach((cluster, group) => {
    assert(cluster.factor[0] > 0 && cluster.factor[2] > 0 && cluster.factor[5] > 0);
    assert(Math.max(cluster.factor[0], cluster.factor[2], cluster.factor[5]) / Math.min(cluster.factor[0], cluster.factor[2], cluster.factor[5]) > 1.2);
    for (let axis = 0; axis < 3; axis++) assert(Math.abs(sums[group][axis] / sums[group][3] - cluster.center[axis]) < 0.055);
  });
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
