/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/workspace.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,channel:'chrome'});
const base = process.argv[2] || 'http://127.0.0.1:4173';
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
  await page.goto(base);
  await page.waitForFunction(()=>document.documentElement.dataset.weightedScroll==='true');
  assert.equal(await page.locator('[data-pinned]').count(),0,'Content has no pinned scenes');
  const first = await page.locator('#about').boundingBox();
  assert(first.y < 1100,'About follows the hero without artificial travel');
  const sections=await page.locator('main > section').evaluateAll(nodes=>nodes.map(e=>({id:e.id,position:getComputedStyle(e).position,height:e.offsetHeight,opacity:getComputedStyle(e).opacity})));
  assert(sections.every(s=>s.position!=='sticky' && s.opacity==='1'));
  await page.locator('.gallery-stage').first().scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Next screenshot',exact:true}).click();
  const source=await page.locator('.gallery-stage img').getAttribute('src');
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await page.locator('#projects').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.gallery-stage img').getAttribute('src'),source,'Document scrolling does not change screenshot selection');
  await page.getByRole('button',{name:/Enlarge OptionLab screenshot/}).click();
  assert(await page.locator('dialog').isVisible());
  await page.keyboard.press('Escape');
  assert(!(await page.locator('dialog').isVisible()));
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Python',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Python',exact:true}).getAttribute('aria-pressed'),'true');
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `No horizontal overflow at ${width}px`);
    for (const id of ['projects','experience','education','skills','contact']) {
      await page.locator('#'+id).scrollIntoViewIfNeeded();
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${id} fits ${width}px`);
    }
    assert.equal(await page.locator('.stack-collection').count(),3);
    assert.equal(await page.locator('.technology-button').count(),19);
    assert.equal(await page.locator('.experience-entry.content-island').count(),4);
    assert.equal(await page.locator('.about-islands .content-island').count(),4);
    assert(await page.locator('#about-background-heading').isVisible());
  }
  assert.deepEqual(errors,[]);
  console.log('Natural section flow, no pinning, stable gallery selection, modal and Tools interactions passed.');
} finally {await browser.close();}
