# About storytelling and cursor behavior

## About narrative

The three chapters in `src/data/background.ts` connect Erik's background, actual projects, and approach to making technical work understandable. OptionLab and PlatePredict are the verified project references. Attribution retains the distinction between the Python backend and reviewed AI-assisted frontend. Private source documents are not published.

The composition pairs an editorial heading and Learn / Build / Explain path with three open narrative bands. All chapter text and project links remain visible throughout. The path, headline emphasis, chapter rules, and text emphasis share `ScrollStory`'s existing bounded visual timeline. No additional wheel handler, scroll interception, timer, or per-frame React state was introduced.

About retains the existing maximum 360-pixel sticky travel. Pinning requires a precise desktop pointer, sufficient viewport height, normal text size, and a composition that fits beneath the navigation. The shared pacer limits visual speed and handles reverse progress. Mobile, touch, reduced motion, forced colors, enlarged text, and JavaScript-disabled views retain normal readable document flow. The journey columns reflow with text size.

## Cursor diagnosis and fix

Before the fix, the cursor effect depended on the pathname. Its cleanup removed the native-cursor suppression flag on every client-side route change; its replacement waited for another pointer event. This was reproduced by opening an OptionLab case study and leaving the pointer stationary: the root flag and visible cursor flag disappeared and the computed native cursor returned to `auto`. The global descendant cursor-hiding rule was already present, so adding more `cursor: none` rules would not address that lifecycle reset.

The old visibility handler also hid on both visibility transitions without a corresponding restoration handler. The persistent controller now refreshes its target on route changes, scroll, focus, visibility, and resizing. Scroll refreshes use a coalesced animation frame and inspect the element under the last known pointer position. The exact dot is positioned synchronously before the native cursor is hidden; only the decorative ring uses a spring.

The cursor visual never receives pointer events. Initialization checks the connected dot's rendered width; native behavior remains available if initialization fails. Cleanup removes listeners and pending frames. Text selection, editable inputs, dialogs, keyboard use, touch, reduced motion, and forced colors retain native interaction. Cursor state changes do not require React renders.

## Regression verification

Validation on October 16, 2026 used Chrome browser automation against the production static export, plus the live in-app browser for visual review:

- TypeScript, ESLint, production build, and all three existing timeline unit tests pass. The test runner retains its existing informational module-type warning.
- About content checked at 320, 390, 768, 1024, 1280, and 1440 pixels; no horizontal overflow.
- Axe audit and 200% text checks passed at 320, 390, 768, 1024, and 1440 pixels. No-JS and forced-colors views expose all three chapters.
- Desktop scenes at 1440×1000, 1440×900, and 1280×800 keep every chapter within the viewport through all forward and reverse stages. Pin entry/release and document height remain stable. A large delta traverses each visual stage.
- Cursor checks cover navigation, buttons, project cards, galleries, Skills controls, contact links, ordinary text, stationary-pointer route changes, rapid movement, resizing, selection, editable input, modal close, forced colors, reduced motion, touch, and failed initialization.
- Focus/blur and window leave/re-entry handlers were exercised. Headless tab activation does not reliably produce real OS focus changes; focus restoration was verified through explicit lifecycle events rather than treating headless tab activation as proof.
- Cursor DOM remains singular across routes, and the settled cursor produces zero idle attribute writes.
- Home and both case-study pages load directly at 320, 390, 768, and 1440 pixels, with working case-study navigation and no runtime errors. The export includes `.nojekyll` and static case-study HTML. Privacy checks confirm no public résumé download or phone links.

For a manual smoke test, scroll About forward and backward, use its project links without moving the pointer after activation, return from a case study, open and close the screenshot viewer, select ordinary text, then tab through controls. Move the pointer outside the window and return; switch away from and back to the browser. Native pointer behavior should appear only in the documented fallback and editing contexts.

## Minimal cursor hover behavior

The cursor contains only a 4px dot and a hollow 24px ring with the existing 1px accent border. Enabled semantic controls expand the ring to 40px (1.67×) over 240ms ease-out; leaving contracts it with the same transition. No text renderer, contextual label attributes, opaque fills, or per-component cursor states remain. Semantic links, buttons, interactive roles, and native details summaries share the effect. Disabled controls (including disabled fieldsets and ARIA-disabled ancestors), inert controls, and decorative elements do not activate it. Native editing and accessibility fallbacks still take priority.

Viewport translation remains on `.cursor-position`; hover dimensions and the existing 0.85 press scale stay on its nested `.cursor-ring`. Spring settings and pointer lifecycle handlers are unchanged. `tests/cursor.browser.mjs` checks transparent default/hover states, dimensions, transitions, nested SVG/text targets, disabled/decorative targets, rapid changes, real navigation/gallery/technology/contact interactions, click-center regression, and touch/reduced-motion/forced-colors fallbacks against the static export.
