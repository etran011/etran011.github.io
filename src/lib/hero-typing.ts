export const heroHeadlineLines = ["Building intelligent systems,", "one idea at a time."] as const;
export const heroHeadlineText = heroHeadlineLines.join(" ");
/** Deterministic variation keeps playback natural and reproducible without random jitter. */
export function characterDelay(character: string, index: number) {
  return 40 + (index * 17 % 26) + (/[,.!?]/.test(character) ? 135 : 0);
}
/** Runs ahead of the headline markup; no JavaScript leaves the complete SSR text visible. */
export const heroTypingBootstrap = `(() => {
  const root = document.documentElement;
  try {
    if ((location.hash && location.hash !== '#home') || root.dataset.heroTyping ||
        matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches ||
        performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
    root.dataset.heroTyping = 'waiting';
    setTimeout(() => { delete root.dataset.heroTyping; }, 8000);
  } catch { delete root.dataset.heroTyping; }
})();`;
