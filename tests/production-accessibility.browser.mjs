/* PLAYWRIGHT_MODULE=/path/to/playwright AXE_MODULE=/path/to/axe.min.js node tests/production-accessibility.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const axe=require.resolve(process.env.AXE_MODULE||'axe-core/axe.min.js');
const base=process.argv[2]||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [320,390,768,1440])for(const path of ['/','/projects/optionlab/','/projects/platepredict/','/404.html']) {
  const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await p.goto(base+path);await p.evaluate(()=>document.fonts.ready);await p.addScriptTag({path:axe});
  const audit=()=>p.evaluate(async()=>{const r=await axe.run(document);return r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
  assert.deepEqual(await audit(),[],`${path} at ${width}px`);
  await p.getByRole('link',{name:'Skip to content'}).focus();await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'main-content');
  if(path.includes('/projects/')) {
   await p.locator('.gallery-stage').click();assert.deepEqual(await audit(),[],'Open screenshot dialog');
   await p.keyboard.press('Escape');assert(await p.locator('.gallery-stage').evaluate(e=>e===document.activeElement));
   for(let index=0;index<3;index++){
    const img=p.locator('.gallery-stage img');
    await img.evaluate(i=>i.decode());
    assert(await img.evaluate(i=>i.naturalWidth>0),'Gallery image loads from the static export');
    await p.getByRole('button',{name:'Next screenshot',exact:true}).click();
   }
  }
  await p.addStyleTag({content:'html{font-size:200%}'});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text does not overflow');
  if(path==='/404.html'){await p.getByRole('link',{name:'Return to portfolio'}).click();await p.locator('#hero-heading').waitFor();}
  await p.close();console.log('Axe, keyboard and text resize passed',width,path);
 }
}finally{await browser.close()}
