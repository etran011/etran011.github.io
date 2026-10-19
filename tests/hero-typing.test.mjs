import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { characterDelay, heroTypingBootstrap, heroHeadlinePhrases, createHeroTypingCycle, backspaceDelay } from '../src/lib/hero-typing.ts';
const run = ({ pathname = '/', hash = '', reduced = false, navigation = 'navigate' } = {}) => {
  const dataset = {}, timers = [];
  vm.runInNewContext(heroTypingBootstrap, {
    document: {documentElement:{dataset}}, location:{pathname,hash}, matchMedia:()=>({matches:reduced}),
    performance:{getEntriesByType:()=>[{type:navigation}]}, setTimeout:(callback,delay)=>timers.push({callback,delay}),
  });
  return {dataset,timers};
};
test('typing bootstrap prepares home visits and releases hidden text without hydration',()=>{
  const state=run(); assert.equal(state.dataset.heroTyping,'waiting');
  assert.equal(state.timers[0].delay,8000); state.timers[0].callback(); assert.equal(state.dataset.heroTyping,undefined);
});
test('reduced motion, deep links and history restores get immediate full text',()=>{
  for(const options of [{pathname:'/projects/optionlab/'},{pathname:'/projects/platepredict/'},{reduced:true},{hash:'#projects'},{navigation:'back_forward'}]) assert.equal(run(options).dataset.heroTyping,undefined);
  assert.equal(run({hash:'#home'}).dataset.heroTyping,'waiting');
});
test('typing is slower than backspacing, with natural timing and punctuation pauses',()=>{
  heroHeadlinePhrases.forEach(phrase=>{
    let duration=420;
    Array.from(phrase.lines.join(' ')).forEach((c,i)=>{
      const delay=characterDelay(c,i); duration+=delay;
      assert(delay >= (c===' '?20:35) && delay <= (c===' '?30:/[,.!?]/.test(c)?165:65));
      assert(backspaceDelay(i)>=20 && backspaceDelay(i)<=35);
    });
    assert(duration>1000 && duration<4000);
  });
  assert(characterDelay(',',4)>characterDelay('a',4)+90);
});

test('remaining hero phrases retain their exact wording and order',()=>{
  assert.deepEqual(heroHeadlinePhrases.map(p=>p.lines.join(' ')),[
    'Building intelligent systems, one idea at a time.',
    'Exploring AI & machine learning.',
  ]);
});

test('cycle types and deletes one character at a time, holding and looping in original order',()=>{
  const cycle=createHeroTypingCycle(), holds=[];
  for(let i=0;i<1000 && holds.length<7;i++){
    const before={...cycle.state}, after=cycle.advance();
    if(before.phase==='typing')assert.equal(after.count,before.count+1);
    if(before.phase==='backspace')assert.equal(after.count,before.count-1);
    if(after.phrase!==before.phrase){assert.equal(before.count,0);assert.equal(after.count,0);assert.equal(before.phase,'gap');}
    if(after.phase==='hold'){holds.push(after.phrase);assert(after.delay>=1800&&after.delay<=2500);}
    if(after.phase==='gap')assert(after.delay>=300&&after.delay<=500);
    assert(after.count>=0);
  }
  assert.deepEqual(holds,[0,1,0,1,0,1,0]);
});
