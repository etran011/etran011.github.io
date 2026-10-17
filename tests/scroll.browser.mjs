/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/scroll.browser.mjs [baseURL]
 * Wheel bursts emulate input patterns; this does not certify physical trackpad hardware.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:3001';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.weightedScroll === 'true');
  const hero = page.locator('[data-scroll-story="hero"]');
  assert.equal(Number(await hero.getAttribute('data-story-travel')), 1200);
  await page.mouse.move(900, 500);
  // A dense trackpad-like burst retains its distance without skipping visual stages.
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 10); await page.waitForTimeout(30); }
  await page.waitForTimeout(1000);
  assert(Math.abs(await page.evaluate(() => scrollY) - 120) < 2);
  const progress = await hero.evaluate(e => Number(e.style.getPropertyValue('--story-progress')));
  assert(progress > .095 && progress <= .101);
  // A large wheel gesture starts with bounded visual motion, then catches up.
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(100);
  assert(await hero.evaluate(e => Number(e.style.getPropertyValue('--story-progress'))) < .3);
  await page.waitForTimeout(1800);
  assert(Math.abs(await page.evaluate(() => scrollY) - 1020) < 2);
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(1500);
  assert(Math.abs(await page.evaluate(() => scrollY) - 600) < 2);
  assert(Math.abs(await hero.evaluate(e => Number(e.style.getPropertyValue('--story-progress'))) - .5) < .002);
  // Keyboard interrupts interpolation; anchors retain their destination and focus.
  await page.keyboard.press('Home');
  await page.waitForTimeout(700);
  await page.locator('.hero-scroll-link').click();
  await page.waitForFunction(() => document.activeElement.id === 'about');
  assert(await page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top - 112) < 3));
  for (const kind of ['about', 'project']) {
    const story = page.locator(`[data-scroll-story="${kind}"]`);
    assert.equal(await story.getAttribute('data-pinned'), 'true');
    assert(Number(await story.getAttribute('data-story-travel')) >= 1000);
  }
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const ordinaryStart = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(1000);
  assert(Math.abs(await page.evaluate(() => scrollY) - ordinaryStart - 240) < 2, 'Ordinary content keeps the full input distance');
  const settled = await page.evaluate(() => scrollY);
  await page.waitForTimeout(500);
  assert(Math.abs(await page.evaluate(() => scrollY) - settled) < 1, 'No queued input replay');
  await page.keyboard.press('End');
  await page.waitForTimeout(500);
  assert(await page.locator('#contact').evaluate(e => e.getBoundingClientRect().top < innerHeight));
  assert.deepEqual(errors, []);
  console.log('Fine wheel bursts, large input, reverse pacing, native distance, keyboard, anchor focus and normal content passed.');
} finally { await browser.close(); }
