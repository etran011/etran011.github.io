# Continuous portfolio workspace

The home page uses ordinary document flow from Hero through Contact. The former Hero, About, and featured-project sticky scenes, artificial travel, step pacer, and automatic screenshot changes have been removed. Lenis still smooths eligible desktop wheel input; touch, keyboard, anchor focus, history, dialogs, reduced motion, and forced colors retain their existing handling.

## Content and layout

`ContentIsland` supplies a shared thin border, quiet transparent dark surface, rounded corners, and responsive padding. About combines a large Markdown-inspired introduction with two verified academic panels and a project panel. All three original narrative chapters remain. Experience uses alternating seven/five-column islands; projects retain large screenshots and manual galleries. Education preserves the William & Mary typography, 2028 graduation, GPA, academic illustration and coursework disclosure within one island. Contact has separate message and social-link islands. Section backgrounds and the footer share the continuous atmosphere.

Tools retains its original components, categories, official icon assets/colors/sizes, labels, arrangement, selection state, keyboard behavior and hover effects. Only shared section spacing and the background around it have changed.

Islands enter once with a 6–10px rise and a small opacity change (0.92 to 1). They never fade out with scroll progress. Focus cancels entrances; reduced motion and forced colors skip them. Education and Tools keep their own existing motion controllers. All information is visible before JavaScript.

## Persistent mathematical renderer

One canvas, one WebGL program and four static buffers render the sampled Himmelblau loss surface, mesh/contours/downhill vectors, optimization trajectory, and three original orbital instruments. The model and its rings share one projection. Over roughly the first 1.2 hero heights of normal document scrolling, the projection expands up to 1.32× and particles become finer. Bounded, reversible catch-up prevents jumps after large input or anchor navigation. No scatter destinations, fragment displacement, per-section camera profiles, or dissolved ambient field remain.

Mesh intensity retains a 0.55 floor; ring intensity retains a 0.65 floor. Canvas intensity smoothly changes from 0.95 to 0.47 rather than switching by section. Idle breathing, traveling energy, surface-normal oscillation, rotating rings, camera drift and optimization continue throughout the page. Background motion is restrained without stopping its clock. Hidden documents pause rendering. Context loss, touch, reduced motion, missing WebGL and JavaScript-disabled views retain the existing SVG structure; forced colors suppress decorative imagery for readability.

Vertices now contain ten floats rather than thirteen (23% less vertex storage). Geometry does not rebuild during scrolling. Existing adaptive density, device/data-saving hints, hidden-tab cleanup and the 2.4-megapixel canvas cap remain. A capable desktop Chrome sample measured approximately 60.5 model FPS at Hero and Contact, 16.7ms median and 95th-percentile frame intervals, high quality and five draws per frame. This is a local measurement, not a guarantee on every device.

## Verification

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `tests/workspace.browser.mjs`: natural flow, gallery/modal controls, unchanged Tools controls, and 320–1440px section layouts.
- `tests/particles.browser.mjs`, `tests/sculpture.browser.mjs`: persistent mesh/rings/trajectory, scale and sample-size changes, reverse scrolling, active idle clock, no scroll-time buffer allocation, hidden-tab pause, context restoration and static fallbacks.
- `tests/atmosphere-performance.browser.mjs`: rendering cadence, complete scene draw budget and high-DPI cap.
- `tests/cinematic.browser.mjs`, `tests/scroll.browser.mjs`, `tests/cursor.browser.mjs`: one-time entrances, gallery transitions, wheel distance, anchors/focus, and cursor tracking/click/native fallbacks.
- `tests/workspace-accessibility.browser.mjs`: axe, 200% text, JavaScript-disabled, touch and forced-colors content. Set `PLAYWRIGHT_MODULE` and `AXE_MODULE` to the installed test dependencies; no runtime dependency was added.
- Existing Education, terminal typing, loader, energy-wave and scrollbar suites cover the preserved interactions.

The exported `out/` retains `.nojekyll`, the home page, both directly accessible case-study routes, and static assets. Visual review covers the complete page at desktop and mobile sizes.
