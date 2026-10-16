# Animation refinement validation

This records the earlier animation refinement. The later [Selected Work pinning revision](selected-work-pinning-validation.md) supersedes its hero copy, scene grouping, travel distances, and buffered hero wheel behavior.

The update preserves existing colors, self-hosted fonts, verified background data, project screenshots, case studies, and GitHub Pages export settings. The [reference portfolio](https://portfolio-mti1.vercel.app/) was inspected in a browser through its landing, About transition, and technical-stack area. Its large typography, layered atmosphere, and section pacing informed the work; its colors, assets, biography, and layout were not copied.

## Current behavior

- The hero has a minimum height of `100svh`, growing naturally when enlarged text or a short viewport requires more room. It contains the existing name, credentials, animated headline, and a single accessible About scroll link. The redundant preview card, multiple buttons, and social links were removed from this initial composition; projects, contact, and social links remain available in their existing sections and navigation.
- Home navigation is initially offscreen without a layout placeholder. It reveals after 120 pixels of scrolling and hides below 48 pixels. Focus reveals it immediately; an open menu remains visible. Case-study navigation is always available. No-JavaScript navigation remains usable.
- `createStoryPacer` smooths visual progress with damped velocity capped at 2.6 stages per second. Stage hysteresis prevents boundary flicker. Visible large jumps traverse intermediate stages in order. Offscreen scenes settle immediately, and explicit navigation can bypass them; document scrolling is never queued behind About or project animations. All About paragraphs remain readable, and gallery controls remain available.
- The full-screen hero pins at the top of the viewport; About and OptionLab retain their 112-pixel header clearance. Hero travel is capped at 840 pixels, while the other two scenes keep their 560-pixel caps.
- Only the desktop hero has extra wheel resistance. Lenis scales hero wheel deltas by 0.72 and caps oversized deltas at 220 pixels. If a fast gesture reaches the final story position before its visuals, up to 360 pixels of continuation are retained and released automatically after catch-up, with a 1.4-second maximum wait. Reverse input, keyboard navigation, anchor links, pointer actions, modal opening, visibility changes, blur, and cleanup cancel that pending continuation. Touch and reduced-motion scrolling stay native. Scrolling elsewhere retains its prior distance and easing.
- A hidden rem-sized probe detects text-scale changes even when the hero remains exactly one viewport tall. Enlarged text disables pinning reliably; smaller screens and short stages also retain their natural layout.
- All 29 verified skills remain grouped into six categories. Twelve locally bundled [Simple Icons](third-party-icons.md) paths and text fallbacks add recognition without another runtime dependency or CDN. The stack aligns with its heading on desktop and follows a compact vertical gap on smaller screens. Each category gets one short staggered assembly; labels are readable throughout. Reduced motion and forced colors cancel those animations.
- One shared background uses the existing accent color for grid, line, and orbit layers. Cached section positions drive a shared Motion scroll observer, while springs and transforms supply gentle depth. Section variants share timing and visual density. Mobile simplifies the layers, reduced motion removes movement, forced colors hide decoration, and background playback pauses when the document is hidden.

## Completed checks

- `npm test`: three permanent timeline tests cover large jumps, every stage, bounded speed, reversal, endpoint safety, delayed frames, and explicit reset.
- `npm run lint`, `npm run typecheck`, and `npm run build`: pass. The build exports all home, case-study, metadata, and not-found routes. `.nojekyll`, trailing slashes, and static image handling remain intact.
- Exported-site Chrome tests: initial navigation visibility, threshold hysteresis, keyboard focus reveal, hero-only first viewport, all ordered hero stages during large jumps, reverse progression, and natural release.
- Eight oversized wheel events traversed hero stages 1, 2, and 3 at approximately 383-millisecond intervals, then released automatically. A subsequent wheel gesture outside the hero retained its normal distance. Keyboard End bypassed the hero and canceled its deferred continuation.
- Same-page anchors, destination focus, browser back, PageDown, modal background locking, nested image scrolling, and live motion preference changes pass.
- All three routes pass at 320, 390, 768, and 1440 pixels, with additional hero checks at 1280 pixels. Direct reloads and project-to-project return navigation pass without missing resources or browser errors.
- Skill icon paths, labels, complete data, alignment, responsive wrapping, once-only reveals, and reduced-motion cancellation pass. Shared background variants, pointer transparency, scroll depth, and live mobile/high-contrast/reduced-motion fallbacks pass.
- Gallery manual selection takes priority over story changes. Zoom, keyboard panning, touch swipe, Escape, and focus restoration pass.
- Keyboard skip links, 200% text, custom text spacing, no-JavaScript mobile navigation, short viewports, forced colors, and repeated route/fallback transitions pass. No horizontal overflow or clipped headings was found in these checks.
- Axe reports zero automated violations across 13 animated story/skills/viewer states and 17 responsive reduced-motion page/menu/viewer states. Contrast over gradients and images also received visual review; this is not a formal accessibility certification.
- A final isolated local Chrome sample recorded 72 frame intervals over approximately 1.2 seconds, with a 16.7-millisecond median and 95th percentile. Timing can vary with machine load and hardware; this is not a universal 60 FPS guarantee.
- Current exported pages still contain no phone links or résumé downloads, and the removed PDF URL returns 404.

## Remaining scope

Deployment remains deferred. Safari, Firefox, and physical-device testing remain separate checks. The existing development-tooling audit findings are unchanged. Node may emit an informational module-format detection warning while running the TypeScript timeline tests; the tests succeed. No unsupported Application Atlas content was added.
