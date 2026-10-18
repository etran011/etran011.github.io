/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/education.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro') && document.documentElement.dataset.weightedScroll === 'true');
  assert.deepEqual(await page.locator('main > section').evaluateAll(sections => sections.map(s => s.id)), ['home', 'about', 'projects', 'experience', 'skills', 'education', 'contact']);
  await page.locator('#education').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-education-motion]')?.dataset.active === 'true');
  const stages = await page.locator('#education').evaluate(s => s.getAnimations({ subtree: true }).filter(a => a.constructor.name === 'Animation' && a.effect?.getTiming().iterations === 1).map(a => a.effect.getTiming().delay));
  assert(new Set(stages).size >= 5, 'Academic content should reveal in distinct stages');
  await page.waitForTimeout(1800);
  const movement = () => page.locator('#education .academic-lattice').evaluate(e => getComputedStyle(e).transform);
  const initial = await movement();
  await page.waitForTimeout(500);
  assert.notEqual(await movement(), initial, 'Academic geometry must continue moving without input');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  assert.equal(await page.locator('#education .academic-signal').evaluate(e => getComputedStyle(e).animationPlayState), 'paused');
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  assert.equal(await page.locator('#education .academic-signal').evaluate(e => getComputedStyle(e).animationPlayState), 'running');
  await page.locator('#education summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#education li').count(), 10);
  assert(await page.locator('#education li').last().isVisible());
  await page.keyboard.press('Enter');
  await page.mouse.move(100, 100); await page.mouse.move(350, 600);
  assert.equal(await page.locator('#education a, #education button, #education [tabindex]').count(), 0, 'Academic facts must not masquerade as clickable controls');
  assert.equal(await page.locator('.custom-cursor').count(), 1);
  await page.screenshot({ path: 'tmp/education-desktop.png' });
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.locator('#home').scrollIntoViewIfNeeded();
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.querySelector('[data-education-motion]').dataset.active === 'false');
  assert.equal(await page.locator('#education .academic-signal').evaluate(e => getComputedStyle(e).animationPlayState), 'paused');
  await page.locator('#education').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-education-motion]').dataset.active === 'true');
  assert.equal(await page.locator('#education').evaluate(s => s.getAnimations({subtree:true}).filter(a => a.constructor.name === 'Animation' && a.effect?.getTiming().iterations === 1).length), 0, 'Entrance must not replay on reentry');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('[data-education-motion]').dataset.active === 'false');
  assert.equal(await page.locator('#education .academic-lattice').evaluate(e => getComputedStyle(e).animationName), 'none');
  assert.deepEqual(errors, []);
  console.log('Entrance, idle motion, visibility pause, reentry and live reduced motion passed.');
  await page.close();
  for (const width of [320, 390, 768, 1024, 1920]) {
    const p = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await p.goto(`${base}/#education`, {waitUntil:'domcontentloaded'});
    await p.locator('#education').scrollIntoViewIfNeeded();
    await p.evaluate(() => document.fonts.ready);
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}`);
    const section = p.locator('#education');
    assert.equal(await section.locator('h2').getAttribute('aria-label'), 'College of William & Mary');
    assert.equal(await section.locator('.education-graduation dd').textContent(), '2028');
    assert.match(await section.locator('.education-gpa dd').textContent(), /3\.92.*4\.00/);
    assert.equal(await section.locator('.education-progression, .education-timeline, [role=progressbar]').count(), 0);
    assert(!/Degree in progress/i.test(await section.textContent()));
    await section.locator('summary').focus(); await p.keyboard.press('Space');
    assert.equal(await section.locator('details').getAttribute('open'), '');
    for (const el of await section.locator('h2, dt, dd, li').all()) {
      const box = await el.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width + 1, `Readable academic content at ${width}`);
    }
    await p.keyboard.press('Enter'); await p.keyboard.press('Tab');
    assert(await p.evaluate(() => !document.querySelector('#education').contains(document.activeElement)), 'Keyboard can leave coursework');
    if (width === 390) {
      await p.locator('#education').scrollIntoViewIfNeeded();
      await p.screenshot({ path:'tmp/education-mobile.png' });
    }
    console.log(`Responsive layout and keyboard coursework passed at ${width}px.`);
    await p.close();
  }
  const noJS = await browser.newPage({javaScriptEnabled:false, viewport:{width:390,height:1000}});
  await noJS.goto(`${base}/#education`);
  assert(await noJS.locator('#education h2').isVisible());
  await noJS.locator('#education summary').focus();
  await noJS.keyboard.press('Enter');
  assert(await noJS.locator('#education li').last().isVisible());
  await noJS.close();
  console.log('Education staged entrance, idle SVG, hidden/offscreen pause, no replay, keyboard disclosure, 320–1920px layouts, reduced motion and no-JS content passed.');
} finally { await browser.close(); }
