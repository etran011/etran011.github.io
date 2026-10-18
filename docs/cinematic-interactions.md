# Cinematic interactions

The continuous-workspace redesign supersedes the historical pinned-scene and particle-dispersal behavior described below. See [Continuous portfolio workspace](continuous-workspace.md) for the current layout, persistent model, and validation.

The interaction update preserves the existing colors, fonts, content, routes, and static hosting configuration. About remains immediately after the hero. OptionLab uses the supplied screenshots; Application Atlas has no verified content or supplied screenshots and has not been invented.

## Desktop behavior

- A precise cursor dot follows the pointer directly; a spring-driven ring responds to links, buttons, cards, and screenshot controls. Text fields, selection, dialogs, keyboard navigation, and window blur restore the native cursor.
- [Lenis](https://github.com/darkroomengineering/lenis) is dynamically imported for gentle wheel inertia. It is the only scroll manager. Keyboard scrolling, touch input, browser history, and cross-route navigation retain their native behavior. Same-page anchors update history and focus the destination. Modal viewers suspend background scrolling.
- Three scenes use native CSS sticky positioning and Motion's shared scroll observer: the hero interests, About paragraph emphasis, and Selected Work with OptionLab screenshots. Added scroll travel is capped at 1200, 1000, and 1100 pixels respectively (see the current [scroll policy](ambient-atmosphere.md#deliberate-storytelling-natural-input)). Content can always be bypassed with navigation or keyboard scrolling.
- The hero keeps the name and credentials visible while interest phrases change. About keeps all paragraphs readable while highlighting the current chapter. OptionLab keeps its project details alongside the real screenshots.
- Any manual gallery interaction takes priority over scroll-driven image selection. Existing swipe, keyboard, zoom, modal focus, and Escape behavior remain available.
- Buttons move only a few pixels toward the pointer. Project lighting uses a translated gradient layer, and section entrances use restrained opacity and translation.

## Fallbacks and implementation

The full enhancement requires a precise non-touch pointer and a viewport at least 1024 pixels wide. Pinning additionally requires sufficient viewport height and enough space to show the complete stage. Enlarged root text, reduced motion, forced colors, touch devices, and shorter viewports remove pinning. Mobile and tablet retain natural scrolling and the ordinary gallery controls. All content remains readable without JavaScript.

Continuous motion uses Motion values or CSS custom properties, rather than React state on every frame. Gallery state changes only at story steps. Pointer bounds are cached, updates are batched where needed, and unchanged document attributes are not rewritten on each movement. Effects clean up observers, listeners, animation instances, and pending frames on route changes or unmount. No separate GSAP system was introduced.

## Validation

Validation used the production static export served locally and headless Chrome, plus a live Next.js development preview:

- TypeScript, ESLint, production build, and static export checks.
- All three routes at 320, 390, 768, and 1440 pixel widths, including direct case-study reloads and return navigation.
- Every story step in both directions, natural release, fast keyboard bypass, wheel interpolation, anchors, focus, browser back, and modal scroll locking.
- Cursor precision and contextual states, button press and magnetic bounds, project lighting, gallery ownership, zoom, keyboard panning, touch swipes, and focus restoration.
- Live reduced-motion and forced-colors changes, 200% text, custom text spacing, no-JavaScript navigation, short viewports, and repeated route changes without duplicate cursor instances or browser errors.
- Axe scans across 12 animated story/viewer states and 17 responsive reduced-motion page/menu/viewer states: no automated violations. Contrast over gradients and imagery required visual review; these checks are not a formal accessibility certification.
- A short local Chrome scroll sample recorded a 16.7 ms median frame interval and approximately 16.8 ms at the 95th percentile. This is a local diagnostic, not a guarantee on every device.

The output retains `output: "export"`, trailing-slash routes, unoptimized images, and `.nojekyll` for GitHub Pages. Deployment remains deferred. The existing five high-severity development-tooling audit entries documented in the README remain outside this interaction update. Safari and Firefox require separate device testing.

See [animation refinement validation](animation-refinement-validation.md) for the subsequent full-screen hero, bounded timeline pacing, navigation visibility, skills, and shared background update.

The latest [Selected Work pinning revision](selected-work-pinning-validation.md) keeps the heading and featured card together, removes buffered hero wheel input, and simplifies the hero copy and scroll transitions.


## Current cinematic direction

The short opening camera settles over 1.6 seconds using the existing renderer's active time; it pauses when hidden and never gates input. Its maximum offset is 0.1 radians of yaw, 0.05 radians of pitch, and 4.5% scale. The surface, trajectory, and coordinate rings share the same pose. The name, credentials, and word reveals finish within roughly 1.2 seconds, with readable initial opacity. Reduced-motion/static modes do not run the camera sequence.

Section entrances use one-time layers rather than continuously shifting text. Headings lead, supporting details follow at short intervals, and professional chapters use quieter 520 ms reveals. Main entrances use 640 ms and the same easing as Skills. Eligible pinned headings receive opacity changes only, preserving their position and full composition. Contact closes with a staged message and gently brighter halo. Ordinary scrolling and the established heavier native-sticky stories retain their input behavior and travel distances.

Screenshots enter in the direction of forward/reverse travel, with a small 1.2% scale adjustment and 10 px translation that settles over 620 ms. Captions follow within a persistent live region. The viewer, keyboard controls, manual override, and original screenshots remain intact. Mobile uses shorter 320 ms image transitions, and reduced motion uses still images.

The nineteen verified technologies remain unchanged. Original multicolor local SVGs preserve the details of Python, R, NumPy, pandas, Matplotlib, and Pytest; other marks use upstream brand colors or an appropriate white monochrome version. Small neutral backings preserve dark marks. Only the active icon and label receive hover emphasis, with a restrained brand-color halo and 3 px/6% lift. See [source attribution](third-party-icons.md). Staggered icon reveals share the motion timing; keyboard focus cancels an unfinished reveal on its icon.

Section and Skills Web Animations pause while hidden, cancel for reduced motion/forced colors, and release on route changes. No new scroll controller, runtime library, fullscreen filter, or WebGL pass was introduced. The renderer retains its existing four buffers and at most five hero draw calls; expanded ambient sections use one. The opening adds no frame loop or geometry allocation.

Repeatable full-flow checks:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/cinematic.browser.mjs http://127.0.0.1:4173
```

This verifies immediate opening navigation, section entrances and their settled state, stable project headings across forward/reverse images, viewer/focus restoration, original icon assets, brand color rendering, keyboard selection, and live reduced-motion behavior. Existing particle, scroll, responsive pinning, resource-lifecycle, and accessibility checks supplement it. Physical trackpad feel and Safari/Firefox require separate testing.


### Verification of the current refinement

All 22 unit tests, TypeScript validation, ESLint, the production build, and Pages asset/route checks pass. Chrome checks cover the complete narrative, every About/project stage forward and backward at 1440×1000, 1440×900, and 1280×800, natural fallbacks, responsive Skills interactions at 320/390/768/1440 px, renderer recovery/cleanup, hidden-tab pauses, and live reduced motion/forced colors. Automated axe scans found no violations across the homepage and both case studies at 320 and 1440 px, including available menu/viewer/zoom states. This is not a formal accessibility certification.

A production 1440×1000 / device-scale-2 sample measured approximately 60 FPS at high quality with median/p95 frame intervals of 16.7 ms. The 2,399,969-pixel buffer stayed within budget; quiet content used 30 points draws/second. A 2560×1440 resize used a 2066×1162 buffer with no GL error, and simulated frame pressure/data-saving modes retained adaptive fallback behavior. These measurements describe this machine, not all devices.

Small text remains strongly visible during its reveal, and keyboard emphasis stays on the focused technology. The development preview remains running. No phone number, résumé download, project content, or additional technologies were added.
