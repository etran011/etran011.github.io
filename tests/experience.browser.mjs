/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/experience.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {experience} from '../src/data/background.ts';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
try {
  for(const width of [320,390,768,1024,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.goto(base+'/#experience');await page.evaluate(()=>document.fonts.ready);
    const entries=page.locator('.experience-entry');
    assert.equal(await entries.count(),experience.length);
    assert.equal(await page.locator('#experience .content-island').count(),0);
    assert.equal(await page.locator('[data-pinned]').count(),0);
    for(let i=0;i<experience.length;i++) {
      const entry=entries.nth(i),item=experience[i];
      assert.equal(await entry.locator('h3').textContent(),item.role);
      assert.equal(await entry.locator('.experience-date').textContent(),item.period);
      assert.equal(await entry.locator('.experience-organization').textContent(),item.organization);
      assert.deepEqual(await entry.locator('.experience-highlights li').allTextContents(),[...item.highlights]);
      assert.deepEqual(await entry.locator('.experience-tags li').allTextContents(),[...item.tags]);
      const marker=await entry.locator('.experience-milestone').boundingBox();
      const axis=await page.locator('.experience-list').evaluate(e=>e.getBoundingClientRect().left+parseFloat(getComputedStyle(e,'::before').left)+.5);
      assert(Math.abs(marker.x+marker.width/2-axis)<.6,`Aligned milestone at ${width}`);
      const title=await entry.locator('h3').boundingBox(),date=await entry.locator('.experience-date').boundingBox();
      if(width>=768) assert(date.x+date.width<title.x,'Desktop dates stay to the left');
      else assert(date.y<title.y && Math.abs(date.x-title.x)<1,'Mobile dates join content column');
      assert.equal(await entry.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
    await page.addStyleTag({content:'html{font-size:200%}'});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`200% text fits ${width}`);
    await page.close();console.log('Accurate career content, aligned axis, responsive dates and enlarged text passed',width);
  }
  const noJS=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
  await noJS.goto(base+'/#experience');assert.equal(await noJS.locator('.experience-entry h3:visible').count(),4);await noJS.close();
}finally{await browser.close()}
