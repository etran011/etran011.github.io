import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayWave, idleWave, idleBreath, resolveIdleRotation } from '../src/lib/atmosphere-idle.mjs';

test('display breathing is bounded, smooth and common to surface and trajectory coordinates', () => {
  for (let i = 0; i < 1000; i++) {
    const x = Math.sin(i) * 1.4, z = Math.cos(i) * 1.4, time = i / 5;
    const height = displayWave(x, z, time);
    assert(Math.abs(height) <= idleWave.amplitude + idleWave.detail);
    assert(Math.abs(displayWave(x, z, time + 1 / 60) - height) < .0025);
    assert.equal(displayWave(x, z, time), displayWave(x, z, time), 'No random jitter');
  }
});
test('idle camera rotates visibly over seconds with bounded angles and no clock resets', () => {
  const pose = { yaw: .68, pitch: .52, roll: -.09 }, a = {}, b = {};
  resolveIdleRotation(2, pose, a); resolveIdleRotation(5, pose, b);
  assert(b.yaw - a.yaw > .1 && b.yaw - a.yaw < .15);
  for (let time = 0; time < 2000; time += .5) {
    resolveIdleRotation(time, pose, a);
    assert(Math.abs(a.yaw - pose.yaw) <= .2751);
    assert(Math.abs(a.pitch - pose.pitch) <= .0551 && Math.abs(a.roll - pose.roll) <= .0251);
  }
  const turn = 200;
  resolveIdleRotation(turn - .001, pose, a); resolveIdleRotation(turn + .001, pose, b);
  assert(Math.abs(Math.sin(b.yaw) - Math.sin(a.yaw)) < .001);
  assert(Math.abs(Math.cos(b.yaw) - Math.cos(a.yaw)) < .001);
});

test('breathing is visible within seconds and repeats smoothly over 4.4 seconds', () => {
  assert(Math.abs(idleBreath(1.1) - idleBreath(3.3)) > .99);
  assert(Math.abs(displayWave(.3, -.2, 1) - displayWave(.3, -.2, 3)) > .035);
  for (let time = 0; time < 100; time += .07) {
    assert(Math.abs(idleBreath(time) - idleBreath(time + 4.4)) < 1e-12);
    assert(Math.abs(idleBreath(time + 1/60) - idleBreath(time)) < .013);
  }
});
