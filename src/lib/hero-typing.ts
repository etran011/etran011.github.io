/** Approved terminal copy with explicit line breaks; playback is independent of wording. */
export const heroHeadlinePhrases = [
  { lines: ["Studying data science.", "Writing Python."] },
  { lines: ["Exploring AI &", "machine learning."] },
] as const;
export const heroHeadlineText = heroHeadlinePhrases.map(phrase => phrase.lines.join(" ")).join(" ");
/** Deterministic variation keeps playback natural and reproducible without random jitter. */
export function characterDelay(character: string, index: number) {
  if (character === " ") return 20 + index * 7 % 11;
  return 35 + (index * 13 % 31) + (/[,.!?]/.test(character) ? 100 : 0);
}
/** Document-only prepaint setup in the persistent root layout; route effects own playback. */
export const heroTypingBootstrap = `(() => {
  const root = document.documentElement;
  try {
    if (location.pathname !== '/' || (location.hash && location.hash !== '#home') || root.dataset.heroTyping ||
        matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches ||
        performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
    root.dataset.heroTyping = 'waiting';
    setTimeout(() => { delete root.dataset.heroTyping; }, 8000);
  } catch { delete root.dataset.heroTyping; }
})();`;

export function backspaceDelay(index: number) { return 20 + index * 7 % 16; }

/** One reusable state, advanced only by the active timer; no scroll input. */
export function createHeroTypingCycle() {
  const phrases = heroHeadlinePhrases.map(phrase => phrase.lines.join(" "));
  const state = { phrase: 0, count: 0, phase: "typing" as "typing" | "hold" | "backspace" | "gap", delay: 420 };
  return {
    state,
    advance() {
      const text = phrases[state.phrase];
      if (state.phase === "typing") {
        state.count++;
        state.phase = state.count === text.length ? "hold" : "typing";
        state.delay = state.phase === "hold" ? 2100 : characterDelay(text[state.count - 1], state.count - 1);
      } else if (state.phase === "hold") {
        state.phase = "backspace"; state.delay = backspaceDelay(state.count);
      } else if (state.phase === "backspace") {
        state.count--;
        state.phase = state.count === 0 ? "gap" : "backspace";
        state.delay = state.phase === "gap" ? 400 : backspaceDelay(state.count);
      } else {
        state.phrase = (state.phrase + 1) % phrases.length;
        state.phase = "typing"; state.delay = characterDelay(phrases[state.phrase][0], 0);
      }
      return state;
    },
  };
}
