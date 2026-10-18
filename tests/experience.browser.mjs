/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/experience.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {experience} from '../src/data/background.ts';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    sessionStorage.setItem('portfolio:intro:v1','seen');window.careerEntrances=0;
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(...args){if(this.closest('.experience-entry'))window.careerEntrances++;return animate.apply(this,args)};
  });
  await page.goto(base);
  await page.waitForFunction(()=>document.documentElement.dataset.weightedScroll==='true');
  const travel=async index=>{
    await page.locator('.experience-entry').nth(index).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-240,behavior:'instant'}));
    await page.waitForTimeout(200);
    await page.waitForFunction(()=>document.querySelector('.experience-list').dataset.timelineActive==='true');
  };
  const progress=()=>page.locator('.experience-list').evaluate(e=>Number(e.style.getPropertyValue('--timeline-progress')));
  await travel(0);await page.waitForTimeout(800);const firstProgress=await progress();
  assert.equal(await page.locator('.experience-entry').first().getAttribute('data-timeline-state'),'current');
  await page.locator('.experience-entry h3').first().hover();
  await page.waitForTimeout(280);
  assert.equal(await page.locator('.custom-cursor').getAttribute('data-mode'),'default','Timeline copy never impersonates a link');
  assert.equal(await page.locator('.experience-entry').first().evaluate(e=>getComputedStyle(e).cursor),'none');
  await travel(3);await page.waitForTimeout(900);
  assert(await progress()>firstProgress+.4,'Rail illumination follows section travel');
  assert.equal(await page.locator('.experience-entry[data-timeline-state="completed"]').count(),3);
  assert.equal(await page.locator('.experience-entry').last().getAttribute('data-timeline-state'),'current');
  assert(Number(await page.locator('.ambient-canvas').evaluate(e=>getComputedStyle(e).opacity))>=.46,'Persistent mathematical background stays visible');
  const entrances=await page.evaluate(()=>window.careerEntrances);
  await travel(0);await page.waitForTimeout(700);
  assert(await progress()<firstProgress+.01,'Reverse scrolling returns the rail to its document position');
  assert.equal(await page.locator('.experience-entry').first().getAttribute('data-timeline-state'),'current');
  assert.equal(await page.evaluate(()=>window.careerEntrances),entrances,'Content entrances never replay');
  assert.equal(await page.locator('.experience-entry').first().evaluate(e=>getComputedStyle(e.querySelector('article')).opacity),'1');
  // A preceding layout change must refresh document-space rail measurements.
  const shifted=await page.addStyleTag({content:'html,body{overflow-anchor:none}.project-section{padding-top:180px!important}'});
  await page.waitForTimeout(200);
  const expected=await page.locator('.experience-list').evaluate(e=>{
    const rect=e.getBoundingClientRect(),rail=getComputedStyle(e,'::before');
    return Math.max(0,Math.min(1,(innerHeight*.55-rect.top-parseFloat(rail.top))/(rect.height-parseFloat(rail.top)-parseFloat(rail.bottom))));
  });
  assert(Math.abs(await progress()-expected)<.001,'Rail follows reflow of preceding sections');
  await shifted.evaluate(e=>e.remove());await page.waitForTimeout(200);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.locator('.experience-list').getAttribute('data-timeline-active'),'false');
  assert.equal(await page.locator('.experience-milestone').first().evaluate(e=>getComputedStyle(e,'::after').animationPlayState),'paused');
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.experience-list').dataset.timelineActive==='false');
  assert.equal(await page.locator('.experience-list').getAttribute('data-timeline-active'),'false');
  assert.equal(await page.locator('.experience-list').evaluate(e=>getComputedStyle(e,'::after').display),'none');
  await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'active'});
  await page.waitForFunction(()=>document.querySelector('.experience-list').dataset.timelineActive==='false');
  assert.equal(await page.locator('.experience-list').getAttribute('data-timeline-active'),'false');
  assert.deepEqual(errors,[]);await page.close();
  console.log('Scroll/reverse illumination, milestone states, no replay, noninteractive cursor, hidden/reduced/forced fallbacks passed.');
  for(const width of [320,390,768,1024,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.goto(base+'/#experience');await page.evaluate(()=>document.fonts.ready);
    const railStart=()=>page.locator('.experience-list').evaluate(e=>{
      const marker=e.querySelector('.experience-milestone').getBoundingClientRect();
      return Math.abs(marker.top+marker.height/2-e.getBoundingClientRect().top-parseFloat(getComputedStyle(e,'::before').top));
    });
    assert(await railStart()<.6,'Rail starts at milestone center');
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
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert(await railStart()<.6,'Enlarged-text rail starts at milestone center');
    const clipped=await page.locator('#experience').evaluate(root=>[root,...root.querySelectorAll('.experience-list,.experience-entry,.experience-date,article,h3,.experience-tags li,.experience-highlights li')].filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5}).map(e=>e.className||e.tagName));
    assert.deepEqual(clipped,[],`Experience fits 200% text at ${width}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Entire page fits 200% text at ${width}`);
    await page.close();console.log('Accurate career content, aligned axis, responsive dates and enlarged text passed',width);
  }
  const noJS=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
  await noJS.goto(base+'/#experience');assert.equal(await noJS.locator('.experience-entry h3:visible').count(),4);await noJS.close();
}finally{await browser.close()}
