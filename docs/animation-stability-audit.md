# Animation stability audit — November 14, 2026

## Architecture reviewed

The portfolio uses a custom WebGL renderer (not Three.js), one persistent render loop, Motion springs/scroll observation, Web Animations API entrances, CSS transitions/keyframes, IntersectionObserver, ResizeObserver, and bounded terminal/loader timers. There is no GSAP, ScrollTrigger, Lenis, or global scrolling controller.

Reviewed the renderer, quality budget, scene/particle choreography, scroll measurements, navigation, shared reveals, Experience, Education, Tools, hover effects, terminal, loader/bootstrap, scrollbar and project anchor utility. Retained the geometry, shader-based idle effects, four static GPU buffers, adaptive quality, five-draw-call budget and 2.4-megapixel cap. Existing mobile/reduced-motion static visualization fallbacks remain unchanged.

## Findings and repairs

- Card reveals waited until a visible-area threshold before switching visible content to zero opacity. They now start in an 80px pre-entry margin. Already-visible content, restored scroll positions and large anchor jumps skip the fade. No persistent hidden CSS is introduced. Hidden-tab interruption cancels the reveal to its readable base state. Translation remains separate from hover transforms.
- Navigation rebuilt section arrays and measured each section on every scroll frame. Section bounds and document extent are now cached until resize/reflow/route changes. The background also caches hero height rather than reading it during scroll updates.
- Camera position followed a separate 120ms smoothing layer while expansion used its own bounded response. Both now derive from the same expansion progress, keeping landscape and rings synchronized.
- Canvas resize assigned both drawing-buffer dimensions even when unchanged, including duplicate resize calls during quality changes. Unchanged dimensions now return early. Hover work no longer schedules a frame outside interactive targets.
- Terminal reduced-motion handling permanently disabled its timer cycle. It now resumes when motion is allowed again, preserving phrase content/timing and a single caret. Font readiness retains its bounded timeout through preference changes.
- Experience animated both articles and nested bullet items and paused unfinished entrances when the whole timeline left the viewport. Entrances now target article/date groups and finish offscreen. Decorative milestone activity still pauses offscreen. A reproduced stale reduced-motion state is resolved by event-owned preference state instead of live media reads in scroll/measurement callbacks.

## Measurements

Chrome headless, same machine, production export, 1440 × 1000, DPR 2, high quality. These are local measurements, not a guarantee for every GPU/device.

| Sample | Before | After |
| --- | --- | --- |
| Hero model FPS | 60.50 | 60.50 |
| Hero frame p95 | 16.7ms | 16.8ms |
| Contact model FPS | 60.50 | 60.50 |
| Contact frame p95 | 16.8ms | 16.7ms |
| Draw calls per rendered frame | 5 | 5 |
| Section-bound reads during 50-step scroll | 343 | 0 |
| Scroll script time | 28.08ms | 27.47ms |
| Scroll layout time | 2.16ms | 2.77ms |

Frame rate was already healthy in the controlled baseline. The improvement is less redundant scroll work and corrected state transitions, not a claimed FPS increase. Layout-time differences are small/noisy; no layout-speed improvement is claimed. Pointer 90% response measured 41–96ms. Expansion responded within 100ms in both directions. GPU utilization and physical-device battery use were not measured.

## Validation

- Production build, explicit TypeScript check, ESLint, 36 unit tests, static export (6 HTML files / 289 local references).
- Browser suites: atmosphere performance, pointer response, expansion response, particles/context recovery, header navigation, native scrolling, intro, hero navigation, Experience, card reveals, animation lifecycle.
- Loader tests include first/return visits, slow assets, storage denial, missing client code, unavailable WebGL, reduced motion and forced colors.
- Full phrase typing/backspacing after repeated OptionLab/PlatePredict returns, Back/Forward, direct entry, reload, rapid returns and hidden-tab recovery.
- Development and production lifecycle checks retain four live WebGL buffers, one canvas and no more than one render per display frame after four client navigation cycles and preference toggles. This is a resource-lifecycle check, not a full heap-leak proof.
- Desktop/mobile reveal tests exercise slow viewport entry, repeat scrolling, fast anchor jumps and readable reduced-motion content.
- Experience reverse illumination, reflow, no replay, hidden/reduced/forced states, 320–1440px widths and 200% text.
- Top-to-bottom visual traversal and rapid hover checks at 1440px, 1024px and 390px; no horizontal overflow or runtime errors detected.

Regression commands use `PLAYWRIGHT_MODULE` pointing to the installed Playwright package and accept a base URL. New suites: `tests/card-reveals.browser.mjs` and `tests/animation-lifecycle.browser.mjs`. Tested the production export at port 4186 and development at port 3011. Physical Safari/iOS and Firefox performance were not measured.
