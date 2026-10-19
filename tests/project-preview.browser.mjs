/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/project-preview.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4174';
try {
  for(const [width,height] of [[320,900],[390,900],[768,1000],[1024,800],[1440,1000],[1920,1000]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.goto(base);await page.evaluate(()=>document.fonts.ready);
    const frames=page.locator('.project-card .gallery-stage');
    assert.equal(await frames.count(),2);
    const metrics=await frames.evaluateAll(nodes=>nodes.map(node=>{
      const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
      const figure=node.closest('figure'),image=node.querySelector('img');
      return {width:rect.width,height:rect.height,radius:style.borderRadius,border:style.border,padding:getComputedStyle(figure).padding,fit:getComputedStyle(image).objectFit,position:getComputedStyle(image).objectPosition};
    }));
    assert.deepEqual(metrics[1],metrics[0],'Both project previews share exact dimensions and framing');
    assert.equal(metrics[0].fit,'contain','Full images retain their proportions');
    for(const frame of await frames.all()) {
      await frame.scrollIntoViewIfNeeded();
      await frame.locator('img').evaluate(image=>image.decode());
      assert(await frame.locator('img').evaluate(image=>image.naturalWidth>0),'Screenshot loads');
      await frame.click();await page.getByRole('dialog').waitFor();
      await page.getByRole('button',{name:'Close screenshot viewer',exact:true}).click();
      assert(await frame.evaluate(node=>document.activeElement===node),'Viewer restores focus');
    }
    await page.emulateMedia({reducedMotion:'no-preference'});
    for(const frame of await frames.all()) {
      await frame.hover();await page.waitForTimeout(400);
      assert.equal(await frame.locator('img').evaluate(image=>getComputedStyle(image).scale),'1.015','Shared hover animation remains');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
    console.log('Matching preview dimensions, framing, viewer and hover passed',width,height);
    await page.close();
  }
}finally{await browser.close()}
