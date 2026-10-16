# Cinematic interactions

The interaction update preserves the existing colors, fonts, content, routes, and static hosting configuration. About remains immediately after the hero. OptionLab uses the supplied screenshots; Application Atlas has no verified content or supplied screenshots and has not been invented.

## Desktop behavior

- A precise cursor dot follows the pointer directly; a spring-driven ring responds to links, buttons, cards, and screenshot controls. Text fields, selection, dialogs, keyboard navigation, and window blur restore the native cursor.
- [Lenis](https://github.com/darkroomengineering/lenis) is dynamically imported for gentle wheel inertia. It is the only scroll manager. Keyboard scrolling, touch input, browser history, and cross-route navigation retain their native behavior. Same-page anchors update history and focus the destination. Modal viewers suspend background scrolling.
- Three scenes use native CSS sticky positioning and Motion's shared scroll observer: the hero interests, About paragraph emphasis, and OptionLab screenshots. Added scroll travel is capped at 840, 560, and 560 pixels respectively. Content can always be bypassed with navigation or keyboard scrolling.
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
