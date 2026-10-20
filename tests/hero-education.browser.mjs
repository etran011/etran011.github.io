/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/hero-education.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:4174';
try {
 for(const width of [390,1440])for(const fresh of [true,false]){
  const p=await browser.newPage({viewport:{width,height:900}});
  await p.addInitScript(fresh=>{
   if(!fresh)sessionStorage.setItem('portfolio:intro:v1','seen');
   window.educationFrames=[];
   const sample=()=>{
    const e=document.querySelector('.hero-role');
    if(e){const s=getComputedStyle(e);if(s.visibility==='visible'){
     const r=e.getBoundingClientRect();let opacity=1,filters=[];
     for(let a=e;a;a=a.parentElement){const c=getComputedStyle(a);opacity*=Number(c.opacity);filters.push(c.filter)}
     window.educationFrames.push({opacity,filters,animation:s.animationName,transform:s.transform,x:r.x,y:r.y,width:r.width,height:r.height,phase:document.querySelector('.hero-headline')?.dataset.phase});
    }}
    if(!window.stopEducationFrames)requestAnimationFrame(sample);
   };requestAnimationFrame(sample);
  },fresh);
  await p.goto(base);await p.waitForFunction(()=>window.educationFrames.length>0);
  await p.waitForFunction(()=>document.querySelector('.hero-headline').dataset.phase==='hold');
  await p.waitForFunction(()=>document.querySelector('.hero-headline').dataset.phase==='backspace');
  const frames=await p.evaluate(()=>{window.stopEducationFrames=true;return window.educationFrames});
  assert(frames.length>10);
  for(const f of frames){assert.equal(f.opacity,1);assert(f.filters.every(v=>v==='none'||v==='opacity(1)'));assert.equal(f.animation,'none');assert.equal(f.transform,'none');}
  const first=frames[0];assert(frames.every(f=>Math.abs(f.y-first.y)<.5&&Math.abs(f.height-first.height)<.5),'No education layout shift');
  assert.equal(await p.locator('.hero-role').textContent(),'William & Mary · Data Science · Class of 2028');
  await p.close();console.log('Immediate static education through typing/backspacing:',width,fresh?'fresh intro':'return visit');
 }
 for(const options of [{javaScriptEnabled:false},{reducedMotion:'reduce'}]){
  const p=await browser.newPage({viewport:{width:390,height:900},...options});await p.goto(base);
  const s=await p.locator('.hero-role').evaluate(e=>{const c=getComputedStyle(e);return {opacity:c.opacity,visibility:c.visibility,animation:c.animationName}});
  assert.deepEqual(s,{opacity:'1',visibility:'visible',animation:'none'});await p.close();
 }
 console.log('No-JavaScript and reduced-motion education visibility passed');
}finally{await browser.close()}
