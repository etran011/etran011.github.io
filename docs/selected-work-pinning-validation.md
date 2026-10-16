# Selected Work pinning and scroll cleanup

## Changes

The Selected Work label, “Ideas, put to work.” heading, supporting description, and leading OptionLab card now share a single `ScrollStory`. Previously the story lived inside `ProjectCard`, leaving the heading above the sticky area. Cards remain reusable presentation components; the showcase owns the combined scene and explicitly enables the featured gallery's scroll linkage. Project ordering, copy, real screenshots, case-study links, colors, fonts, navigation, and cursor remain unchanged.

The complete scene pins 112 pixels below the top of the viewport, clearing the fixed navigation. Its heading is excluded from general scroll reveals and does not fade or translate. Tighter heading spacing and compact card padding on shorter desktop viewports let the composition fit without scaling text or clipping the card. Eligibility measures the entire scene. If it cannot fit, including enlarged text, the scene stays in ordinary document flow. Pinning and release do not change its internal layout.

The two requested hero phrases were removed from the rendered component and the remaining sequence reduced from four stages to three. Their unused styles were removed. The original main headline, name, credentials, full-viewport layout, entrance animation, and background remain.

The hero's buffered wheel-input mechanism was removed. Lenis retains its existing easing and a wheel multiplier of one; it no longer clamps, holds, or replays hero wheel gestures. Native keyboard, touch, browser history, same-page anchor focus, and modal behavior remain intact. The bounded visual timeline still smooths story changes independently of document scrolling. Rapid navigation can leave a scene without waiting for its animations.

Added scroll travel is now capped at 600 pixels for the hero, 360 for About, and 480 for Selected Work, down from 840/560/560. The small hero scale/text shifts and gallery parallax were removed. Screenshot entrance opacity now starts at 0.92 with a 1.005 scale, keeping images legible during transitions. Manual gallery control continues to override scroll-driven selection.

## Verification

- `npm test`: all three timeline regression tests pass.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass. Static home, both case studies, metadata routes, and the not-found page export successfully; trailing slashes, static image handling, and `.nojekyll` remain compatible with GitHub Pages.
- The production export was served locally and exercised in Chrome. Both removed phrases are absent from the rendered hero at 1440×1000, 1280×800, 390×844, and 320×568. The name, eight-word entrance sequence, two remaining alternative phrases, full initial viewport, and responsive wrapping pass.
- At 1440×1000, 1440×900, and 1280×800, the full Selected Work composition remains visible through all three screenshot stages in both directions. The label clears the navbar, the heading remains opaque with no reveal animation, and the card bottom remains inside the viewport. Document height remains constant during the sequence. Two-pixel entry and forty-pixel exit checks confirm continuous native sticky positioning without jumps.
- Short 1024×650, tablet 768×900, mobile 390×844, and desktop reduced-motion layouts disable project pinning. Gallery opening, Escape, and natural scrolling remain usable.
- Normal, small, large, and reverse wheel deltas retain their intended travel. Tests confirm that scrolling stops without deferred replay, anchors focus About correctly, and keyboard End bypasses the stories.
- Pointer and keyboard gallery ownership, zoom, modal background locking, nested image scrolling, focus return, browser back, PageDown, and live reduced-motion changes pass.
- All three routes pass at widths of 320, 390, 768, and 1440 pixels, including case-study direct reloads and return navigation, without horizontal overflow, missing resources, or browser errors. Keyboard skip links, 200% text, custom text spacing, forced colors, and no-JavaScript navigation pass.
- Axe reports zero automated violations across twelve animated story/skills/viewer states and seventeen responsive reduced-motion page/menu/viewer states. These scans supplement visual review and do not constitute accessibility certification.
- Live text enlargement disables all three pins, and restoring text size re-enables scenes that fit. Repeated route and motion-preference changes pass without duplicate cursor instances or browser errors. A short isolated Chrome frame sample measured a 16.7 ms median and 16.8 ms 95th percentile; results depend on device and load.
- Current exported routes retain the earlier privacy changes: no phone links or résumé downloads, and the removed PDF URL returns 404.

The development preview remains on port 3001. Deployment was not changed. The composition screenshot mentioned in the brief was not attached, so alignment follows the written requirements and viewport-fit checks. Safari, Firefox, physical trackpad/device testing, and the previously documented development-tooling audit findings remain outside this change.
