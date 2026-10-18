# Editorial About introduction

About now answers who Erik is, what he enjoys working on and why he likes practical projects in two short paragraphs. The existing résumé and supplied interests support the copy; no new achievements, employers or personal history were invented. William & Mary is mentioned briefly. Graduation/GPA, employment bullets, technology inventories and individual project descriptions remain in their dedicated sections.

The four-island Markdown composition has been replaced with one borderless introduction. There is no filename, path breadcrumb, artificial line number, gutter, syntax decoration, stat grid or terminal UI in About. The former chapter data/types and editor-only styles are removed. The shared reveal selector no longer references the retired editor heading class; other reveal behavior is unchanged.

A small label precedes a two-column editorial layout. The heading and prose share a top edge on wide screens. The heading has a brighter secondary tone derived from existing theme colors, and the body uses 18px text with 1.8 line height, paragraph spacing and a 60ch maximum measure. At 1100px and below the layout stacks; mobile body text is 17px. Padding is content-driven and there is no fixed height or empty placeholder visual. The one 96% dark translucent surface protects reading while the existing sculpture remains visible around it. The existing project CTA remains.

The unified composition uses the existing once-only quiet entrance. It remains readable before JavaScript, starts no lower than 0.92 opacity during motion, never fades out on scrolling and skips decorative motion for reduced-motion/forced-colors preferences. No new animation controller, pinning, wheel handling or scroll smoothing was added. Hero typing/loading, cursor, scrollbar, navigation, background renderer, timeline, Education, Tools and Contact were not redesigned.

## Validation

- TypeScript, ESLint, 34 unit tests and the production static export pass. Home, both case studies and `.nojekyll` remain available for GitHub Pages.
- `tests/about-readability.browser.mjs` covers 320, 390, 768, 1024, 1280, 1440 and 1920px: one composition, two paragraphs under 90 words, absence of editor chrome/redundant metrics, aligned desktop columns, separated stacked content, comfortable font sizes and AA contrast of at least 4.5:1 even over a conservatively simulated fully white backdrop.
- Workspace/layout checks preserve Contact alignment, Tools dimensions, natural section flow, project galleries and case studies at 200% text size. Axe and fallback checks cover mobile, no JavaScript, touch, forced colors and reduced motion.
- Cinematic, native scrolling and particle regressions exercise entrance behavior, native anchor focus, complete wheel distance, reversal, persistent geometry/rings, smaller expanded particles, idle clocks, buffer reuse, context restoration and hidden-page pauses.
- Chrome desktop and mobile screenshots reviewed; live Next.js preview remains available. Safari, Firefox, Edge and physical-device checks were not run.

The previously documented local ~30 FPS browser cadence limitation remains outside this About-only change. No renderer or animation speeds were changed.
