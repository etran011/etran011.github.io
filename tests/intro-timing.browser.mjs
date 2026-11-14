/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/intro-timing.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:4186';
const errors=[];
async function instrument(page) {
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
 await page.addInitScript(()=>{
  window.introFrames=[];
  const sample=t=>{const el=document.querySelector('.portfolio-intro');
   if(el&&document.documentElement.dataset.intro&&getComputedStyle(el).display!=='none')window.introFrames.push(t);
   requestAnimationFrame(sample);
  };requestAnimationFrame(sample);
 });
}
async function check(page,label) {
 await page.waitForFunction(()=>window.introFrames.length>0);
 await page.waitForFunction(()=>!document.documentElement.dataset.intro);
 const duration=await page.evaluate(()=>window.introFrames.at(-1)-window.introFrames[0]);
 assert(duration>=2400&&duration<=2650,`${label}: ${duration}ms`);
 assert.equal(await page.locator('.hero-role').evaluate(e=>getComputedStyle(e).visibility),'visible');
 console.log(label,Math.round(duration)+'ms');
 return duration;
}
try {
 const context=await browser.newContext();
 // Retain earlier tabs; reuse the context/cache, then close and reopen another tab.
 for(let i=0;i<5;i++) {
  const page=await context.newPage();await instrument(page);
  if(i===0){const cdp=await context.newCDPSession(page);await cdp.send('Network.clearBrowserCache');}
  await page.goto(base);await check(page,`foreground ${i+1}`);
  if(i===4){await page.reload();assert.equal(await page.evaluate(()=>!!document.documentElement.dataset.intro),false);}
  if(i===2)await page.close();
 }
 // Actual opener-created tab copies sessionStorage in Chromium.
 const opener=context.pages()[0];
 const popupPromise=context.waitForEvent('page');
 await opener.evaluate(url=>window.open(url,'_blank'),base);
 const popup=await popupPromise;await popup.waitForLoadState();
 await popup.waitForFunction(()=>document.documentElement.dataset.intro==='loading');
 await popup.waitForFunction(()=>!document.documentElement.dataset.intro);
 console.log('opener-copied session: full loader played');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await instrument(mobile);await mobile.goto(base);await check(mobile,'mobile');
 await mobile.emulateMedia({reducedMotion:'reduce'});await mobile.goto(base);
 assert.equal(await mobile.evaluate(()=>!!document.documentElement.dataset.intro),false);
 console.log('reduced motion: immediate');
 // Simulate a visibility lifecycle; headless Chromium does not hide background tabs.
 const paused=await context.newPage();await instrument(paused);await paused.goto(base);
 await paused.waitForTimeout(500);
 await paused.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const before=await paused.locator('.intro-caret').evaluate(e=>e.getAnimations()[0].currentTime);
 await paused.waitForTimeout(1200);
 assert.equal(await paused.locator('.intro-caret').evaluate(e=>e.getAnimations()[0].currentTime),before);
 await paused.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await paused.waitForFunction(()=>!document.documentElement.dataset.intro);
 console.log('visibility: timeline pauses and resumes without skipping');
 // Failure to initialize CSS animation APIs must release the page.
 const failure=await context.newPage();await failure.addInitScript(()=>{const original=Element.prototype.getAnimations;Element.prototype.getAnimations=function(...args){if(this.matches('.portfolio-intro'))throw Error('test failure');return original.apply(this,args)}});
 await failure.goto(base);await failure.waitForFunction(()=>!document.documentElement.dataset.intro);
 console.log('controller failure: page released');
 const navigation=context.pages()[0];
 await navigation.locator('a.case-link[href="/projects/optionlab/"]').click();
 await navigation.waitForURL('**/projects/optionlab/');
 await navigation.locator('.case-back').click();await navigation.waitForURL('**/#projects');
 assert.equal(await navigation.evaluate(()=>!!document.documentElement.dataset.intro),false);
 await navigation.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await navigation.waitForFunction(()=>document.querySelector('.hero-headline')?.dataset.typing==='cycling');
 console.log('project return: no replay, hero typing resumes');
 assert.deepEqual(errors,[]);
}finally{await browser.close()}
