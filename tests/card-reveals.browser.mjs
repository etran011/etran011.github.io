/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/card-reveals.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:4186';
try {
 for(const mobile of [false,true]) {
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   sessionStorage.setItem('portfolio:intro:v1','seen');window.reveals=[];
   const animate=Element.prototype.animate;
   Element.prototype.animate=function(frames,options){
    if(this.matches('.content-island'))window.reveals.push({name:this.className,top:this.getBoundingClientRect().top,viewport:innerHeight,frames,options});
    return animate.call(this,frames,options);
   };
  });
  await page.goto(base);await page.waitForTimeout(600);
  const about=page.locator('.project-card').first();
  const top=await about.evaluate(e=>e.getBoundingClientRect().top+scrollY);
  await page.evaluate(y=>scrollTo({top:y-innerHeight-150,behavior:'instant'}),top);
  for(let i=0;i<15;i++){await page.evaluate(()=>scrollBy({top:20,behavior:'instant'}));await page.waitForTimeout(35);}
  await page.waitForTimeout(800);
  const records=await page.evaluate(()=>window.reveals.filter(x=>x.name.includes('project-card')));
  assert.equal(records.length,1);assert(records[0].top>=records[0].viewport-24,'Reveal begins before card is readable');
  assert.equal(records[0].frames[0].opacity,0);
  assert.equal(await about.evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  await about.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>window.reveals.filter(x=>x.name.includes('project-card')).length),1);
  // Large anchor jumps must not hide already-visible cards.
  await page.evaluate(()=>document.querySelector('#contact').scrollIntoView({behavior:'instant'}));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.contact-intro').evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await about.evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.deepEqual(errors,[]);await page.close();
  console.log(mobile?'Mobile reveal stability passed':'Desktop reveal stability passed');
 }
} finally {await browser.close()}
