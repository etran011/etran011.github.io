# Education presentation

Education remains between Skills and Contact, using the existing theme, Geist typography and ambient particle layer. Large, two-line William & Mary typography anchors the left side; a lightweight SVG coordinate study sits behind the expected graduation year and cumulative GPA. The layout stacks naturally below 768px. No new renderer, packages, scroll listeners or pinned sequence were added.

Academic facts come from `src/data/background.ts`: B.S. Data Science, William & Mary, Williamsburg, expected graduation in 2028, GPA 3.92 / 4.00, and ten existing courses. The native coursework disclosure preserves every course and supports Enter/Space, focus indication and no-JavaScript operation. Expected graduation appears only in the academic metrics; no timeline or progress indicator is displayed.

The local `EducationMotion` wrapper follows the existing IntersectionObserver/Web Animations pattern. It reveals the label, name lines, degree, year, GPA, study and coursework in sequence. The entrance runs once, has no persistent hidden styles, and cancels when keyboard focus enters. Existing generic reveal selectors do not target the new composition, avoiding overlapping entrances. CSS drives a slow six-degree lattice drift, a traveling data pathway and staggered node illumination. Mobile keeps the diagram still while simplifying the remaining motion. Metric hover feedback is limited to fine pointers; factual text remains noninteractive.

Idle motion pauses outside the viewport and when the document is hidden. Entrance animations pause with it. Live reduced-motion/forced-color changes cancel the entrance; reduced motion leaves a static diagram and forced colors remove decorative SVG. Observers, listeners and animations are cleaned up on unmount. The shared cursor, navigation, scroll physics and particle renderer are unchanged.

## Verification

Run `npm test`, `npm run typecheck`, `npm run lint` and `npm run build`. Static export must retain `.nojekyll` and both project case-study routes.

With Playwright and installed Chrome available:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/education.browser.mjs http://127.0.0.1:4173
```

The suite checks staged entrance timings, ongoing idle movement without input, hidden/offscreen pause, no entrance replay, live reduced motion, keyboard disclosure and focus exit, verified academic text, section order, cursor coexistence, no JavaScript and layouts from 320px to 1920px. Manual desktop/mobile review checks typography, spacing, linework and text readability. An axe audit scoped to Education checks collapsed and expanded coursework at 320px and 1440px; forced-color review verifies decorative SVG is removed.
