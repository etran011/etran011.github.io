# Terminal headline

The hero keeps its original name, typography, word wrapping, colors and headline: “Building intelligent systems, one idea at a time.” Scroll-driven alternate phrases and their opacity rules are removed. The existing hero scroll story remains intact for particle dissolution and ring reconstruction; typography no longer consumes its progress.

A small bootstrap runs before the headline markup. It opts eligible home visits into typing without flashing the complete text before hydration. Deep links, history restoration, reduced motion and forced colors get immediate text. An independent eight-second watchdog releases the enhancement if hydration fails. With JavaScript disabled, the bootstrap does not run and the server-rendered sentence is visible normally.

`HeroHeadline` waits until the hero intersects the viewport and the loader's `data-intro` flag is fully removed. Bounded font readiness and a 420ms name reveal precede typing. Characters use deterministic 40–65ms intervals, with a 135ms punctuation pause. Words retain their final size in normal layout; only character visibility changes. An absolutely positioned accent caret follows the active character, blinking every 600ms. It blinks briefly after completion, then disappears. The existing supporting academic description fades in once typing completes, in its original position.

The component uses one timeout and direct attribute changes rather than per-character React state updates. It never reads or subscribes to scroll progress. Scrolling away cannot erase or restart typing. Hiding an already-started sequence completes it; live reduced-motion or forced-color changes also expose the full sentence. Timers, observers and listeners are cleaned up on unmount. Without IntersectionObserver, the full text is displayed. All animation changes are scoped to the hero.

One complete sentence remains in screen-reader text; decorative glyphs are aria-hidden and never use an aria-live region. The name remains an h1 and the headline remains a paragraph. No new dependencies or renderers are added.

## Verification

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. The build statically exports the home page and both case studies with `.nojekyll` for GitHub Pages.

With Playwright and installed Chrome:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/hero-typing.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/intro.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/sculpture.browser.mjs http://127.0.0.1:4173
```

The typing suite checks loader handoff, progressive character visibility and caret, supporting text, stable dimensions, scroll/reentry continuity, return visits, responsive word wrapping at 320/390/768/1024/1440px, reduced motion, forced colors, no JavaScript and blocked hydration. Unit tests check bootstrap eligibility/watchdog, interval bounds and total duration. The intro and sculpture suites verify their existing lifecycles and reversible background animation remain intact.
