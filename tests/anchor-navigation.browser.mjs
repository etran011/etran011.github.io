/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/anchor-navigation.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:4186';
try {
 for(const mobile of [false,true]) {
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-intro'));
  for(const [selector,id] of [['.hero-scroll-link','about'],['.about-story-next','projects'],['.footer-top-link','main-content']]) {
   await page.locator(selector).scrollIntoViewIfNeeded();
   await page.locator(selector).evaluate(el=>el.addEventListener('click',()=>{
    window.travel=[];const start=performance.now();
    const sample=()=>{window.travel.push({t:performance.now()-start,y:scrollY});if(performance.now()-start<1600)requestAnimationFrame(sample)};requestAnimationFrame(sample);
   },{once:true}));
   await page.locator(selector).click();
   await page.waitForFunction(id=>document.activeElement?.id===id,id);
   const samples=await page.evaluate(()=>window.travel),first=samples[0].y,last=samples.at(-1).y;
   assert(samples.length>5,'Navigation crosses multiple rendered frames');
   const sign=Math.sign(last-first);
   assert(samples.every((s,i)=>i===0||(s.y-samples[i-1].y)*sign>=-1),'No overshoot or direction changes');
   if(id==='main-content')assert.equal(await page.evaluate(()=>scrollY),0);
   else assert((await page.locator('#'+id).boundingBox()).y>=100,'Destination clears navigation');
   assert.equal(await page.evaluate(()=>location.hash),'#'+id);
   console.log(mobile?'mobile':'desktop',id,Math.round(samples.at(-1).t)+'ms',Math.round(Math.abs(last-first))+'px');
   await page.waitForTimeout(1650); // Let the test sampler finish before the next click.
   if(!mobile) {
    const expansion=await page.locator('.ambient-canvas').evaluate(c=>{const g=c.getContext('webgl'),p=g.getParameter(g.CURRENT_PROGRAM);return g.getUniform(p,g.getUniformLocation(p,'uExpansion'))});
    assert(id==='main-content'?expansion<.02:expansion>.8,'Sculpture follows navigation and returns to its hero pose');
   }
  }
  // Input cancels the current navigation without preventing normal keyboard scrolling.
  await page.locator('.footer-top-link').scrollIntoViewIfNeeded();await page.locator('.footer-top-link').click();
  await page.waitForTimeout(100);await page.keyboard.press('Escape');
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const stopped=await page.evaluate(()=>scrollY);await page.waitForTimeout(250);
  assert(stopped>0);assert(Math.abs(await page.evaluate(()=>scrollY)-stopped)<2);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.footer-top-link').scrollIntoViewIfNeeded();await page.locator('.footer-top-link').click();
  assert.equal(await page.evaluate(()=>scrollY),0);
  await page.locator('.hero-scroll-link').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'about');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  assert.deepEqual(errors,[]);await page.close();
 }
}finally{await browser.close()}
