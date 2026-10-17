# Native scrollbar and page progress

The root scrollbar uses the existing blue accent and dark surface tokens. On fine-pointer desktop devices it has a 12px native hit area, a 6px rounded visible thumb, and brighter hover/pressed states. Firefox receives standard thin/color styling; engines exposing WebKit scrollbar selectors receive rounded pseudo-element styling. Standard properties are reset to auto in that branch because non-auto values override pseudo-element styling ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-scrollbar)). The default thumb color has approximately 4.0:1 contrast against the track. Native hover transitions depend on browser/platform support.

Touch-capable devices, small screens and forced-colors mode retain system scrollbars. Reduced-motion users retain direct position feedback without easing. The decorative one-pixel progress line is hidden on touch, small screens, print and forced-colors mode, is excluded from accessibility navigation, and cannot intercept input.

Both header and edge progress use the Navigation component's existing requestAnimationFrame-batched scroll/resize measurements and body ResizeObserver. Each reflects clamped scrollY / (scrollHeight - innerHeight), including pinned-section travel. There are no new listeners, React updates per frame, dependencies, timers or scroll controllers. Lenis, native dragging, keyboard input and anchor handling remain unchanged.

## Verification

Run `PLAYWRIGHT_MODULE=/path/to/playwright node tests/scrollbar.browser.mjs [baseURL]` with installed Chrome. Playwright's default scrollbar-hiding flag must be disabled to test the actual native thumb. The suite checks screenshot differences for hover and pressed feedback, real mouse dragging, progress during wheel/reverse input, pinned-section anchors, history/reload restoration, resize, Home/End, reduced motion, forced colors, mobile/touch desktops, and a case-study route. Native dragging must work; DOM scrolling alone is insufficient.

TypeScript, ESLint, all 26 unit tests, production build and static export pass. The browser suite passes against development and exported production sites. Existing cinematic interaction checks cover gallery controls, pinned transitions, focus restoration, keyboard access and reduced-motion fallbacks.

Chrome was available for execution. Safari, Firefox and Edge were not installed and were not directly tested; their native appearance and OS-specific hover behavior still need manual verification. No physical trackpad hardware was certified by automated wheel tests. macOS may hide native scrollbars according to the visitor's system preferences; the subtle progress line remains visible on eligible desktops.
