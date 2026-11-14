/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/animation-lifecycle.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:4186';
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{
  window.buffers=0;window.frames=0;
  const create=WebGLRenderingContext.prototype.createBuffer,remove=WebGLRenderingContext.prototype.deleteBuffer,clear=WebGLRenderingContext.prototype.clear;
  WebGLRenderingContext.prototype.createBuffer=function(...args){window.buffers++;return create.apply(this,args)};
  WebGLRenderingContext.prototype.deleteBuffer=function(...args){window.buffers--;return remove.apply(this,args)};
  WebGLRenderingContext.prototype.clear=function(...args){window.frames++;return clear.apply(this,args)};
 });
 const typing=()=>page.waitForFunction(()=>document.querySelector('.hero-headline')?.dataset.typing==='cycling'&&document.querySelectorAll('[data-caret]').length===1);
 await page.goto(base);await typing();
 for(let i=0;i<2;i++) {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='static');
  await page.emulateMedia({reducedMotion:'no-preference'});await typing();
  const count=await page.locator('[data-typed]').count();
  await page.waitForFunction(n=>document.querySelectorAll('[data-typed]').length!==n,count,{timeout:3500});
 }
 for(const slug of ['optionlab','platepredict','optionlab','platepredict']) {
  await page.locator(`.case-link[href='/projects/${slug}/']`).click();
  await page.getByRole('link',{name:'All projects',exact:true}).click();
  await page.locator('.hero-headline').waitFor({state:'visible'});await page.keyboard.press('Home');await typing();
  await page.waitForFunction(()=>window.buffers===4);
 }
 await page.goBack();await page.goForward();await page.locator('.hero-headline').waitFor({state:'visible'});await page.keyboard.press('Home');await typing();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 const frames=await page.evaluate(()=>window.frames);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.frames),frames);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
 await page.waitForFunction(n=>window.frames>n,frames);await typing();
 const pacing=await page.evaluate(()=>new Promise(resolve=>{const start=window.frames;let ticks=0;const tick=()=>{if(++ticks<60)requestAnimationFrame(tick);else resolve(window.frames-start)};requestAnimationFrame(tick)}));
 assert(pacing>0&&pacing<=61,'Only one WebGL render per display frame');
 assert.equal(await page.locator('.ambient-canvas').count(),1);assert.deepEqual(errors,[]);
 console.log('Preference recovery, four client navigation cycles, Back/Forward, tab pause/resume, four live buffers and single render loop passed:',base);
} finally {await browser.close()}
