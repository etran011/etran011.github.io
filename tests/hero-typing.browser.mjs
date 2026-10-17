/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/hero-typing.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {heroHeadlineText} from '../src/lib/hero-typing.ts';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
const count=p=>p.locator('.hero-character[data-typed]').count();
const complete=p=>p.waitForFunction(()=>!document.documentElement.hasAttribute('data-hero-typing') && !document.documentElement.hasAttribute('data-intro'));
const box=p=>p.locator('.hero-headline').boundingBox();
try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>document.documentElement.hasAttribute('data-intro'));
  assert.equal(await count(p),0,'No typing behind loader');
  assert.equal(await p.locator('.hero-headline .sr-only').textContent(),heroHeadlineText);
  await p.waitForFunction(()=>document.documentElement.dataset.heroTyping==='typing' && !document.documentElement.hasAttribute('data-intro'));
  await p.evaluate(()=>document.fonts.ready);
  const initial=await box(p);
  await p.waitForFunction(()=>document.querySelectorAll('.hero-character[data-typed]').length>3);
  const partial=await count(p);
  assert(partial<await p.locator('.hero-character').count());
  assert.equal(await p.locator('.hero-character[data-caret]').count(),1);
  assert.equal(await p.locator('.hero-role').evaluate(e=>getComputedStyle(e).opacity),'0');
  await p.screenshot({path:'tmp/hero-typing-active.png'});
  await p.mouse.wheel(0,500);
  await p.waitForTimeout(250);
  assert(await count(p)>=partial,'Scrolling cannot erase characters');
  await complete(p);
  await p.keyboard.press('Home');
  await p.waitForFunction(()=>scrollY<1);
  await p.waitForTimeout(600);
  const final=await box(p);
  assert(Math.abs(initial.height-final.height)<.1 && Math.abs(initial.width-final.width)<.1,'Typing must reserve the final dimensions');
  assert(Math.abs(initial.y-final.y)<.5,'No vertical layout shift');
  assert.equal(await p.locator('.hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);
  assert(Number(await p.locator('.hero-role').evaluate(e=>getComputedStyle(e).opacity))>.99);
  const typed=await count(p);await p.keyboard.press('End');await p.waitForTimeout(250);await p.keyboard.press('Home');await p.waitForTimeout(700);
  assert.equal(await count(p),typed,'Reentry must not restart typing');
  assert.equal(await p.locator('.hero-story-phrase').count(),0);
  await p.screenshot({path:'tmp/hero-typing-complete.png'});
  assert.deepEqual(errors,[]);
  // Same page session skips the loader but types again on a real page reload.
  await p.reload({waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('.portfolio-intro').evaluate(e=>getComputedStyle(e).display),'none');
  await p.waitForFunction(()=>document.documentElement.dataset.heroTyping==='typing');
  await p.emulateMedia({reducedMotion:'reduce'});await complete(p);
  assert.equal(await p.locator('.hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);
  await p.close();
  for(const width of [320,390,768,1024]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.heroTyping==='typing');
    const before=await box(page);await complete(page);const after=await box(page);
    assert(Math.abs(before.height-after.height)<.1&&Math.abs(before.width-after.width)<.1,`Stable multiline typing at ${width}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
    assert.equal(await page.locator('.hero-headline-line[aria-hidden=true]').count(),2);
    if(width===390)await page.screenshot({path:'tmp/hero-typing-mobile.png'});
    await page.close();
  }
  for(const options of [{reducedMotion:'reduce'},{forcedColors:'active'},{javaScriptEnabled:false}]) {
    const page=await browser.newPage({viewport:{width:390,height:900},...options});await page.goto(base,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);
    assert.equal(await page.locator('.hero-headline .sr-only').textContent(),heroHeadlineText);await page.close();
  }
  const blocked=await browser.newPage({viewport:{width:1440,height:1000}});
  await blocked.route('**/_next/static/**/*.js',r=>r.abort());await blocked.goto(base,{waitUntil:'domcontentloaded'});await complete(blocked);
  assert.equal(await blocked.locator('.hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0,'Independent watchdog exposes full text if hydration fails');
  await blocked.close();
  console.log('Loader handoff, automatic sequential typing/caret, scroll independence, stable dimensions at 320–1440px, return visit, reduced/forced/no-JS and hydration-failure fallbacks passed.');
}finally{await browser.close();}
