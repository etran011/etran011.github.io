/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/layout-consistency.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
const close=(a,b,label)=>assert(Math.abs(a-b)<1,`${label}: ${a} versus ${b}`);
try {
  for(const width of [320,390,768,1024,1280,1440,1920]) {
    const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await p.goto(base);await p.evaluate(()=>document.fonts.ready);
    const contact=await p.locator('.contact-intro,.contact-resources').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{top:r.top,bottom:r.bottom,height:r.height,padding:s.padding}}));
    assert.equal(contact[0].padding,contact[1].padding,'Contact padding matches');
    if(width>=768){
      close(contact[0].top,contact[1].top,'Contact top edges');
      close(contact[0].bottom,contact[1].bottom,'Contact bottom edges');
      const links=await p.locator('.contact-resource').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().height));
      close(links[0],links[1],'Social link rows');
    }else assert(Math.abs(contact[0].height-contact[1].height)>20,'Stacked mobile cards retain their natural heights');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.addStyleTag({content:'html{font-size:200%}'});
    await p.evaluate(()=>document.fonts.ready);
    const email=await p.locator('.contact-email').boundingBox();
    assert(email.x>=0&&email.x+email.width<=width+1,'Enlarged email and icons remain within viewport');
    for(const icon of await p.locator('.contact-email svg').all()) {const b=await icon.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);}
    console.log('Contact row alignment, matching padding, natural mobile heights and enlarged email passed',width);
    await p.close();
  }
}finally{await browser.close()}
