/** Runs before body parsing. One visible-time clock owns every intro stage. */
export const introBootstrap = `(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
  let frame = 0;
  let elapsed = 0;
  let previous = null;
  let screen;
  let parser;
  const animations = new Set();
  const dismiss = () => {
    cancelAnimationFrame(frame);
    parser?.disconnect();
    document.removeEventListener('DOMContentLoaded', parsed);
    delete root.dataset.intro;
    delete root.dataset.introStart;
    for (const animation of animations) animation.cancel();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', dismiss);
    preference.removeEventListener('change', changed);
  };
  const changed = () => { if (preference.matches) dismiss(); };
  const visibility = () => {
    previous = null;
    cancelAnimationFrame(frame);
    if (!document.hidden && root.dataset.intro) frame = requestAnimationFrame(tick);
  };
  const tick = now => {
    try {
      if (!root.dataset.intro || document.hidden) return;
      if (previous !== null) elapsed += now - previous;
      previous = now;
      if (elapsed >= 2500) { dismiss(); return; }
      if (elapsed >= 1720) screen.dataset.phase = 'ready';
      if (elapsed >= 1880) root.dataset.intro = 'revealing';
      // Seek the existing CSS effects from the same clock, including after tab suspension.
      for (const animation of screen.getAnimations({ subtree: true })) {
        animations.add(animation);
        animation.pause();
        const name = animation.animationName;
        const offset = name === 'intro-ready-in' ? 1720 :
          ['intro-uncover', 'intro-terminal-disperse', 'intro-fragment'].includes(name) ? 1880 : 0;
        animation.currentTime = Math.max(0, elapsed - offset);
      }
      frame = requestAnimationFrame(tick);
    } catch { dismiss(); }
  };
  const start = () => {
    try {
      screen = document.querySelector('.portfolio-intro');
      if (!screen || preference.matches) { dismiss(); return; }
      // Start at the first renderable frame, not script download or asset completion.
      root.dataset.introStart = String(performance.now());
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('pagehide', dismiss);
      preference.addEventListener('change', changed);
      frame = requestAnimationFrame(tick);
    } catch { dismiss(); }
  };
  const parsed = () => {
    screen = document.querySelector('.portfolio-intro');
    if (screen?.querySelector('.intro-ready')) {
      parser?.disconnect();
      document.removeEventListener('DOMContentLoaded', parsed);
      start();
    } else if (document.readyState !== 'loading') dismiss();
  };
  try {
    const navigation = performance.getEntriesByType('navigation')[0]?.type;
    if (location.pathname !== '/' || (location.hash && location.hash !== '#home') ||
        preference.matches || navigation === 'back_forward') return;
    try {
      // Reloads retain the old skip behavior. A new document navigation always plays,
      // even when an opener or Duplicate Tab copied another tab's session storage.
      if (navigation === 'reload' && sessionStorage.getItem('portfolio:intro:v1')) return;
      sessionStorage.setItem('portfolio:intro:v1', 'seen');
    } catch {}
    root.dataset.intro = 'loading';
    // Do not wait for deferred React scripts or DOMContentLoaded to start playback.
    parser = new MutationObserver(parsed);
    parser.observe(root, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', parsed, { once: true });
    parsed();
  } catch { dismiss(); }
})();`;
