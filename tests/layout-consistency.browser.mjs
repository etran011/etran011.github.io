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
    assert.equal(await p.locator('#about .content-island').count(),1,'About has one unified composition');
    const glyphs=await p.locator('.technology-glyph').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height}}));
    assert.equal(glyphs.length,19,'All Tools icons remain present');
    for(const glyph of glyphs) {
      close(glyph.width,glyphs[0].width,'Consistent icon frame width');
      close(glyph.height,glyphs[0].height,'Consistent icon frame height');
    }
    for(const group of await p.locator('.stack-technologies').all()) {
      const buttons=await group.locator('.technology-button').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,height:r.height}}));
      for(const button of buttons) for(const peer of buttons.filter(b=>Math.abs(b.top-button.top)<1)) close(button.height,peer.height,'Matching Tools row heights');
    }
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.addStyleTag({content:'html{font-size:200%}'});
    await p.evaluate(()=>document.fonts.ready);
    const email=await p.locator('.contact-email').boundingBox();
    assert(email.x>=0&&email.x+email.width<=width+1,'Enlarged email and icons remain within viewport');
    for(const icon of await p.locator('.contact-email svg').all()) {const b=await icon.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);}
    console.log('Aligned Contact and unified About, natural mobile heights and enlarged email passed',width);
    await p.close();
  }
  // Direct anchors previously exposed intrinsic gallery overflow after images/fonts settled.
  for(const route of ['/#experience','/projects/optionlab/','/projects/platepredict/']) {
    for(const width of [320,768,1440]) {
      const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      await p.goto(base+route);await p.evaluate(()=>document.fonts.ready);
      await p.locator('.gallery-stage img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode()})));
      await p.addStyleTag({content:'html{font-size:200%}'});
      await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`200% text fits ${route} at ${width}`);
      for(const controls of await p.locator('.gallery-controls').all()) {
        assert(await controls.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Gallery controls do not overflow internally');
        for(const button of await controls.locator('button').all()) {
          const bounds=await button.evaluate(e=>{const r=e.getBoundingClientRect(),c=e.closest('.gallery-controls').getBoundingClientRect();return r.left>=c.left-1&&r.right<=c.right+1});
          assert(bounds,'Gallery buttons remain inside controls');
        }
      }
      const next=p.getByRole('button',{name:'Next screenshot',exact:true}).first();
      if(await next.count()) {
        const before=await p.locator('.gallery-stage img').first().getAttribute('src');
        await next.click();
        assert.notEqual(await p.locator('.gallery-stage img').first().getAttribute('src'),before,'Enlarged gallery remains operable');
      }
      console.log('Enlarged project content and usable gallery controls passed',route,width);
      await p.close();
    }
  }
}finally{await browser.close()}
