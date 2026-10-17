/* Optional: PLAYWRIGHT_MODULE=/path/to/playwright node tests/hero-typing.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {heroHeadlineText,heroHeadlinePhrases} from '../src/lib/hero-typing.ts';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
const read=p=>p.locator('.hero-headline').evaluate(e=>({phrase:e.dataset.phrase,phase:e.dataset.phase,mode:e.dataset.typing,count:e.querySelector('.hero-phrase[data-active]')?.querySelectorAll('[data-typed]').length??0,paused:e.hasAttribute('data-paused')}));
const hold=(p,index)=>p.waitForFunction(index=>{const e=document.querySelector('.hero-headline');return e.dataset.phrase===String(index)&&e.dataset.phase==='hold'},index);
const box=p=>p.locator('.hero-headline').boundingBox();
try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>document.documentElement.hasAttribute('data-intro'));
  assert.equal(await p.locator('.hero-character[data-typed]').count(),0,'No typing behind loader');
  assert.equal(await p.locator('.hero-headline .sr-only').textContent(),heroHeadlineText);
  assert.deepEqual(await p.locator('.hero-phrase').allTextContents(),heroHeadlinePhrases.map(v=>v.lines.join(' ')));
  await p.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='cycling'&&!document.documentElement.hasAttribute('data-intro'));
  await p.evaluate(()=>document.fonts.ready);const initial=await box(p);
  await p.waitForFunction(()=>document.querySelectorAll('.hero-phrase[data-active] [data-typed]').length>3);
  assert.equal(await p.locator('.hero-character[data-caret]').count(),1);
  await p.screenshot({path:'tmp/hero-loop-typing.png'});
  await p.mouse.wheel(0,150);await p.waitForTimeout(200);
  assert.equal((await read(p)).phrase,'0','Scroll must not select another phrase');
  await p.keyboard.press('Home');await p.waitForFunction(()=>scrollY<1);
  await hold(p,0);
  assert(Number(await p.locator('.hero-role').evaluate(e=>getComputedStyle(e).opacity))>=0);
  // An offscreen pause preserves the exact phrase, phase, character count and remaining timer.
  await p.keyboard.press('End');await p.waitForFunction(()=>document.querySelector('.hero-headline').hasAttribute('data-paused'));
  const away=await read(p);await p.waitForTimeout(500);assert.deepEqual(await read(p),away);
  await p.keyboard.press('Home');await p.waitForFunction(()=>scrollY<1&&!document.querySelector('.hero-headline').hasAttribute('data-paused'));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  const hidden=await read(p);await p.waitForTimeout(700);assert.deepEqual(await read(p),hidden);
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
  await p.waitForFunction(()=>{const e=document.querySelector('.hero-headline');return e.dataset.phase==='backspace'&&e.querySelector('.hero-phrase[data-active]').querySelectorAll('[data-typed]').length<42});
  const beforeDelete=await read(p);await p.waitForTimeout(120);assert((await read(p)).count<beforeDelete.count,'Backspacing visibly removes individual characters');
  await p.screenshot({path:'tmp/hero-loop-backspace.png'});
  for(const index of [1,2,0,1,2,0]) {
    await hold(p,index);
    const state=await read(p), expected=heroHeadlinePhrases[index].lines.join('').replaceAll(' ','').length;
    assert.equal(state.count,expected);
    const current=await box(p);
    assert(Math.abs(initial.height-current.height)<.1&&Math.abs(initial.width-current.width)<.1&&Math.abs(initial.y-current.y)<.5,'Every phrase must preserve hero dimensions');
    assert.equal(await p.locator('.hero-character[data-caret]').count(),1);
    await p.screenshot({path:`tmp/hero-loop-phrase-${index}.png`});
    console.log('Completed phrase in order:',index+1);
    await p.waitForFunction(index=>document.querySelector('.hero-headline').dataset.phase!=='hold'||document.querySelector('.hero-headline').dataset.phrase!==String(index),index);
  }
  assert(Number(await p.locator('.hero-role').evaluate(e=>getComputedStyle(e).opacity))>.99);
  assert.deepEqual(errors,[]);
  await p.reload({waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('.portfolio-intro').evaluate(e=>getComputedStyle(e).display),'none');
  await p.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='cycling');
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='static');
  assert.equal(await p.locator('.hero-phrase[data-initial] .hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);
  await p.close();
  for(const width of [320,390,768,1024]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('.hero-headline').dataset.typing==='cycling');
    const before=await box(page);
    for(const index of [0,1,2]) {
      await hold(page,index);const after=await box(page);
      assert(Math.abs(before.height-after.height)<.1&&Math.abs(before.width-after.width)<.1,`Stable multiline phrases at ${width}`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
      if(width===390)await page.screenshot({path:`tmp/hero-loop-mobile-${index}.png`});
      if(index<2)await page.waitForFunction(()=>document.querySelector('.hero-headline').dataset.phase!=='hold');
    }
    console.log('Responsive phrase cycle passed at',width);await page.close();
  }
  for(const options of [{reducedMotion:'reduce'},{forcedColors:'active'},{javaScriptEnabled:false}]) {
    const page=await browser.newPage({viewport:{width:390,height:900},...options});await page.goto(base,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.hero-phrase[data-initial] .hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);
    assert.equal(await page.locator('.hero-headline .sr-only').textContent(),heroHeadlineText);await page.close();
  }
  const blocked=await browser.newPage({viewport:{width:1440,height:1000}});
  await blocked.route('**/_next/static/**/*.js',r=>r.abort());await blocked.goto(base,{waitUntil:'domcontentloaded'});
  await blocked.waitForFunction(()=>!document.documentElement.hasAttribute('data-hero-typing')&&!document.documentElement.hasAttribute('data-intro'));
  assert.equal(await blocked.locator('.hero-phrase[data-initial] .hero-character').evaluateAll(cs=>cs.filter(c=>getComputedStyle(c).visibility!=='visible').length),0);await blocked.close();
  console.log('Two complete loops, exact phrases/order, visible deletion/caret, scroll independence, offscreen/tab pause-resume, stable 320–1440px layouts, loader and static fallbacks passed.');
}finally{await browser.close();}
