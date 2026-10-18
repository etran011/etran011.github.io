/* Requires next dev on port 3001 (or pass its URL).
 * PLAYWRIGHT_MODULE=/path/to/playwright node tests/dev-origin.browser.mjs [devURL]
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=new URL(process.argv[2]||'http://127.0.0.1:3001/');
try {
  for(const hostname of ['127.0.0.1','localhost']) {
    const url=new URL('/',base);url.hostname=hostname;
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    const errors=[],socketErrors=[],connections=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
    page.on('websocket',socket=>{
      socket.on('socketerror',error=>socketErrors.push(error));
      socket.on('framereceived',frame=>{if(String(frame.payload).includes('turbopack-connected'))connections.push(socket.url())});
    });
    await page.addInitScript(()=>sessionStorage.setItem('portfolio:intro:v1','seen'));
    await page.goto(url.href);
    await page.waitForFunction(()=>document.querySelector('.ambient-background')?.dataset.renderer==='webgl',{}, {timeout:15000});
    await page.waitForFunction(()=>document.querySelector('.hero-headline')?.dataset.typing==='cycling');
    assert(connections.some(connection=>new URL(connection).hostname===hostname),'Development runtime must connect before hydration');
    const clock=()=>page.locator('.ambient-canvas').evaluate(canvas=>{
      const gl=canvas.getContext('webgl'),program=gl.getParameter(gl.CURRENT_PROGRAM);
      // Read the actual running shader clock, not a DOM placeholder.
      return gl.getUniform(program,gl.getUniformLocation(program,'uTime'));
    });
    const before=await clock();await page.waitForTimeout(600);
    assert(await clock()>before+.2,'The mathematical idle renderer keeps advancing');
    assert.deepEqual(socketErrors,[],'No rejected development handshake');
    assert.deepEqual(errors,[],'No hydration/runtime/console errors');
    console.log('Development handshake, hydration, terminal cycle and WebGL idle clock passed',url.origin);
    await page.close();
  }
}finally{await browser.close()}
