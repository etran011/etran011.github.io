/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/project-navigation.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
    await page.goto(base);
    const cta=page.getByRole('link',{name:'See what I’m building'});
    await cta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('#experience .section-heading > p').textContent(),'From campus support to data analysis, my work connects technical detail with clear communication.');
    const repo=page.getByRole('link',{name:/View Repo/});
    assert.equal(await repo.getAttribute('href'),'https://github.com/etran011/platepredict');
    assert.equal(await repo.getAttribute('target'),'_blank');
    assert.equal(await repo.getAttribute('rel'),'noopener noreferrer');
    for(const fromTop of [false,true]) {
      if(fromTop) await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      else await cta.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      await cta.evaluate(a=>a.focus({preventScroll:true}));
      const start=await page.evaluate(()=>scrollY);
      await page.evaluate(()=>{window.scrollSamples=[];window.sampleScroll=()=>window.scrollSamples.push({y:scrollY,t:performance.now()});addEventListener('scroll',window.sampleScroll,{passive:true})});
      if(fromTop) await cta.evaluate(a=>a.click());else await cta.click();
      await page.waitForFunction(()=>document.activeElement.id==='projects');
      const data=await page.evaluate(()=>{removeEventListener('scroll',window.sampleScroll);const heading=document.getElementById('projects-heading').getBoundingClientRect();return {y:scrollY,samples:window.scrollSamples,heading:heading.top,nav:document.querySelector('.site-header').getBoundingClientRect().bottom,behavior:getComputedStyle(document.documentElement).scrollBehavior}});
      assert(data.samples.length>5,'Scroll progresses over multiple frames');
      assert(data.samples.some(s=>s.y>start+5&&s.y<data.y-5),'Intermediate positions, not a jump');
      assert(data.samples.every(s=>s.y<=data.y+1),'No overshoot');
      assert(data.heading>=data.nav,'Heading clears fixed navigation');
      assert.equal(data.behavior,'auto','No global smooth/weighted scrolling');
      assert.equal(new URL(page.url()).hash,'#projects');
      if(width===1440) assert.equal(await page.locator('.ambient-background').getAttribute('data-playing'),'true');
      console.log('Native smooth CTA passed',width,'distance',Math.round(data.y-start),'duration',Math.round(data.samples.at(-1).t-data.samples[0].t));
      await page.goBack();
    }
    // Wheel input cancels the CTA's animation without canceling the wheel itself.
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
    await cta.evaluate(a=>a.click());await page.waitForTimeout(120);
    await page.mouse.wheel(0,-100);await page.waitForTimeout(150);
    const interrupted=await page.evaluate(()=>scrollY);await page.waitForTimeout(800);
    assert(Math.abs(await page.evaluate(()=>scrollY)-interrupted)<2,'Interrupted animation stays stopped');
    assert(await page.locator('#projects').evaluate(e=>e.getBoundingClientRect().top)>200);
    await page.mouse.wheel(0,100);await page.waitForTimeout(150);
    assert(await page.evaluate(()=>scrollY)>interrupted,'Normal wheel input remains usable');
    await page.emulateMedia({reducedMotion:'reduce'});
    await cta.scrollIntoViewIfNeeded();await cta.click();
    assert(await page.locator('#projects-heading').isVisible());
    assert(Math.abs(await page.locator('#projects').evaluate(e=>e.getBoundingClientRect().top)-112)<3,'Reduced motion reaches anchor immediately');
    await page.locator('.case-link[href="/projects/platepredict/"]').click();
    const detailRepo=page.getByRole('link',{name:'View Repo',exact:true});
    assert.equal(await detailRepo.getAttribute('target'),'_blank');
    assert.equal(await detailRepo.getAttribute('href'),'https://github.com/etran011/platepredict');
    await page.getByRole('link',{name:'All projects',exact:true}).click();
    await page.locator('#projects-heading').waitFor();
    assert.deepEqual(errors,[]);
    await page.close();
  }
  const fallback=await browser.newPage({javaScriptEnabled:false});
  await fallback.goto(base);await fallback.getByRole('link',{name:'See what I’m building'}).click();
  assert.equal(new URL(fallback.url()).hash,'#projects');await fallback.close();
  console.log('Repository links, exact restored copy, interruption, reduced motion, navigation and no-JS fallback passed');
} finally {await browser.close()}
