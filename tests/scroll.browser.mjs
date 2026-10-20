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
  await page.addInitScript(()=>{
    sessionStorage.setItem('portfolio:intro:v1','seen');
    window.wheelCanceled=[];
    window.addEventListener('wheel',event=>queueMicrotask(()=>window.wheelCanceled.push(event.defaultPrevented)),{passive:true});
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro'));
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.rendererReady === 'true');
  const hero = page.locator('#home');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  assert.equal(await page.locator('html[class*=lenis], [data-weighted-scroll]').count(),0);

  assert.equal(await page.locator('[data-pinned]').count(),0);
  const expansion=()=>page.locator('.ambient-canvas').evaluate(c=>{const g=c.getContext('webgl'),p=g.getParameter(g.CURRENT_PROGRAM);return g.getUniform(p,g.getUniformLocation(p,'uExpansion'));});
  await page.waitForFunction(()=>document.querySelector('.ambient-background').dataset.renderer==='webgl');
  await page.mouse.move(900, 500);
  // A dense trackpad-like burst retains its distance without skipping visual stages.
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 10); await page.waitForTimeout(30); }
  await page.waitForTimeout(150);
  assert(Math.abs(await page.evaluate(() => scrollY) - 120) < 2);
  const progress = await expansion();
  assert(progress > .12 && progress < .22);
  // Native document travel finishes immediately; only decorative expansion eases.
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(100);
  assert(Math.abs(await page.evaluate(()=>scrollY)-1020)<2,'Large wheel input has no artificial resistance');
  assert(await expansion() > progress && await expansion() < .85, "Large jumps still ease without freezing the visual");
  await page.waitForTimeout(1800);
  assert(Math.abs(await page.evaluate(() => scrollY) - 1020) < 2);
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(1500);
  assert(Math.abs(await page.evaluate(() => scrollY) - 600) < 2);
  assert(Math.abs(await expansion() - 600 / ((await hero.boundingBox()).height * 0.85)) < .03);
  // Keyboard keys and anchor focus are browser-owned, with no scroll engine.
  const beforeKeys=await page.evaluate(()=>scrollY);
  await page.keyboard.press('PageDown');await page.waitForTimeout(450);
  assert(await page.evaluate(()=>scrollY)>beforeKeys);
  await page.keyboard.press('PageUp');await page.waitForTimeout(450);
  assert(Math.abs(await page.evaluate(()=>scrollY)-beforeKeys)<3);
  await page.keyboard.press('Home');
  await page.waitForTimeout(700);
  await page.locator('.hero-scroll-link').click();
  await page.waitForFunction(() => document.activeElement.id === 'about');
  assert(await page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top - 112) < 3));
  assert.equal(await page.locator('[data-pinned]').count(),0);
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
  assert((await page.evaluate(()=>window.wheelCanceled)).every(value=>value===false),'Wheel events are never canceled');
  assert.deepEqual(errors, []);
  console.log('Uncanceled native wheel input, immediate full distance, keyboard, anchor focus, reverse travel and visual expansion passed.');
} finally { await browser.close(); }
