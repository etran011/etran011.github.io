/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/cinematic.browser.mjs [baseURL] */
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
    window.reveals = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      window.reveals.push({ section: this.closest('main > section')?.id, className: this.className, frames: args[0] });
      return animate.apply(this, args);
    };
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.ambient-background').dataset.renderer === 'webgl');
  assert(await page.locator('h1').evaluate(e => Number(getComputedStyle(e).opacity) >= .7));
  assert(await page.locator('.hero-scroll-link').isVisible());
  await page.locator('.hero-scroll-link').click();
  await page.waitForFunction(() => document.activeElement.id === 'about');
  await page.getByRole('link', { name: 'See what I’m building' }).click();
  await page.waitForFunction(() => document.activeElement.id === 'projects');
  const project = page.locator('[data-scroll-story="project"]');
  const gallery = project.locator('.screenshot-gallery');
  const headingBefore = await project.locator('#projects-heading').boundingBox();
  const first = await gallery.locator('.gallery-stage img').getAttribute('src');
  await gallery.getByRole('button', { name: 'Next screenshot' }).click();
  assert.notEqual(await gallery.locator('.gallery-stage img').getAttribute('src'), first);
  assert.equal(await gallery.locator('.project-preview').evaluate(e => e.style.getPropertyValue('--frame-direction')), '1');
  await gallery.getByRole('button', { name: 'Previous screenshot' }).click();
  assert.equal(await gallery.locator('.gallery-stage img').getAttribute('src'), first);
  assert.equal(await gallery.locator('.project-preview').evaluate(e => e.style.getPropertyValue('--frame-direction')), '-1');
  await page.waitForTimeout(750);
  assert.equal(await gallery.locator('.gallery-stage img').evaluate(e => getComputedStyle(e).transform), 'none');
  const headingAfter = await project.locator('#projects-heading').boundingBox();
  assert(Math.abs(headingAfter.y - headingBefore.y) < 2, 'Image transitions must not move the pinned heading');
  await gallery.locator('.gallery-stage').click();
  assert(await gallery.getByRole('dialog').isVisible());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  assert.equal(await gallery.getByRole('dialog').count(), 0);
  assert(await gallery.locator('.gallery-stage').evaluate(e => e === document.activeElement));
  for (const section of ['experience', 'skills', 'education', 'contact']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    await page.waitForFunction(id => document.querySelector('.ambient-background').dataset.section === id, section);
    await page.waitForTimeout(950);
    assert(await page.locator(`#${section} h2`).isVisible());
    assert(await page.evaluate(id => window.reveals.some(r => r.section === id), section));
  }
  const revealCount = await page.evaluate(() => window.reveals.filter(r => r.section === 'contact').length);
  await page.keyboard.press('Home');
  await page.waitForTimeout(400);
  await page.keyboard.press('End');
  await page.waitForTimeout(900);
  assert.equal(await page.evaluate(() => window.reveals.filter(r => r.section === 'contact').length), revealCount, 'Closing scene must settle, not replay on every visit');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelectorAll('[data-pinned]').length === 0);
  assert.equal(await page.locator('[data-pinned]').count(), 0);
  assert(await page.locator('#contact').evaluate(e => e.getAnimations({ subtree: true }).every(a => a.playState !== 'running')));
  assert.deepEqual(errors, []);
  console.log('Usable opening, staged section entrances, quiet settling, closing atmosphere and reduced motion passed.');
} finally { await browser.close(); }
