/* Set PLAYWRIGHT_MODULE and AXE_MODULE to installed Playwright and axe-core modules. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const axe=require.resolve(process.env.AXE_MODULE||'axe-core/axe.min.js');
const base=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  for(const width of [320,390,768,1440]){
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.goto(base);await page.evaluate(()=>document.fonts.ready);
    await page.addScriptTag({path:axe});
    const findings=await page.evaluate(async()=>{const r=await axe.run(document);return r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
    assert.deepEqual(findings,[],`Accessibility audit at ${width}px`);
    await page.addStyleTag({content:'html{font-size:200%}'});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`200% text fits ${width}px`);
    assert.equal(await page.locator('[data-pinned]').count(),0);
    console.log('Axe and 200% text passed',width);await page.close();
  }
  for(const options of [{javaScriptEnabled:false},{forcedColors:'active'},{hasTouch:true,isMobile:true}]){
    const page=await browser.newPage({viewport:{width:390,height:844},...options});
    await page.goto(base+'/#about');
    assert(await page.locator('#about-background-heading').isVisible());
    assert(await page.locator('#about-building-heading').isVisible());
    assert.equal(await page.locator('.technology-button').count(),19);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(!options.forcedColors) assert(Number(await page.locator('.ambient-formation').evaluate(e=>getComputedStyle(e).opacity))>0);
    console.log('Readable continuous fallback passed',options);await page.close();
  }
}finally{await browser.close()}
