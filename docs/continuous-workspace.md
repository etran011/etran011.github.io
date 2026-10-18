# Continuous portfolio workspace

The home page uses ordinary document flow from Hero through Contact. The former Hero, About, and featured-project sticky scenes, artificial travel, step pacer, and automatic screenshot changes have been removed. All wheel, trackpad, keyboard, touch and anchor scrolling is native. Lenis, its CSS, its requestAnimationFrame loop, wheel damping, anchor interception and custom input interruption code have been removed. Section destinations are natively focusable without adding tab stops; browser history, scroll padding and modal scroll locking remain. Decorative effects observe real document position independently.

## Content and layout

`ContentIsland` supplies a shared thin border, quiet transparent dark surface, rounded corners, and responsive padding. About is a single borderless editorial composition: a small About me label, a prominent heading and two concise personal paragraphs. The Markdown frame, faux metadata, statistics and project-by-project descriptions are removed. A localized translucent reading surface preserves the expanded scene around it. See [Editorial About introduction](editorial-about.md). Experience now uses an open vertical career timeline (see [Experience career timeline](experience-timeline.md)); projects retain large screenshots and manual galleries. Education preserves the William & Mary typography, 2028 graduation, GPA, academic illustration and coursework disclosure within one island. Contact has separate message and social-link islands. Section backgrounds and the footer share the continuous atmosphere.

Tools retains its original components, categories, official icon assets/colors/sizes, labels, arrangement, selection state, keyboard behavior and hover effects. Only shared section spacing and the background around it have changed.

Islands enter once with a 6–10px rise and a small opacity change (0.92 to 1). They never fade out with scroll progress. Focus cancels entrances; reduced motion and forced colors skip them. Education and Tools keep their own existing motion controllers. All information is visible before JavaScript. About uses 17px mobile / 18px larger-screen body copy with a 1.8 line height, a 60ch maximum measure and one 96% dark translucent surface. Its heading and prose align in two desktop columns and stack below 1101px. No résumé metrics or employment bullets are duplicated.

## Persistent mathematical renderer

One canvas, one WebGL program and four static buffers render the sampled Himmelblau loss surface, mesh/contours/downhill vectors, optimization trajectory, and three original orbital instruments. The model and its rings share one projection. Over roughly the first 1.2 hero heights of normal document scrolling, the projection expands up to 2.65× and particles become finer. Bounded, reversible catch-up prevents jumps after large input or anchor navigation. No scatter destinations, fragment displacement, per-section camera profiles, or dissolved ambient field remain.

Mesh intensity retains a 0.82 floor; ring emphasis gently rises from 1 to 1.12. Canvas intensity smoothly changes from 0.95 to 0.75 rather than switching by section. Idle breathing, traveling energy, surface-normal oscillation, rotating rings, camera drift and optimization continue throughout the page. Background motion is restrained without stopping its clock. Hero size, right-side placement, mathematical samples, orbital geometry and animation speeds are unchanged. The larger state intentionally extends beyond the viewport behind the page; the underlying connected surface remains intact. Hidden documents pause rendering. Context loss, touch, reduced motion, missing WebGL and JavaScript-disabled views retain the existing SVG structure. The desktop SVG can expand to 1.9× and mobile SVG to 1.65× with restrained contrast. Reduced motion disables spatial expansion of that fallback; forced colors suppress decorative imagery for readability.

Vertices now contain ten floats rather than thirteen (23% less vertex storage). Geometry does not rebuild during scrolling. Existing adaptive density, device/data-saving hints, hidden-tab cleanup and the 2.4-megapixel canvas cap remain. A previous capable desktop Chrome sample measured approximately 60.5 model FPS at Hero and Contact, 16.7ms median and 95th-percentile frame intervals, high quality and five draws per frame. That historical measurement is not a guarantee on every device; the subsequent layout audit measured about 30 FPS in this environment. The current validation is recorded in [Readability, native scrolling and expanded atmosphere](native-scrolling-atmosphere.md).

## Verification

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `tests/workspace.browser.mjs`: natural flow, gallery/modal controls, unchanged Tools controls, and 320–1440px section layouts.
- `tests/particles.browser.mjs`, `tests/sculpture.browser.mjs`: persistent mesh/rings/trajectory, scale and sample-size changes, reverse scrolling, active idle clock, no scroll-time buffer allocation, hidden-tab pause, context restoration and static fallbacks.
- `tests/atmosphere-performance.browser.mjs`: rendering cadence, complete scene draw budget and high-DPI cap.
- `tests/cinematic.browser.mjs`, `tests/scroll.browser.mjs`, `tests/cursor.browser.mjs`: one-time entrances, gallery transitions, wheel distance, anchors/focus, and cursor tracking/click/native fallbacks.
- `tests/workspace-accessibility.browser.mjs`: axe, 200% text, JavaScript-disabled, touch and forced-colors content. Set `PLAYWRIGHT_MODULE` and `AXE_MODULE` to the installed test dependencies; no runtime dependency was added.
- Existing Education, terminal typing, loader, energy-wave and scrollbar suites cover the preserved interactions.

The exported `out/` retains `.nojekyll`, the home page, both directly accessible case-study routes, and static assets. Visual review covers the complete page at desktop and mobile sizes.
