# Automatic terminal phrase cycle

The hero preserves the original phrase order, wording, punctuation, line breaks and colors from the previous scroll presentation:

1. Building intelligent systems, / one idea at a time.
2. Building software.
3. Exploring AI & / machine learning.

`heroHeadlinePhrases` is the reusable source. The name, original typography, surrounding layout and particle scroll story remain unchanged. The text cycle never reads scroll distance, direction, velocity or pointer position.

A small bootstrap opts eligible home visits into the effect before the headline markup renders. The client waits until the loader's `data-intro` flag is removed and the hero is visible, then allows a 420ms name reveal before typing. Font readiness is bounded. The existing independent eight-second watchdog exposes the static fallback if hydration fails; a successfully started loop releases the bootstrap flag, so the watchdog cannot interrupt playback. Return page loads skip the already-seen loader and begin normally.

A tested state machine advances through typing, a 2100ms reading hold, backspacing and a 400ms empty pause. Typing uses deterministic 45–70ms intervals with short punctuation pauses; backspacing uses 25–45ms intervals. Each update adds or removes exactly one decorative glyph. The next phrase starts only after the old one is empty. An accent caret follows the last visible character, moves back to the start when empty, and blinks during pauses.

All full phrases occupy the same CSS grid cell. Hidden glyphs retain their layout dimensions and original word grouping, reserving the largest phrase footprint at each responsive width. The supporting academic text fades in after the first phrase is complete and stays visible throughout subsequent cycles. The h1 never participates in the loop.

One timeout controls playback with no per-character React state updates. Visibility changes preserve the phrase, character count, phase and remaining timeout; the loop pauses while offscreen or in a hidden tab and resumes without resetting. The caret pauses with it. Timers, font readiness timeout, observers and listeners are cleaned up on unmount.

Screen readers receive one static complete text containing all three phrases, outside the aria-hidden visual layers. No aria-live announcements are emitted. Reduced motion and forced colors display the complete first phrase immediately and disable the loop. No JavaScript, unavailable IntersectionObserver, deep links and history restoration also retain a readable static first phrase. Live reduced-motion changes stop the cycle without leaving a partial sentence.

## Verification

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Static export retains the home page, `.nojekyll` and both project case studies for GitHub Pages.

With Playwright and installed Chrome:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/hero-typing.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/intro.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/sculpture.browser.mjs http://127.0.0.1:4173
```

The typing suite observes two complete real-time loops, exact wording/order, individual backspacing, one caret, offscreen/tab pause and resume, scroll independence, stable dimensions across every phrase at 320/390/768/1024/1440px, return visits, live reduced motion, forced colors, no JavaScript and blocked hydration. Unit tests cover phrase preservation, timing bounds, bootstrap failure recovery and repeated state-machine loops. Intro and sculpture regressions verify their existing lifecycles and reversible visual transformations.
