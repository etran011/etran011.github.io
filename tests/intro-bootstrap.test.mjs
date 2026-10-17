import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { introBootstrap } from '../src/lib/intro-bootstrap.ts';

function run({ pathname = '/', hash = '', reduced = false, seen = false, storageBlocked = false, navigation = 'navigate' } = {}) {
  const dataset = {};
  const timers = [];
  const storage = new Map(seen ? [['portfolio:intro:v1', 'seen']] : []);
  vm.runInNewContext(introBootstrap, {
    document: { documentElement: { dataset } }, location: { pathname, hash },
    matchMedia: () => ({ matches: reduced }),
    performance: { now: () => 10, getEntriesByType: () => [{ type: navigation }] },
    sessionStorage: {
      getItem: key => { if (storageBlocked) throw new Error('Storage unavailable'); return storage.get(key); },
      setItem: (key, value) => { if (storageBlocked) throw new Error('Storage unavailable'); storage.set(key, value); },
    },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  });
  return { dataset, timers, storage };
}

test('first-session intro is eligible before body parsing and marks the session', () => {
  const state = run();
  assert.equal(state.dataset.intro, 'loading');
  assert.equal(state.storage.get('portfolio:intro:v1'), 'seen');
});
test('return visits, deep links, case studies, history restoration and reduced motion skip the intro', () => {
  for (const options of [{ seen: true }, { hash: '#projects' }, { pathname: '/projects/optionlab/' }, { navigation: 'back_forward' }, { reduced: true }]) {
    assert.equal(run(options).dataset.intro, undefined);
  }
  assert.equal(run({ hash: '#home' }).dataset.intro, 'loading');
});
test('blocked storage never prevents the portfolio from reaching its watchdog', () => {
  const state = run({ storageBlocked: true });
  assert.equal(state.dataset.intro, 'loading');
  assert.equal(state.timers.length, 1);
});
test('independent watchdog removes the interaction lock when client initialization never runs', () => {
  const state = run();
  assert(state.timers[0].delay <= 3000);
  state.timers[0].callback();
  assert.equal(state.dataset.intro, undefined);
  assert.equal(state.dataset.introStart, undefined);
});
