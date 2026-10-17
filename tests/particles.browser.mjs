/* Optional integration check: PLAYWRIGHT_MODULE=/path/to/playwright node tests/particles.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { loss, landscapeDomain } from '../src/lib/loss-landscape.mjs';
import { createRequire } from 'node:module';
const loadPlaywright = createRequire(import.meta.url);
const { chromium } = loadPlaywright(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:3001';

async function inspect(page) {
  return page.locator('.ambient-canvas').evaluate(canvas => {
    const gl = canvas.getContext('webgl');
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    const uniform = name => gl.getUniform(program, gl.getUniformLocation(program, name));
    return { marker: Array.from(uniform('uMarker')), head: uniform('uHead'), time: uniform('uTime'), expansion: uniform('uExpansion'), release: uniform('uRelease'), separation: uniform('uSeparation'), links: uniform('uLinks'), shrink: uniform('uShrink'), strength: uniform('uPointerStrength'), error: gl.getError() };
  });
}
async function ready(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
  await page.waitForFunction(() => document.documentElement.dataset.weightedScroll === 'true');
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.particleFrames = 0;
      window.trajectoryDraws = 0;
      window.buffersCreated = 0; window.buffersDeleted = 0;
      const createBuffer = WebGLRenderingContext.prototype.createBuffer;
      const deleteBuffer = WebGLRenderingContext.prototype.deleteBuffer;
      WebGLRenderingContext.prototype.createBuffer = function (...args) { window.buffersCreated++; return createBuffer.apply(this, args); };
      WebGLRenderingContext.prototype.deleteBuffer = function (...args) { window.buffersDeleted++; return deleteBuffer.apply(this, args); };
      window.particleLineDraws = 0;
      const draw = WebGLRenderingContext.prototype.drawArrays;
      WebGLRenderingContext.prototype.drawArrays = function (...args) {
        if (args[0] === this.LINES) window.particleLineDraws++;
        if (args[0] === this.LINE_STRIP) window.trajectoryDraws++;
        return draw.apply(this, args);
      };
      const clear = WebGLRenderingContext.prototype.clear;
      WebGLRenderingContext.prototype.clear = function (...args) {
        window.particleFrames++;
        return clear.apply(this, args);
      };
    });
    await ready(page);
    assert.equal(await page.evaluate(() => window.buffersCreated - window.buffersDeleted), 3);
    await page.waitForTimeout(1100);
    const descentBefore = await inspect(page);
    await page.waitForTimeout(1000);
    const descentAfter = await inspect(page);
    const markerLoss = marker => loss(marker[0] / landscapeDomain.horizontalScale, marker[2] / landscapeDomain.horizontalScale);
    assert(descentAfter.head > descentBefore.head && markerLoss(descentAfter.marker) < markerLoss(descentBefore.marker));
    assert(await page.evaluate(() => window.trajectoryDraws > 0));
    assert((await inspect(page)).expansion < 0.01);
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(750);
    const loosening = await inspect(page);
    assert(loosening.separation > 0.02 && loosening.release < 0.001 && loosening.links > 0.5);
    await page.mouse.wheel(0, 140);
    await page.waitForTimeout(650);
    const partial = (await inspect(page)).expansion;
    assert(partial > 0.02 && partial < 0.65);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(2300);
    assert((await inspect(page)).expansion > 0.95);
    assert((await inspect(page)).links === 0 && (await inspect(page)).release > 0.98);
    assert((await inspect(page)).shrink > 0.99);
    const releasedLineDraws = await page.evaluate(() => window.particleLineDraws);
    const releasedTrajectoryDraws = await page.evaluate(() => window.trajectoryDraws);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.particleLineDraws), releasedLineDraws, 'Invisible connections must not issue GPU draws');
    assert.equal(await page.evaluate(() => window.trajectoryDraws), releasedTrajectoryDraws);
    await page.keyboard.press('Home');
    await page.waitForTimeout(100);
    assert((await inspect(page)).expansion > 0.6, 'A reverse jump must not teleport particles');
    await page.waitForTimeout(2900);
    assert((await inspect(page)).expansion < 0.02);
    assert((await inspect(page)).links > 0.98 && (await inspect(page)).release < 0.001);
    assert((await inspect(page)).shrink < 0.001);
    assert(await page.evaluate(n => window.particleLineDraws > n, releasedLineDraws));
    await page.mouse.move(1250, 350);
    await page.waitForTimeout(900);
    assert((await inspect(page)).strength > 0.99);
    assert.equal(await page.locator('html').getAttribute('data-custom-cursor'), 'true');
    await page.evaluate(() => document.dispatchEvent(new Event('pointerleave')));
    await page.waitForTimeout(1200);
    assert((await inspect(page)).strength < 0.01);
    await page.locator('.hero-scroll-link').click();
    await page.waitForTimeout(2500);
    assert((await inspect(page)).expansion > 0.98);
    const idleY = await page.evaluate(() => scrollY), idleBefore = await inspect(page);
    const imageBefore = await page.screenshot();
    await page.waitForTimeout(1400);
    const imageAfter = await page.screenshot(), idleAfter = await inspect(page);
    assert(Math.abs(await page.evaluate(() => scrollY) - idleY) < 1);
    assert(idleAfter.time - idleBefore.time > 1, 'Ambient animation must advance without scroll input');
    assert(!imageBefore.equals(imageAfter), 'The rendered idle background must keep moving');

    assert.equal(await page.locator('[data-scroll-story="about"]').getAttribute('data-pinned'), 'true');
    await page.getByRole('link', { name: 'See what I’m building' }).click();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.ambient-background').getAttribute('data-scene'), 'projects');
    assert(Number(await page.locator('.ambient-canvas').evaluate(e => getComputedStyle(e).opacity)) <= 0.12);
    assert.equal(await page.locator('[data-scroll-story="project"]').getAttribute('data-pinned'), 'true');
    assert.equal(await page.locator('.ambient-canvas').count(), 1);
    assert.equal((await inspect(page)).error, 0);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const frames = await page.evaluate(() => window.particleFrames);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.particleFrames), frames);
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(n => window.particleFrames > n, frames);
    await page.evaluate(() => {
      window.contextLoss = document.querySelector('.ambient-canvas').getContext('webgl').getExtension('WEBGL_lose_context');
      window.contextLoss.loseContext();
    });
    await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'static');
    assert(Number(await page.locator('.ambient-formation').evaluate(e => getComputedStyle(e).opacity)) > 0);
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.contextLoss.restoreContext());
    await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'static');
    assert.equal(await page.evaluate(() => window.buffersCreated - window.buffersDeleted), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
    assert.equal(await page.evaluate(() => window.buffersCreated - window.buffersDeleted), 3);
    assert.deepEqual(errors, []);
    await page.close();

    for (const options of [
      { viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true },
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' },
      { viewport: { width: 1440, height: 1000 }, javaScriptEnabled: false },
    ]) {
      const fallback = await browser.newPage(options);
      await fallback.addInitScript(() => {
        window.particleContextAttempts = 0;
        const context = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          if (kind === 'webgl') window.particleContextAttempts++;
          return context.call(this, kind, ...args);
        };
      });
      await fallback.goto(base, { waitUntil: 'load' });
      assert(await fallback.locator('.ambient-formation img').evaluate(e => e.complete && e.naturalWidth > 0));
      assert(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await fallback.locator('.ambient-background').getAttribute('aria-hidden'), 'true');
      assert.equal(await fallback.locator('.ambient-background').evaluate(e => getComputedStyle(e).pointerEvents), 'none');
      if (options.javaScriptEnabled !== false) {
        assert.equal(await fallback.evaluate(() => window.particleContextAttempts), 0, 'Static modes must avoid GPU initialization');
        assert.equal(await fallback.locator('.ambient-background').getAttribute('data-renderer'), 'static');
      }
      if (options.reducedMotion === 'reduce') {
        await fallback.locator('.hero-scroll-link').click();
        assert.equal(await fallback.locator('.ambient-scroll-layer').evaluate(e => getComputedStyle(e).transform), 'none');
        assert.equal(await fallback.locator('.ambient-halo').evaluate(e => getComputedStyle(e).transform), 'none');
      }
      await fallback.close();
    }
    const unavailable = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await unavailable.addInitScript(() => {
      const context = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        return kind === 'webgl' ? null : context.call(this, kind, ...args);
      };
    });
    await unavailable.goto(base, { waitUntil: 'load' });
    await unavailable.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'static');
    assert(await unavailable.locator('.ambient-formation img').evaluate(e => e.complete && e.naturalWidth > 0));
    console.log('Particle expansion/reversal, pointer/cursor, pinned sections, visibility pause, context recovery and static fallbacks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
