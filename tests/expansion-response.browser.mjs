/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/expansion-response.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
const read=p=>p.locator('.ambient-canvas').evaluate(c=>{
 const g=c.getContext('webgl'),program=g.getParameter(g.CURRENT_PROGRAM);
 const u=name=>g.getUniform(program,g.getUniformLocation(program,name));
 return {target:Number(document.querySelector('.ambient-background').style.getPropertyValue('--atmosphere-progress')),expansion:u('uExpansion'),shrink:u('uShrink'),rings:u('uRingOpacity'),time:u('uTime'),error:g.getError()};
});
try {
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
 await p.goto(base);await p.waitForFunction(()=>document.querySelector('.ambient-background').dataset.playing==='true');
 await p.screenshot({path:'tmp/expansion-resting.png'});
 for(const y of [80,200]) {
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
  await p.waitForTimeout(100);const early=await read(p);
  assert(early.expansion>early.target*.5,'Expansion begins promptly on small scrolls');
  await p.waitForTimeout(200);const settled=await read(p);
  assert(Math.abs(settled.expansion-settled.target)<.015,'No prolonged trailing after input stops');
  const eased=settled.expansion**2*(3-2*settled.expansion);
  assert(Math.abs(settled.shrink-eased)<.00001,'Particle shrink uses the shared progress');
  assert(Math.abs(settled.rings-(1+eased*.12))<.00001,'Rings stay synchronized');
  assert(settled.time>early.time,'Idle clock continues while scrolling');assert.equal(settled.error,0);
  console.log('Responsive expansion at',y,'px:',early.expansion,'after 100ms; target',early.target);
 }
 await p.screenshot({path:'tmp/expansion-early-scroll.png'});
 const before=await read(p);
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(100);
 assert((await read(p)).expansion<before.expansion*.5,'Reverse direction responds promptly');
 await p.waitForTimeout(200);assert((await read(p)).expansion<.015);
 await p.evaluate(()=>scrollTo({top:2000,behavior:'instant'}));await p.waitForTimeout(700);
 assert((await read(p)).expansion>.99);await p.screenshot({path:'tmp/expansion-full-scroll.png'});
 await p.mouse.wheel(0,120);await p.waitForTimeout(150);
 assert(Math.abs(await p.evaluate(()=>scrollY)-2120)<2,'Wheel travel stays native');
 await p.waitForTimeout(200);assert.equal(await p.locator('.ambient-background').getAttribute('data-playing'),'true');
 assert.deepEqual(errors,[]);await p.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(base);await mobile.waitForFunction(()=>!document.documentElement.hasAttribute('data-intro'));
 for(const y of [0,500,1500,0]){await mobile.evaluate(y=>scrollTo(0,y),y);await mobile.waitForTimeout(100);assert.equal(await mobile.locator('.ambient-background').getAttribute('data-renderer'),'static');assert(await mobile.locator('.ambient-formation img').evaluate(i=>i.complete&&i.naturalWidth>0));}
 assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.close();
 console.log('Reverse response, synchronized shrink/rings, idle motion, native wheel input and existing mobile fallback passed');
}finally{await browser.close()}
