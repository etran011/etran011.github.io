/** Runs before body parsing so the hero never flashes underneath the first-session intro. */
export const introBootstrap = `(() => {
  const root = document.documentElement;
  try {
    if (location.pathname !== '/' || (location.hash && location.hash !== '#home') ||
        matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches ||
        performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
    try {
      if (sessionStorage.getItem('portfolio:intro:v1')) return;
      sessionStorage.setItem('portfolio:intro:v1', 'seen');
    } catch {}
    root.dataset.introStart = String(performance.now());
    root.dataset.intro = 'loading';
    setTimeout(() => { delete root.dataset.intro; delete root.dataset.introStart; }, 3000);
  } catch { delete root.dataset.intro; }
})();`;
