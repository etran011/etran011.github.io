/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/intro.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const settled = page => page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro'), { }, { timeout: 5000 });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.intro === 'loading');
  const start = await page.evaluate(() => Number(document.documentElement.dataset.introStart));
  assert.equal(await page.locator('.portfolio-intro').evaluate(e => getComputedStyle(e).display), 'grid');
  assert.equal(await page.locator('main').evaluate(e => getComputedStyle(e).visibility), 'hidden');
  assert.equal(await page.locator('.hero-character[data-typed]').count(), 0, 'Headline must wait until the loading screen clears');
  const code = await page.locator('.intro-line > span:last-child').allTextContents();
  assert.equal(new Function(`${code.join('\n')}; return developer.name;`)(), 'Erik Tran', 'Displayed code is valid');
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 500);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => scrollY), 0);
  assert(await page.evaluate(() => !document.activeElement.closest('main, .site-header, footer, .auto-scrollbar')), 'Hidden content cannot receive focus');
  await page.waitForFunction(() => document.documentElement.dataset.intro === 'revealing');
  assert(await page.locator('.intro-ready').evaluate(e => Number(getComputedStyle(e).opacity) >= .95));
  assert.equal(await page.locator('.ambient-background').getAttribute('data-renderer-ready'), 'true');
  assert.equal(await page.locator('.custom-cursor').count(), 1);
  await settled(page);
  assert(await page.evaluate(start => performance.now() - start < 3000, start));
  assert.equal(await page.evaluate(() => scrollY), 0);
  await page.waitForTimeout(600);
  assert(await page.locator('.hero-copy').evaluate(e => Number(getComputedStyle(e).opacity) > .95));
  await page.mouse.click(60, 80);
  await page.mouse.move(850, 500);
  await page.waitForFunction(() => document.documentElement.dataset.customCursor === 'true');
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(1000);
  assert(Math.abs(await page.evaluate(() => scrollY) - 240) < 2, 'Scroll distance remains unchanged after loading');
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.intro), undefined, 'Same session skips reload intro');
  await page.goto(`${base}/projects/optionlab/`);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.intro), undefined);
  assert.deepEqual(errors, []);
  await context.close();

  // Independent first visits exercise native fallbacks without poisoning the main session.
  for (const scenario of ['reduce', 'forced-colors', 'deep-link', 'no-js', 'no-webgl', 'storage-blocked', 'slow-assets', 'live-reduce', 'no-animation', 'no-client']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: scenario === 'reduce' ? 'reduce' : 'no-preference', forcedColors: scenario === 'forced-colors' ? 'active' : 'none', javaScriptEnabled: scenario !== 'no-js' });
    const p = await ctx.newPage();
    if (scenario === 'no-webgl') await p.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return String(kind).includes('webgl') ? null : original.call(this, kind, ...args); };
    });
    if (scenario === 'storage-blocked') await p.addInitScript(() => {
      Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('Unavailable', 'SecurityError'); };
    });
    if (scenario === 'slow-assets') await p.addInitScript(() => {
      Object.defineProperty(document, 'fonts', { value: { ready: new Promise(() => {}) } });
    });
    if (scenario === 'no-client') await p.route('**/_next/static/**/*.js', route => route.abort());
    await p.goto(scenario === 'deep-link' ? `${base}/#projects` : base, { waitUntil: 'domcontentloaded' });
    if (scenario === 'no-animation') await p.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    if (scenario === 'live-reduce') await p.emulateMedia({ reducedMotion: 'reduce' });
    if (['reduce', 'forced-colors', 'deep-link', 'no-js'].includes(scenario)) assert.equal(await p.evaluate(() => document.documentElement.dataset.intro), undefined);
    await settled(p);
    assert.equal(await p.locator('main').evaluate(e => getComputedStyle(e).visibility), 'visible', scenario);
    assert.equal(await p.locator('.portfolio-intro').evaluate(e => getComputedStyle(e).display), 'none', scenario);
    if (scenario === 'no-webgl') assert.equal(await p.locator('.ambient-background').getAttribute('data-renderer'), 'static');
    if (scenario !== 'deep-link') {
      await p.keyboard.press('Tab');
      assert(await p.evaluate(() => document.activeElement.classList.contains('skip-link')), `${scenario}: normal keyboard access restored`);
    }
    await ctx.close();
  }
  for (const width of [320, 390, 768]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage();
    await p.goto(base, { waitUntil: 'domcontentloaded' });
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: no horizontal overflow`);
    assert(await p.locator('.intro-terminal').evaluate(e => e.getBoundingClientRect().width <= innerWidth - 32));
    await settled(p);
    assert.equal(await p.locator('.ambient-background').getAttribute('data-renderer'), 'static');
    await ctx.close();
  }
  console.log('First/return visits, valid terminal code, continuous handoff, scroll/focus/cursor, mobile, reduced motion, storage denial, WebGL failure, slow assets and missing-client watchdog passed.');
} finally { await browser.close(); }
