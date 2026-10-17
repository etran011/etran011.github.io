import assert from "node:assert/strict";
import { test } from "node:test";
import { createParticleGeometry, particleVertex, projectFormationPoint, formationPoint, surfaceCoordinates, surfaceColumns, surfaceCount, particleCount, particleStride } from "../src/lib/atmosphere-geometry.ts";

test("quality reductions retain exact particle identities and bounded GPU buffers", () => {
  const high = createParticleGeometry("high");
  assert.equal(surfaceCount, 3024);
  assert.equal(high.points.length / particleStride, particleCount);
  for (const [quality, stride] of [["medium", 3], ["low", 6]]) {
    const geometry = createParticleGeometry(quality);
    assert.equal(geometry.points.length / particleStride, particleCount / stride);
    assert(geometry.lines.length % (particleStride * 2) === 0);
    for (let i = 0; i < geometry.points.length / particleStride; i++) {
      assert.deepEqual(geometry.points.slice(i * particleStride, i * particleStride + particleStride), high.points.slice(i * stride * particleStride, i * stride * particleStride + particleStride));
    }
  }
  assert(high.points.byteLength + high.lines.byteLength < 500_000);
});
test("landscape samples the exact objective and analytic display normals at every quality", async () => {
  const { loss, lossGradient, surfacePoint, surfaceNormal } = await import("../src/lib/loss-landscape.mjs");
  for (let id = 0; id < surfaceCount; id++) {
    const [x, z] = surfaceCoordinates(id), normal = surfaceNormal(x, z);
    assert.deepEqual(formationPoint(id), surfacePoint(x, z));
    assert(Math.abs(Math.hypot(...normal) - 1) < 1e-12 && normal[1] > 0);
    const epsilon = 1e-5, [gx, gz] = lossGradient(x, z);
    assert(Math.abs(gx - (loss(x + epsilon, z) - loss(x - epsilon, z)) / (2 * epsilon)) < 1e-5);
    assert(Math.abs(gz - (loss(x, z + epsilon) - loss(x, z - epsilon)) / (2 * epsilon)) < 1e-5);
  }
});
test("surface links connect parameter neighbors and retain every endpoint at lower quality", () => {
  for (const [quality, stride] of [["high", 1], ["medium", 3], ["low", 6]]) {
    const { connections } = createParticleGeometry(quality);
    assert(connections.length > 100 && connections.length < 1200);
    for (const edge of connections) {
      assert.equal(edge.from % stride, 0); assert.equal(edge.to % stride, 0);
      assert(edge.to - edge.from === surfaceColumns || edge.to - edge.from === surfaceColumns + stride || (edge.to - edge.from === stride && Math.floor(edge.to / surfaceColumns) === Math.floor(edge.from / surfaceColumns)));
    }
  }
});

test("destinations cover all viewport quadrants with finite depth and no random regeneration", () => {
  const quadrants = [0, 0, 0, 0];
  for (let id = 0; id < particleCount; id++) {
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
  assert(quadrants.every(count => Math.abs(count - particleCount / 4) < 40));
});

test("scene poses keep the model restrained and respond to real narrative states", async () => {
  const { resolveAtmospherePose } = await import("../src/lib/atmosphere-scene.ts");
  const target = {};
  const context = { scene: "hero", progress: 0, heroProgress: 0, scroll: 0, aboutStep: 0, skillGroup: null };
  for (const scene of ["hero", "about", "projects", "skills", "quiet"]) {
    context.scene = scene; resolveAtmospherePose(context, target);
    assert(Object.values(target).every(Number.isFinite));
    assert(target.scale <= 0.65);
    assert(target.centerX >= (scene === "hero" ? 0.2 : 0.4));
  }
  context.scene = "about"; resolveAtmospherePose(context, target); const background = target.yaw;
  context.aboutStep = 2; resolveAtmospherePose(context, target); assert(target.yaw > background);
  context.scene = "skills"; context.skillGroup = "tools"; resolveAtmospherePose(context, target); assert.equal(target.detail, 1.3);
  context.scene = "projects"; resolveAtmospherePose(context, target); assert(target.detail < 0.2);
});

test('secondary and micro layers stay anchored to mathematical surface normals',async()=>{
  const {surfacePoint,surfaceNormal}=await import('../src/lib/loss-landscape.mjs');
  const tiers=new Set();
  for(let id=surfaceCount;id<particleCount;id++){
    const coords=surfaceCoordinates(id), anchor=surfacePoint(...coords), normal=surfaceNormal(...coords), vertex=particleVertex(id);
    const offset=vertex.slice(0,3).map((v,i)=>v-anchor[i]), distance=Math.hypot(...offset);
    assert(distance>.05&&distance<=.201);
    assert(Math.hypot(...offset.map((v,i)=>v-normal[i]*distance))<1e-10);
    tiers.add(vertex[12]);
  }
  assert.deepEqual([...tiers],[-1,-2]);
});
