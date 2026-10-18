# Readability, native scrolling and expanded atmosphere

## About readability

The original asymmetric islands, facts and biography are retained. Body copy is now 16px with a comfortable 1.8 line height and 60-character maximum measure. Theme-derived brighter copy, slightly stronger headings, larger metadata, clearer line numbers and links make the code-inspired composition easier to scan. Dark surfaces remain translucent at 96%, with restrained borders; no full-page opaque cover or expensive backdrop filter was added.

`tests/about-readability.browser.mjs` verifies every island text color against WCAG AA's 4.5:1 ordinary-text threshold, conservatively compositing the surface over a fully white backdrop. It also checks body text size, immediate opacity and responsive bounds at 320–1920px. The existing axe and 200% text suites cover the surrounding page and retained card alignment.

## Native input

The former `SmoothScroll` component, Lenis dependency/lockfile entry, imported Lenis stylesheet, `data-weighted-scroll` rule, smooth-scroll hint and CSS anchor smoothing are removed. There is no replacement scrolling engine, wheel listener, delta multiplier or input damping. Browser wheel/touch momentum, keyboard keys, anchor history and reversal are left to the browser.

All seven anchor destinations have negative tab indexes so native hash navigation can focus them without adding tab stops or intercepting clicks. Existing 7rem scroll padding keeps targets below navigation. The auto-hiding scrollbar continues mapping drag movement directly to native document position. Its focus/drag, keyboard, hover, history, touch, forced-colors and no-JavaScript checks pass.

Visual effects remain independent: the persistent atmosphere reads native position, the career timeline observes native scrolling and layout reflow, and islands animate on intersection. Bounded catch-up applies only to the sculpture, never to document travel. The native-input test asserts uncanceled wheel events, full input distance within 100–150ms, no delayed replay, Page Up/Down, Home/End, native anchor focus and unchanged visual expansion.

## Larger continuous mathematical sculpture

The shared projection now expands from 1× to 2.65× over the first 1.2 hero heights. The hero rest scale and right-side placement are unchanged. One projection scales the landscape, contours, trajectory and orbital instruments together. Mathematical vertices, connectivity, ring geometry and angular speeds are unchanged; no scatter field or random displacement was introduced. Individual particle sizes still decrease during expansion, while all original breathing, traveling energy, orbital movement and optimization playback continue while scrolling stops.

Expanded canvas opacity now retains 0.75 rather than 0.47, mesh emphasis retains 0.82 rather than 0.55, and ring emphasis gently rises to 1.12 instead of fading to 0.65. Expanded surface lighting is less attenuated. The same palette, depth shading and left-side typography protection remain; brightness comes from controlled contrast rather than added glow. The large background intentionally extends beyond the viewport, showing coherent surface curves and ring arcs behind and between the islands.

Touch/tablet uses the existing SVG, expanding up to 1.65× with restrained visibility; desktop SVG fallback can reach 1.9×. Reduced motion keeps that structure spatially static, forced colors suppress decoration, and fixed clipping prevents document overflow.

The renderer still uses one canvas, one program, four persistent buffers and at most five draws, with the existing 2.4-megapixel cap and adaptive density. Scroll tests lock density to the existing low tier when checking buffer reuse, so legitimate adaptive quality changes cannot be mistaken for scroll-triggered geometry rebuilds.

## Validation and limits

TypeScript, ESLint, 34 unit tests and the production GitHub Pages static export pass. Chrome review covers all main sections on desktop and touch/mobile. Responsive layout checks cover 320–1920px and both case studies at 200% text size. Axe reports no violations across 320, 390, 768 and 1440px.

Browser regressions cover native wheel bursts/large gestures, reversal, keyboard, anchors, scrollbar dragging, gallery/modal controls, timeline travel/reflow, cursor alignment, Education disclosure, Tools selection, terminal loader/typing, active idle motion, GPU energy waves, buffer reuse, context restoration, hidden-page pause and reduced-motion/static fallbacks. Gallery stability checks now wait for the independent entrance to finish after immediate native anchor arrival; intro checks wait for actual visible content rather than just a removed state attribute.

Physical trackpad hardware, Safari, Firefox and Edge were not tested. Chrome wheel bursts approximate fine trackpad input, rather than certifying a particular device.

Performance diagnostic: Hero and Contact each measured about 30.25 model FPS, 33.3ms median/33.4ms p95, five draws and a 2,400,692-pixel capped canvas. The unchanged performance suite's >35 FPS assertion fails. A separate blank Chrome page also measured 33.3ms median/33.4ms p95 requestAnimationFrame intervals, suggesting an environment cadence limit; 60 FPS cannot be verified here. No timing threshold was relaxed and no extra renderer, buffers or frame loop was added.
