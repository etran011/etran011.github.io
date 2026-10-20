/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/pointer-response.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('.ambient-background').dataset.playing==='true');
 for(const [x,y,scroll] of [[.6,.4,0],[-.6,-.4,0],[.7,-.3,100],[-.7,.3,0]]) {
  const result=await page.evaluate(({x,y,scroll})=>new Promise(resolve=>{
   const gl=document.querySelector('.ambient-canvas').getContext('webgl');
   const read=()=>{const p=gl.getParameter(gl.CURRENT_PROGRAM);const u=n=>gl.getUniform(p,gl.getUniformLocation(p,n));return {point:Array.from(u('uLight')),strength:u('uPointerStrength'),time:u('uTime'),expansion:u('uExpansion')}};
   const before=read(),start=performance.now(),samples=[];
   document.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:(x+1)*innerWidth/2,clientY:(1-y)*innerHeight/2}));
   scrollTo({top:scroll,behavior:'instant'});
   const tick=()=>{samples.push({ms:performance.now()-start,...read()});if(samples.at(-1).ms<240)requestAnimationFrame(tick);else resolve({before,samples,error:gl.getError()})};requestAnimationFrame(tick);
  }),{x,y,scroll});
  const initial=Math.hypot(result.before.point[0]-x,result.before.point[1]-y);
  const reached=result.samples.find(s=>Math.hypot(s.point[0]-x,s.point[1]-y)<=initial*.1);
  assert(reached&&reached.ms<=115,'90% response within 100ms plus one display frame');
  for(let axis=0;axis<2;axis++){const target=[x,y][axis],start=result.before.point[axis];assert(result.samples.every(s=>s.point[axis]>=Math.min(start,target)-.001&&s.point[axis]<=Math.max(start,target)+.001),'No overshoot during direction changes')}
  assert(result.samples.at(-1).time>result.before.time,'Idle clock continues');assert.equal(result.error,0);
  console.log('90% pointer response:',Math.round(reached.ms),'ms; scroll',scroll);
 }
 // Real pointer input, slow movement followed by rapid changes.
 for(const steps of [30,2,1]){await page.mouse.move(400,300,{steps});await page.mouse.move(1200,600,{steps});}
 await page.evaluate(()=>document.dispatchEvent(new Event('pointerleave')));
 const strength=()=>page.locator('.ambient-canvas').evaluate(c=>{const g=c.getContext('webgl'),p=g.getParameter(g.CURRENT_PROGRAM);return g.getUniform(p,g.getUniformLocation(p,'uPointerStrength'))});
 await page.waitForTimeout(100);const fading=await strength();assert(fading>0&&fading<1,'Exit fades rather than snapping');
 await page.waitForTimeout(900);assert(await strength()<.01,'Pointer influence returns to rest');
 assert.equal(await page.locator('.custom-cursor,[data-custom-cursor]').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.ambient-background').dataset.renderer==='static');
 assert.equal(await page.locator('.ambient-background').getAttribute('data-playing'),'false');assert.deepEqual(errors,[]);await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await mobile.goto(base);await mobile.waitForFunction(()=>document.querySelector('.ambient-background').dataset.renderer==='static');
 assert(await mobile.locator('.ambient-formation img').evaluate(i=>i.complete&&i.naturalWidth>0));assert.equal(await mobile.locator('.custom-cursor,[data-custom-cursor]').count(),0);await mobile.close();
 console.log('Slow/rapid input, reversals, release, idle animation, native cursor and accessibility fallbacks passed');
}finally{await browser.close()}
