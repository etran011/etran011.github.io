import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { characterDelay, heroTypingBootstrap, heroHeadlineText, heroHeadlinePhrases } from '../src/lib/hero-typing.ts';
const run = ({ hash = '', reduced = false, navigation = 'navigate' } = {}) => {
  const dataset = {}, timers = [];
  vm.runInNewContext(heroTypingBootstrap, {
    document: {documentElement:{dataset}}, location:{hash}, matchMedia:()=>({matches:reduced}),
    performance:{getEntriesByType:()=>[{type:navigation}]}, setTimeout:(callback,delay)=>timers.push({callback,delay}),
  });
  return {dataset,timers};
};
test('typing bootstrap prepares home visits and releases hidden text without hydration',()=>{
  const state=run(); assert.equal(state.dataset.heroTyping,'waiting');
  assert.equal(state.timers[0].delay,8000); state.timers[0].callback(); assert.equal(state.dataset.heroTyping,undefined);
});
test('reduced motion, deep links and history restores get immediate full text',()=>{
  for(const options of [{reduced:true},{hash:'#projects'},{navigation:'back_forward'}]) assert.equal(run(options).dataset.heroTyping,undefined);
  assert.equal(run({hash:'#home'}).dataset.heroTyping,'waiting');
});
test('typing rhythm varies within requested intervals, pauses at punctuation and stays brief',()=>{
  let duration=420;
  Array.from(heroHeadlineText.replaceAll(' ','')).forEach((c,i)=>{
    const delay=characterDelay(c,i); duration+=delay;
    assert(delay>=40 && delay <= (/[,.!?]/.test(c)?200:65));
  });
  assert(duration>2000 && duration<3500);
  assert(characterDelay(',',4)>characterDelay('a',4)+100);
});

test('all original hero phrases retain their exact wording and order',()=>{
  assert.deepEqual(heroHeadlinePhrases.map(p=>p.lines.join(' ')),[
    'Building intelligent systems, one idea at a time.',
    'Building software.',
    'Exploring AI & machine learning.',
  ]);
});
