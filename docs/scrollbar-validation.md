# Native scrollbar

The root scrollbar uses the existing blue accent and background tokens. On fine-pointer desktop devices it has a 10px native thumb with a dark interior, a 1.5px rounded accent outline, and brighter border colors on hover/press. The interior remains dark in every state and the track matches the nearly black page background. Firefox receives a standard thin scrollbar with a muted accent thumb as an accessible native approximation: standard scrollbar properties cannot express a separate outline. Engines exposing WebKit scrollbar selectors receive the outlined styling. Standard properties are reset to auto in that branch because non-auto values override pseudo-element styling ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-scrollbar)). The default outline has approximately 4.2:1 contrast against the background. Native hover transitions depend on browser/platform support.

Touch-capable devices, small screens and forced-colors mode retain system scrollbars. Reduced-motion users retain native scrolling without decorative progress animations.

The edge and navigation progress overlays, their refs, transform updates and styles have been removed. Navigation keeps its existing tracking for header visibility and active sections, including the end-of-page check. Lenis, native dragging, keyboard input, storytelling animations and anchor handling remain unchanged.

## Verification

Run `PLAYWRIGHT_MODULE=/path/to/playwright node tests/scrollbar.browser.mjs [baseURL]` with installed Chrome. Playwright's default scrollbar-hiding flag must be disabled to test the actual native thumb. The suite checks screenshot differences for hover and pressed feedback, real mouse dragging, absence of progress overlays during wheel/reverse input, pinned-section anchors, history/reload restoration, resize, Home/End, reduced motion, forced colors, mobile/touch desktops, and a case-study route. Native dragging must work; DOM scrolling alone is insufficient.

TypeScript, ESLint, all 26 unit tests, production build and static export pass. The browser suite passes against development and exported production sites. Existing cinematic interaction checks cover gallery controls, pinned transitions, focus restoration, keyboard access and reduced-motion fallbacks.

Chrome was available for execution. Safari access was unavailable through browser permissions; Firefox and Edge were not installed. These browsers were not directly tested; their native appearance and OS-specific hover behavior still need manual verification. No physical trackpad hardware was certified by automated wheel tests. macOS may hide native scrollbars according to the visitor's system preferences.
