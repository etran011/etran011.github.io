/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/idle-energy.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { descentPath, descentPlayback } from '../src/lib/loss-landscape.mjs';
import { energyCycle } from '../src/lib/atmosphere-idle.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require('sharp');
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
    // Start at stable low geometry so adaptive density cannot alter the pixel comparison.
    Object.defineProperty(navigator, 'hardwareConcurrency', {configurable:true,value:4});
    // Hold the real scene's other GPU inputs steady to isolate the emitted wave.
    const names = new WeakMap(), frozen = new Map();
    const proto = WebGLRenderingContext.prototype, locate = proto.getUniformLocation;
    proto.getUniformLocation = function (program, name) {
      const location = locate.call(this, program, name);
      if (location) names.set(location, name);
      return location;
    };
    let kind = 0;
    const draw = proto.drawArrays;
    proto.drawArrays = function (...args) {
      if (!window.onlyRings || kind === 3) return draw.apply(this, args);
    };
    const held = new Set(['uTime', 'uRotation', 'uMarker', 'uHead', 'uTrajectoryAlpha', 'uEnergy', 'uProjection', 'uLight', 'uScroll']);
    for (const method of ['uniform1f', 'uniform2f', 'uniform3f', 'uniform4f']) {
      const original = proto[method];
      proto[method] = function (location, ...values) {
        const name = names.get(location);
        if (name === 'uKind') kind = values[0];
        if (window.freezeIdle && held.has(name)) {
          if (!frozen.has(name)) frozen.set(name, values);
          values = [...frozen.get(name)];
          if (name === 'uEnergy') values[3] = window.waveAge;
        }
        return original.call(this, location, ...values);
      };
    }
  });
  await page.goto(process.argv[2] || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro') && document.querySelector('.ambient-background')?.dataset.renderer === 'webgl');
  await page.waitForTimeout(3500);
  const state = await page.locator('.ambient-canvas').evaluate(c => {
    const g = c.getContext('webgl'), p = g.getParameter(g.CURRENT_PROGRAM);
    return { time: g.getUniform(p, g.getUniformLocation(p, 'uTime')), energy: [...g.getUniform(p, g.getUniformLocation(p, 'uEnergy'))], error: g.getError() };
  });
  const origin = {};
  descentPlayback(Math.floor(state.time / energyCycle) * energyCycle, descentPath(), origin);
  for (const [i, key] of ['x', 'y', 'z'].entries()) assert(Math.abs(state.energy[i] - origin[key]) < 1e-5);
  assert(Math.abs(state.energy[3] - state.time % energyCycle) < 1e-5);
  assert.equal(state.error, 0);
  await page.evaluate(() => { window.freezeIdle = true; window.waveAge = 0; });
  await page.waitForTimeout(150);
  // Crop the graphic, excluding the independently running terminal text above the canvas.
  const capture = () => page.screenshot({clip:{x:900,y:80,width:500,height:840}});
  const quiet = await capture();
  await page.evaluate(() => { window.waveAge = 2.9; });
  await page.waitForTimeout(150);
  const crest = await capture();
  const decode = bytes => sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const a = await decode(quiet), b = await decode(crest);
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (Math.abs(a.data[i+3] - b.data[i+3]) > 5 || Math.abs(a.data[i+2] - b.data[i+2]) > 5) changed++;
  }
  assert(changed > 300, `Isolated wave must visibly change the rendered sculpture, found ${changed} pixels`);
  await page.evaluate(age => { window.waveAge = age; }, energyCycle);
  await page.waitForTimeout(150);
  const ended = await decode(await capture());
  assert(a.data.equals(ended.data), 'Wave must fade completely, including ring response, without residual displacement');
  await page.evaluate(() => { window.onlyRings = true; window.waveAge = 0; });
  await page.waitForTimeout(150);
  const restingRings = await decode(await capture());
  await page.evaluate(() => { window.waveAge = 2.9; });
  await page.waitForTimeout(150);
  const litRings = await decode(await capture());
  let ringPixels = 0;
  for (let i = 0; i < restingRings.data.length; i += 4) {
    if (Math.abs(restingRings.data[i+2] - litRings.data[i+2]) > 3 || Math.abs(restingRings.data[i+3] - litRings.data[i+3]) > 3) ringPixels++;
  }
  assert(ringPixels > 100, 'Orbital highlights must visibly react to the wave');
  await page.evaluate(() => { window.freezeIdle = false; window.onlyRings = false; });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tmp/idle-energy-hero.png' });
  console.log(`Optimizer emission follows the actual descent; isolated GPU wave changes ${changed} pixels and fades exactly to rest; ${ringPixels} ring pixels respond.`);
} finally { await browser.close(); }
