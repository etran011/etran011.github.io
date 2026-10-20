/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/header-navigation.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:3001';
try {
 for(const width of [1440,1024,768,390,320]) {
  const p=await browser.newPage({viewport:{width,height:900}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
  await p.goto(base);const header=p.locator('.site-header');
  assert.equal(await header.locator('.brand,.brand-mark').count(),0);
  assert.equal(await header.locator('.nav-name').textContent(),'Erik Tran');
  await p.waitForFunction(()=>getComputedStyle(document.querySelector('.site-header')).opacity==='0');
  await p.evaluate(()=>scrollTo(0,450));
  await p.waitForFunction(()=>document.querySelector('.site-header').dataset.navVisible==='true');
  await p.waitForTimeout(350);
  const nav=width>=1024?p.locator('.desktop-nav'):p.locator('#mobile-navigation');
  for(const id of ['about','projects','experience','skills','education','contact','home']) {
   if(width<1024)await p.getByRole('button',{name:'Open menu',exact:true}).click();
   await nav.locator(`a[href="/#${id}"]`).click();
   assert.equal(new URL(p.url()).hash,'#'+id);
   if(id!=='home')assert(await p.locator('#'+id).evaluate(e=>e.getBoundingClientRect().top)>=100);
  }
  await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
  await p.waitForFunction(()=>getComputedStyle(document.querySelector('.site-header')).opacity==='0');
  await p.evaluate(()=>scrollTo(0,450));await p.waitForTimeout(400);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const name=await header.locator('.nav-name').boundingBox(),bar=await header.locator('.nav-bar').boundingBox();
  assert(name.x-bar.x<25,'No reserved logo gap');
  assert.equal(await p.locator('link[rel="icon"]').count()>0,true);
  await p.screenshot({path:`tmp/header-without-logo-${width}.png`});
  assert.deepEqual(errors,[]);await p.close();console.log('Header links, alignment and scroll visibility passed',width);
 }
}finally{await browser.close()}
