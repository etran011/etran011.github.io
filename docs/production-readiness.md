# Phase 8 production readiness

Validated the local production export on October 20, 2026.

## Changes

- Gallery selectors include their visible mobile numbers in accessible names.
- A themed 404 page provides a main landmark, working skip target, and return link.
- PlatePredict's landing screenshot uses responsive preview sources. Original PNG and full-resolution WebP remain unchanged; enlargement loads the full-resolution image.
- Added export integrity verification and an independent finite-difference check of the visualization's analytical gradient.

## Reproducible checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run check:export
python3 -m http.server 4174 --directory out
```

Browser tests use an externally available Playwright installation and Chrome. Set `PLAYWRIGHT_MODULE` to its module path; accessibility checks also use `AXE_MODULE` pointing to `axe-core/axe.min.js`. Run browser suites sequentially against the completed export, without rebuilding during a run.

```sh
node tests/production-accessibility.browser.mjs http://127.0.0.1:4174
node tests/responsive-images.browser.mjs http://127.0.0.1:4174
node tests/project-preview.browser.mjs http://127.0.0.1:4174
node tests/hero-navigation.browser.mjs http://127.0.0.1:4174
node tests/project-navigation.browser.mjs http://127.0.0.1:4174
node tests/header-navigation.browser.mjs http://127.0.0.1:4174
node tests/atmosphere-performance.browser.mjs http://127.0.0.1:4174
```

## Results and scope

- TypeScript, ESLint, production build, and 36 unit tests passed.
- Export validation covered six HTML files and 289 local references, including anchors, scripts, styles, image sources, required routes, and `.nojekyll`.
- Automated accessibility checks reported no violations across home, both case studies, and 404 at 320, 390, 768, and 1440 pixels. Keyboard skip links, dialog focus restoration, 200% text sizing, and every project gallery image passed.
- Preview tests covered four viewport/pixel-density combinations; shared framing and hover behavior passed at six widths from 320 to 1920 pixels.
- Navigation passed repeated project returns, browser history, direct entry, refresh, rapid navigation, visibility pause/resume, and reduced motion without console or runtime errors. Hero CTA scrolling, interruption, no-JavaScript fallback, and header alignment/visibility passed desktop and mobile checks.
- Fixed a browser-test sampling race by capturing the terminal's hold state and character count in the same frame. The full navigation suite then passed; application animation logic was unchanged.
- The 640-pixel preview is 200,912 bytes versus 2,920,198 bytes for the original; the 1280-pixel preview is 685,390 bytes. Full-resolution enlargement is deferred until requested.
- Local Chrome rendering measured approximately 60 FPS and 16.7–16.8 ms p95 frame intervals at home and Contact. The existing 2.4-megapixel rendering cap remains intact. These are local measurements, not guarantees for all hardware.
- Calculation tests cover portfolio gradient-descent math and animation behavior. The separately hosted OptionLab and PlatePredict applications are outside this repository's test scope.
- Safari, Firefox, physical mobile devices, and the live GitHub Pages deployment were not tested in this audit. Static export compatibility was verified locally; deployment settings were not changed.
- The existing Node test-runner module-type warning is non-fatal. Pre-existing `next-env.d.ts` and untracked `AGENTS.md` changes were preserved.
