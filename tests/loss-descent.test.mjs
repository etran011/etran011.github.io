import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loss, lossGradient, gradientDescent, descentPath, descentPlayback, landscapeDomain } from '../src/lib/loss-landscape.mjs';

test('analytical gradient agrees with independent finite differences across the landscape', () => {
  const h = 1e-5;
  for (const x of [-4, -2, 0, 1, 3, 4]) {
    for (const z of [-4, -2, 0, 1, 3, 4]) {
      const numerical = [
        (loss(x + h, z) - loss(x - h, z)) / (2 * h),
        (loss(x, z + h) - loss(x, z - h)) / (2 * h),
      ];
      lossGradient(x, z).forEach((value, axis) => {
        assert(Math.abs(value - numerical[axis]) < 1e-6 * Math.max(1, Math.abs(value)),
          `Gradient mismatch at (${x}, ${z}), axis ${axis}`);
      });
    }
  }
});

test('descent follows the exact negative gradient and sufficient decrease into the selected basin', () => {
  const steps = gradientDescent();
  assert(steps.length > 20 && steps.length < 1024);
  for (let i = 1; i < steps.length; i++) {
    const a = steps[i - 1], b = steps[i], g = lossGradient(a.x, a.z);
    assert(Math.abs(b.x - (a.x - b.rate * g[0])) < 1e-12);
    assert(Math.abs(b.z - (a.z - b.rate * g[1])) < 1e-12);
    assert(b.value <= a.value - 1e-4 * b.rate * (g[0] ** 2 + g[1] ** 2));
    // Continuous display interpolation must also descend, not cut a decorative arc.
    let previous = a.value;
    for (let j = 1; j <= 20; j++) {
      const value = loss(a.x + (b.x - a.x) * j / 20, a.z + (b.z - a.z) * j / 20);
      assert(value <= previous + 1e-12); previous = value;
    }
  }
  const end = steps.at(-1);
  assert(end.value < 1e-12 && Math.abs(end.x - 3) < 1e-5 && Math.abs(end.z - 2) < 1e-5);
});
test('other starting basins converge independently rather than sharing a fabricated endpoint', () => {
  const a = gradientDescent([-3.5, 2.5]).at(-1), b = gradientDescent([-0.5, -3.5]).at(-1);
  assert(a.value < 1e-12 && b.value < 1e-12);
  assert(a.x < -2 && a.z > 3 && b.x < -3 && b.z < -3);
});
test('playback stays on the display surface and is invisible during its restart', () => {
  const trajectory = descentPath(), target = {};
  for (let t = 0; t < 12; t += 0.1) {
    descentPlayback(t, trajectory, target);
    const x = target.x / landscapeDomain.horizontalScale, z = target.z / landscapeDomain.horizontalScale;
    const height = Math.log1p(loss(x, z) / 16) * 0.5 - 0.85;
    assert(Math.abs(target.y - height - 0.012) < 1e-12);
    assert(Object.values(target).every(Number.isFinite));
  }
  descentPlayback(11.5, trajectory, target); assert.equal(target.alpha, 0);
  descentPlayback(12, trajectory, target); assert.equal(target.alpha, 0);
});
