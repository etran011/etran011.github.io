/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/responsive-images.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const [width,dpr,expected] of [[390,1,'640'],[390,2,'1280'],[1440,1,'640'],[1440,2,'1280']]) {
  const p=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  const requested=[];p.on('request',r=>requested.push(r.url()));
  await p.goto(base);
  const card=p.locator('article[aria-labelledby="project-platepredict"]');
  const img=card.locator('.gallery-stage img');await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
  assert((await img.evaluate(i=>i.currentSrc)).endsWith(`calorie-review-landing-${expected}.webp`));
  assert(!requested.some(u=>u.endsWith('/calorie-review-landing.webp')),'Full-resolution image is deferred until enlargement');
  const box=await card.locator('.gallery-stage').boundingBox();
  await card.locator('.gallery-stage').click();
  const enlarged=p.locator('dialog[open] img');await enlarged.evaluate(i=>i.decode());
  assert((await enlarged.evaluate(i=>i.currentSrc)).endsWith('/calorie-review-landing.webp'));
  assert.equal(await enlarged.evaluate(i=>i.naturalWidth),2940);
  await p.getByRole('button',{name:'Close screenshot viewer',exact:true}).click();
  const after=await card.locator('.gallery-stage').boundingBox();assert.equal(after.width,box.width);assert.equal(after.height,box.height);
  for(let i=0;i<2;i++){await card.getByRole('button',{name:'Next screenshot'}).click();await img.evaluate(i=>i.decode());assert(await img.evaluate(i=>i.naturalWidth>0));}
  console.log('Responsive preview and full-resolution viewer passed',width,'DPR',dpr);await p.close();
 }
}finally{await browser.close()}
