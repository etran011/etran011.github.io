/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/hero-navigation.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {heroHeadlinePhrases} from '../src/lib/hero-typing.ts';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4174';
const errors=[];
const assertHealthy=async page=>{
  assert.deepEqual(errors,[],'No runtime errors, console errors or React warnings');
  assert.equal(await page.locator('[data-nextjs-dialog]:visible').count(),0,'No development error overlay');
};
const state=page=>page.locator('.hero-headline').evaluate(e=>({phrase:e.dataset.phrase,phase:e.dataset.phase,count:e.querySelectorAll('.hero-phrase[data-active] [data-typed]').length}));
const resume=async page=>{
  await page.locator('.hero-headline').waitFor({state:'visible'});
  await page.keyboard.press('Home');
  await page.waitForFunction(()=>{
    const e=document.querySelector('.hero-headline');
    return e?.dataset.typing==='cycling'&&!e.hasAttribute('data-paused')&&e.querySelectorAll('[data-caret]').length===1;
  },{}, {timeout:8000});
  assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-intro')),false,'No missing loader event blocks return');
  await assertHealthy(page);
};
const loop=async page=>{
  for(const index of [0,1,0]) {
    await page.waitForFunction(index=>{
      const e=document.querySelector('.hero-headline');
      return e?.dataset.phrase===String(index)&&e.dataset.phase==='hold';
    },index,{timeout:15000});
    assert.equal((await state(page)).count,heroHeadlinePhrases[index].lines.join(' ').length);
    assert.equal(await page.locator('.hero-character[data-caret]').count(),1,'One caret after every effect restart');
    assert.equal(await page.locator('.hero-character[data-caret]').evaluate(e=>getComputedStyle(e,'::after').animationName),'hero-caret-blink');
    await page.waitForFunction(()=>document.querySelector('.hero-headline').dataset.phase==='backspace');
    const before=await state(page);await page.waitForTimeout(120);
    assert((await state(page)).count<before.count,'Backspacing continues after navigation');
  }
};
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  // React's client-rendered script warning reaches the Next overlay via console.error,
  // without an uncaught exception; pageerror alone misses this regression.
  page.on('console',message=>{
    if(['error','warning'].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  await page.goto(base);await resume(page);
  await page.evaluate(()=>{window.navigationDocument='same-document'});
  for(const slug of ['optionlab','platepredict','optionlab','platepredict']) {
    await page.evaluate(()=>{window.previousHeadline=document.querySelector('.hero-headline')});
    await page.locator(`.case-link[href='/projects/${slug}/']`).click();
    await page.getByRole('link',{name:'All projects',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>window.previousHeadline.querySelectorAll('[data-caret]').length),0,'Effect cleanup removes the old caret');
    await page.getByRole('link',{name:'All projects',exact:true}).click();await resume(page);
    assert.equal(await page.evaluate(()=>window.navigationDocument),'same-document','Return uses client-side navigation');
    await loop(page);
    console.log('Full typing/backspacing loop after All projects:',slug);
  }
  await page.locator('.case-link').first().click();await page.getByRole('link',{name:'All projects',exact:true}).waitFor();
  await page.goBack();await resume(page);
  await page.goForward();await page.getByRole('link',{name:'All projects',exact:true}).waitFor();
  await page.goBack();await resume(page);await loop(page);
  // Visibility pauses the existing state without starting a second cycle.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  const paused=await state(page);await page.waitForTimeout(400);assert.deepEqual(await state(page),paused);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await resume(page);
  for(let i=0;i<3;i++) {
    await page.locator('.case-link').first().click();
    await page.getByRole('link',{name:'All projects',exact:true}).click();
  }
  await resume(page);await loop(page);
  await page.goto(`${base}/projects/platepredict/`);
  await page.getByRole('link',{name:'All projects',exact:true}).click();await resume(page);await loop(page);
  await page.reload();await resume(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='static');
  await assertHealthy(page);
  console.log('Back/Forward, direct project entry, rapid returns, refresh, visibility pause/resume, reduced motion and console checks passed');
  await page.close();
}finally{await browser.close()}
