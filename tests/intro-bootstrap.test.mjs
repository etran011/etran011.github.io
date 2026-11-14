import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { introBootstrap } from '../src/lib/intro-bootstrap.ts';

function run({ pathname = '/', hash = '', reduced = false, seen = false, storageBlocked = false, navigation = 'navigate', brokenAnimation = false } = {}) {
  const dataset = {}, frames = new Map(), listeners = new Map();
  let serial = 0;
  const storage = new Map(seen ? [['portfolio:intro:v1', 'seen']] : []);
  const events = {
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
  };
  const screen = { dataset: {}, querySelector: () => ({}), getAnimations: () => {
    if (brokenAnimation) throw new Error('Animation unavailable');
    return [];
  } };
  const document = { ...events, documentElement: { dataset }, readyState: 'loading', hidden: false, querySelector: () => screen };
  vm.runInNewContext(introBootstrap, {
    document, window: events, location: { pathname, hash },
    matchMedia: () => ({ ...events, matches: reduced }),
    performance: { now: () => 10, getEntriesByType: () => [{ type: navigation }] },
    sessionStorage: {
      getItem: key => { if (storageBlocked) throw new Error('Storage unavailable'); return storage.get(key); },
      setItem: (key, value) => { if (storageBlocked) throw new Error('Storage unavailable'); storage.set(key, value); },
    },
    MutationObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: callback => { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const tick = time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); };
  return { dataset, screen, document, listeners, frames, storage, tick };
}

test('fresh documents play even when an opener copied session storage', () => {
  for (const seen of [false, true]) {
    const state = run({ seen });
    assert.equal(state.dataset.intro, 'loading');
    assert.equal(state.storage.get('portfolio:intro:v1'), 'seen');
    assert.equal(state.frames.size, 1);
  }
});
test('reloads, deep links, case studies, history restoration and reduced motion skip the intro', () => {
  for (const options of [{ seen: true, navigation: 'reload' }, { hash: '#projects' }, { pathname: '/projects/optionlab/' }, { navigation: 'back_forward' }, { reduced: true }]) {
    const state = run(options);
    assert.equal(state.dataset.intro, undefined);
    assert.equal(state.frames.size, 0);
  }
  assert.equal(run({ hash: '#home' }).dataset.intro, 'loading');
});
test('one clock completes the sequence at 2500ms even with storage unavailable', () => {
  for (const storageBlocked of [false, true]) {
    const state = run({ storageBlocked });
    state.tick(100);
    state.tick(1819); assert.equal(state.screen.dataset.phase, undefined);
    state.tick(1820); assert.equal(state.screen.dataset.phase, 'ready');
    state.tick(1980); assert.equal(state.dataset.intro, 'revealing');
    state.tick(2599); assert.equal(state.dataset.intro, 'revealing');
    state.tick(2600); assert.equal(state.dataset.intro, undefined);
    assert.equal(state.dataset.introStart, undefined);
    assert.equal(state.frames.size, 0);
    assert.equal(state.listeners.size, 0);
  }
});
test('hidden time does not consume visible playback or create duplicate loops', () => {
  const state = run(); state.tick(0); state.tick(500);
  state.document.hidden = true; state.listeners.get('visibilitychange')();
  assert.equal(state.frames.size, 0);
  state.document.hidden = false; state.listeners.get('visibilitychange')();
  assert.equal(state.frames.size, 1);
  state.tick(10000); state.tick(11999);
  assert.equal(state.dataset.intro, 'revealing');
  state.tick(12000); assert.equal(state.dataset.intro, undefined);
});
test('animation initialization failure releases the page without React', () => {
  const state = run({ brokenAnimation: true }); state.tick(0);
  assert.equal(state.dataset.intro, undefined);
  assert.equal(state.frames.size, 0);
});
