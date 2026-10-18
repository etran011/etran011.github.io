/* PLAYWRIGHT_MODULE=/path/to/playwright node tests/about-readability.browser.mjs [baseURL] */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.argv[2]||'http://127.0.0.1:4173';
try {
  for(const width of [320,390,768,1440,1920]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.goto(base+'/#about');await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('#about .content-island').count(),1,'One unified introduction');
    assert.equal(await page.locator('.about-copy > p').count(),2,'Only two concise paragraphs');
    assert.doesNotMatch(await page.locator('#about').textContent(),/about\.md|Markdown|GPA|2028|OptionLab|PlatePredict/);
    const results=await page.locator('#about .content-island').evaluateAll(islands=>{
      const ctx=document.createElement('canvas').getContext('2d');
      const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((n,i)=>i===3?n/255:n)};
      const over=(front,back)=>front.slice(0,3).map((n,i)=>n*front[3]+back[i]*(1-front[3]));
      const luminance=rgb=>rgb.map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
      return islands.flatMap(island=>{
        // Even a fully white backdrop must not wash out island text.
        const background=over(rgba(getComputedStyle(island).backgroundColor),[255,255,255]);
        return [...island.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())).map(e=>{
          const s=getComputedStyle(e),ink=over(rgba(s.color),background),a=luminance(ink),b=luminance(background);
          return {text:e.textContent.trim().slice(0,50),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),font:parseFloat(s.fontSize),opacity:Number(s.opacity)};
        });
      });
    });
    assert(results.length>5,'Contrast audit covers the actual text');
    for(const result of results) {assert(result.ratio>=4.5,`AA text contrast: ${JSON.stringify(result)}`);assert.equal(result.opacity,1,'Text does not wait for animation');}
    for(const paragraph of await page.locator('.about-copy > p').all()) {
      assert(await paragraph.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16),'Body text stays comfortably sized');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log('About text contrast over worst-case backdrop, body size and responsive bounds passed',width);
    await page.close();
  }
}finally{await browser.close()}
