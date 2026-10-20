/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/cursor.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
  await page.goto(base);await page.locator('#hero-heading').waitFor();
  const native=async()=>{
   assert.equal(await page.locator('.custom-cursor,.cursor-ring,.cursor-dot,.cursor-position,[data-custom-cursor]').count(),0);
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('*')].some(e=>getComputedStyle(e).cursor==='none')),false,'No element hides the native cursor');
  };
  await native();
  const card=page.locator('.project-card').first();
  await card.scrollIntoViewIfNeeded();
  const link=card.locator('.case-link').first();await link.hover();
  assert.equal(await link.evaluate(e=>getComputedStyle(e).cursor),'pointer');
  if(width===1440)await page.waitForFunction(()=>document.querySelector('.project-card').dataset.pointerLight==='true');
  const gallery=card.locator('.gallery-stage');await gallery.hover();
  assert.equal(await gallery.evaluate(e=>getComputedStyle(e).cursor),'pointer');
  await gallery.click();await page.locator('dialog[open]').waitFor();
  const close=page.getByRole('button',{name:'Close screenshot viewer',exact:true});
  assert.equal(await close.evaluate(e=>getComputedStyle(e).cursor),'pointer');
  await close.click();await native();
  const text=page.locator('#experience .section-heading > p');
  await text.scrollIntoViewIfNeeded();
  assert.notEqual(await text.evaluate(e=>getComputedStyle(e).userSelect),'none');
  if(width===1440){await text.dblclick();assert((await page.evaluate(()=>getSelection().toString())).length>0);}
  // Test native text-editing behavior without adding a permanent site control.
  await page.evaluate(()=>{getSelection()?.removeAllRanges();const input=document.createElement('input');input.id='native-cursor-test';input.style.cssText='position:fixed;top:200px;left:20px;z-index:10000';document.body.append(input)});
  const input=page.locator('#native-cursor-test');await input.fill('Native text editing');
  assert.equal(await input.evaluate(e=>getComputedStyle(e).cursor),'text');
  await input.evaluate(e=>e.remove());
  await link.click();await page.getByRole('link',{name:'All projects',exact:true}).waitFor();await native();
  await page.getByRole('link',{name:'All projects',exact:true}).click();await page.locator('#projects-heading').waitFor();await native();
  assert.deepEqual(errors,[]);await page.close();
  console.log('Native cursors, selection, controls, gallery, hover lighting and navigation passed',width);
 }
}finally{await browser.close()}
