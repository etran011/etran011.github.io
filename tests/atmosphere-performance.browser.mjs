/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/atmosphere-performance.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await page.addInitScript(()=>{
    sessionStorage.setItem('portfolio:intro:v1','seen');
    Object.defineProperty(navigator,'hardwareConcurrency',{value:8});
    window.renderFrames=0;window.renderDraws=0;
    const clear=WebGLRenderingContext.prototype.clear,draw=WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.clear=function(...args){window.renderFrames++;return clear.apply(this,args)};
    WebGLRenderingContext.prototype.drawArrays=function(...args){window.renderDraws++;return draw.apply(this,args)};
  });
  await page.goto(process.argv[2]||'http://127.0.0.1:4173');
  await page.waitForFunction(()=>document.querySelector('.ambient-background').dataset.renderer==='webgl');
  const sample=()=>page.evaluate(()=>new Promise(resolve=>{
    const intervals=[];let first=0,last=0;
    const frames=window.renderFrames,draws=window.renderDraws;
    const tick=t=>{
      if(!first)first=t;if(last)intervals.push(t-last);last=t;
      if(intervals.length<120)requestAnimationFrame(tick);
      else{const sorted=[...intervals].sort((a,b)=>a-b);resolve({medianMs:sorted[60],p95Ms:sorted[114],modelFPS:(window.renderFrames-frames)/((last-first)/1000),drawsPerFrame:(window.renderDraws-draws)/(window.renderFrames-frames),quality:document.querySelector('.ambient-background').dataset.quality});}
    };requestAnimationFrame(tick);
  }));
  for(const id of ['home','contact']){
    await page.locator('#'+id).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'}));
    await page.waitForTimeout(1500);
    const result=await sample();
    assert(result.drawsPerFrame>=3 && result.drawsPerFrame<=5.1,'Complete structure stays within five draw calls');
    assert(result.p95Ms<50,'Capable desktop maintains a bounded frame budget');
    assert(result.modelFPS>35,'Capable desktop stays above low-quality fallback cadence');
    console.log(id,result);
  }
  await page.setViewportSize({width:2560,height:1440});
  await page.waitForTimeout(200);
  const pixels=await page.locator('.ambient-canvas').evaluate(c=>c.width*c.height);
  assert(pixels<=2402000);
  console.log('Persistent scene retains 2.4-megapixel cap:',pixels);
}finally{await browser.close()}
