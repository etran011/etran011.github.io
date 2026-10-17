/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/scrollbar.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:3001';
// Playwright normally hides scrollbars, which would invalidate native drag testing.
const browser = await chromium.launch({ headless: true, channel: 'chrome', ignoreDefaultArgs: ['--hide-scrollbars'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => document.documentElement.dataset.weightedScroll === 'true');
  const assertNoProgress = async () => assert.equal(await page.locator('.scroll-progress, .nav-progress').count(), 0);
  await assertNoProgress();
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement, '::-webkit-scrollbar').width), '12px');
  const thumbBox = { x: 1428, y: 0, width: 12, height: 70 };
  await page.mouse.move(900, 400);
  const idle = await page.screenshot({ clip: thumbBox });
  await page.mouse.move(1434, 22);
  await page.waitForTimeout(200);
  const hover = await page.screenshot({ clip: thumbBox });
  assert(!idle.equals(hover), 'Native thumb visibly emphasizes hover');
  await page.mouse.down();
  const pressed = await page.screenshot({ clip: thumbBox });
  assert(!hover.equals(pressed), 'Native thumb visibly emphasizes dragging');
  await page.mouse.move(1434, 500, { steps: 20 });
  await page.mouse.up();
  assert(await page.evaluate(() => scrollY) > 1000, 'Real native thumb drag scrolls');
  await assertNoProgress();
  await page.mouse.move(900, 400);
  for (const delta of [-1600, 2200, -350]) {
    await page.mouse.wheel(0, delta);
    for (let frame = 0; frame < 5; frame++) { await page.waitForTimeout(70); await assertNoProgress(); }
    await page.waitForTimeout(1000);
    await assertNoProgress();
  }
  // Anchors exercise each pinned section using the actual navigation links.
  for (const section of ['about', 'projects', 'contact']) {
    await page.locator(`.desktop-nav a[href="/#${section}"]`).click();
    await page.waitForFunction(id => document.activeElement?.id === id, section);
    await assertNoProgress();
  }
  await page.goBack();
  await page.waitForTimeout(500);
  await assertNoProgress();
  await page.reload();
  await page.waitForTimeout(600);
  await assertNoProgress();
  await page.keyboard.press('End');
  await page.waitForTimeout(600);
  await assertNoProgress();
  await page.setViewportSize({ width: 1280, height: 800 });
  await assertNoProgress();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Home');
  await page.waitForTimeout(300);
  await assertNoProgress();
  await page.emulateMedia({ forcedColors: 'active' });
  await assertNoProgress();
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarColor), 'auto');
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await touch.newPage();
  await mobile.goto(base);
  assert.equal(await mobile.locator('.scroll-progress, .nav-progress').count(), 0);
  assert.equal(await mobile.evaluate(() => getComputedStyle(document.documentElement, '::-webkit-scrollbar').width), 'auto');
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await mobile.keyboard.press('End');
  await mobile.waitForTimeout(300);
  assert(await mobile.evaluate(() => scrollY > 0));
  await mobile.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await mobile.evaluate(() => getComputedStyle(document.documentElement, '::-webkit-scrollbar').width), 'auto', 'Touch-capable desktops keep system scrollbars');
  await touch.close();
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  await page.goto(`${base}/projects/optionlab/`);
  await page.keyboard.press('End');
  await page.waitForTimeout(400);
  await assertNoProgress();
  assert.deepEqual(errors, []);
  console.log('Native hover/pressed states and dragging; no progress overlays during wheel, reversal, pins, anchors, history, reload, resize and keyboard; reduced-motion, forced-colors and touch fallbacks passed.');
} finally { await browser.close(); }
