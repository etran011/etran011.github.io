/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/sculpture.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:3001';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.orbitalDraws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      if (args[0] === this.TRIANGLES) window.orbitalDraws++;
      return draw.apply(this, args);
    };
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  const read = () => page.locator('.ambient-canvas').evaluate(c => {
    const gl = c.getContext('webgl'), program = gl.getParameter(gl.CURRENT_PROGRAM);
    const uniform = name => gl.getUniform(program, gl.getUniformLocation(program, name));
    return { time: uniform('uTime'), rotation: Array.from(uniform('uRotation')), rings: Array.from(uniform('uRings')), expansion: uniform('uExpansion'), error: gl.getError() };
  });
  const before = await read(), heading = await page.locator('h1').boundingBox();
  const first = await page.screenshot();
  await page.waitForTimeout(2500);
  const after = await read();
  assert(after.time - before.time > 2);
  assert(Math.abs(after.rotation[0] - before.rotation[0]) > .045, 'Idle orbit must be noticeable within a few seconds');
  assert(!first.equals(await page.screenshot()), 'The idle sculpture must keep moving without input');
  assert.deepEqual(await page.locator('h1').boundingBox(), heading, 'Sculpture motion must not move typography');
  assert(after.rings[2] > .99 && after.expansion < .001);
  assert(await page.evaluate(() => window.orbitalDraws > 0));
  await page.screenshot({ path: 'tmp/sculpture-hero.png' });
  const settleExpansion = goal => page.waitForFunction(goal => {
    const gl = document.querySelector('.ambient-canvas').getContext('webgl'), program = gl.getParameter(gl.CURRENT_PROGRAM);
    const value = gl.getUniform(program, gl.getUniformLocation(program, 'uExpansion'));
    return goal === 1 ? value > .98 : value < .01;
  }, goal);
  await page.keyboard.press('End'); await settleExpansion(1);
  assert((await read()).rings[2] === 0 && (await read()).expansion > .98);
  const ambient = await page.screenshot(), idleY = await page.evaluate(() => scrollY);
  await page.waitForTimeout(1700);
  assert.equal(await page.evaluate(() => scrollY), idleY);
  assert(!ambient.equals(await page.screenshot()), 'Dispersed particles must keep drifting while idle');
  const ambientTime = (await read()).time;
  await page.keyboard.press('Home'); await settleExpansion(0);
  const restored = await read();
  assert(restored.rings[2] > .99 && restored.expansion < .01);
  assert(restored.time > ambientTime, 'Reconstruction must preserve the active clock');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const paused = (await read()).time;
  await page.waitForTimeout(300);
  assert.equal((await read()).time, paused);
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForFunction(t => {
    const g = document.querySelector('.ambient-canvas').getContext('webgl'), p = g.getParameter(g.CURRENT_PROGRAM);
    return g.getUniform(p, g.getUniformLocation(p, 'uTime')) > t;
  }, paused);
  assert.equal((await read()).error, 0);
  assert.deepEqual(errors, []);
  console.log('Visible idle orbit/ribbons, stationary typography, ongoing ambient drift, reversible reconstruction and preserved/paused active clock passed.');
} finally { await browser.close(); }
