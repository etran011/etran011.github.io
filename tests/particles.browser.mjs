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
    return { ringOpacity: uniform('uRingOpacity'), projection: Array.from(uniform('uProjection')), marker: Array.from(uniform('uMarker')), head: uniform('uHead'), time: uniform('uTime'), expansion: uniform('uExpansion'), links: uniform('uLinks'), shrink: uniform('uShrink'), strength: uniform('uPointerStrength'), error: gl.getError() };
  });
}
async function ready(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro'));
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.rendererReady === 'true');
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      // Fix density so adaptive quality changes cannot masquerade as scroll rebuilds.
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 4 });
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
    assert.equal(await page.evaluate(() => window.buffersCreated - window.buffersDeleted), 4);
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
    const early = await inspect(page);
    assert(early.expansion > .02 && early.expansion < .15, 'Small scroll starts proportional expansion');
    assert(early.links > .9 && early.ringOpacity > .9);
    const originalScale = descentAfter.projection[0];
    const buffersBefore = await page.evaluate(() => window.buffersCreated);
    for (const id of ['about','projects','experience','skills','education','contact']) {
      await page.locator('#'+id).evaluate(e => window.scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));
      await page.waitForTimeout(2400);
      const state = await inspect(page);
      assert(state.expansion > .6 && state.links >= .549 && state.ringOpacity >= .649, `${id} retains complete mesh and rings`);
      assert(state.projection[0] > originalScale * 2.2, `${id} expands the sculpture`);
      assert(state.shrink > .6, `${id} uses smaller particles`);
      assert(Number(await page.locator('.ambient-canvas').evaluate(e=>getComputedStyle(e).opacity)) >= .46, `${id} never hides the model`);
      assert.equal(await page.locator('.ambient-canvas').count(),1);
      assert.equal(state.error,0);
    }
    assert.equal(await page.evaluate(() => window.buffersCreated),buffersBefore,'Scrolling never rebuilds geometry');
    const lineDraws = await page.evaluate(() => window.particleLineDraws);
    const trajectoryDraws = await page.evaluate(() => window.trajectoryDraws);
    const backgroundBefore = await inspect(page);
    await page.waitForTimeout(1400);
    assert(await page.evaluate(n=>window.particleLineDraws>n,lineDraws),'Background retains mathematical connections');
    assert(await page.evaluate(n=>window.trajectoryDraws>n,trajectoryDraws),'Optimization keeps running behind Contact');
    assert((await inspect(page)).time-backgroundBefore.time>1,'Idle clock continues without scrolling');
    await page.keyboard.press('Home');
    await page.waitForTimeout(100);
    assert((await inspect(page)).expansion > .6,'Reverse jump remains paced');
    await page.waitForTimeout(2900);
    assert((await inspect(page)).expansion < .02);
    assert((await inspect(page)).links > .98 && (await inspect(page)).shrink < .001);
    assert((await inspect(page)).ringOpacity > .99,'Reverse restores full ring emphasis');
    await page.mouse.move(1250, 350);
    await page.waitForTimeout(1200);
    assert((await inspect(page)).strength > 0.99);
    assert.equal(await page.locator('html').getAttribute('data-custom-cursor'), 'true');
    await page.evaluate(() => document.dispatchEvent(new Event('pointerleave')));
    await page.waitForTimeout(1200);
    assert((await inspect(page)).strength < 0.01);
    await page.locator('.hero-scroll-link').click();
    await page.waitForTimeout(2200);
    assert.equal(await page.locator('[data-pinned]').count(),0);
    assert.equal((await inspect(page)).error,0);

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
    assert.equal(await page.evaluate(() => window.buffersCreated - window.buffersDeleted), 4);
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
    console.log('Particle expansion/reversal, pointer/cursor, persistent surface/rings, visibility pause, context recovery and static fallbacks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
