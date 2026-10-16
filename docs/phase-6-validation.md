# Phase 6 validation

## Implemented increments

- Added a responsive Contact section with the verified email, GitHub, and LinkedIn links. Main navigation and the hero CTA lead to the section, including from case-study pages.
- Honored the subsequent privacy instructions: removed all résumé download links, the public PDF, and its profile/type fields. The original private source document was not altered.
- With explicit user confirmation, purged the PDF from Git history and local Codex tree snapshots. All 28 commits existing at the time of the purge were preserved, with affected IDs rewritten. The current project tree remained identical, the old PDF blob was removed from local object storage, and the sanitized history was pushed with an explicit force-with-lease check.
- Added a shared footer with professional links, copyright, and a keyboard-focusable back-to-top destination on every page.
- Added canonical URLs, per-page Open Graph and Twitter metadata, a 1200 × 630 social image, SVG/PNG/Apple icons, and static sitemap/robots output.
- Corrected visible-label/accessibility-name mismatches, added screenshot-viewer keyboard instructions, protected control sizes in narrow dialogs, added no-JavaScript mobile navigation, improved forced-colors selected states, and fixed wrapping at enlarged text sizes.
- Added an ignore rule to prevent republishing résumé PDFs under `public/`.

## Testing

- `npm run lint`, `npm run typecheck`, and `npm run build` passed. The static export includes home, both case studies, the SVG icon, robots.txt, and sitemap.xml.
- Contact checks passed at 320, 390, 768, and 1440 pixels, including verified hrefs, active navigation state, cross-page anchor navigation, and no-JavaScript visibility.
- Footer checks passed on all three pages at those four widths, including one contentinfo landmark, footer navigation links, copyright, no horizontal overflow, and focus on main content after Back to top.
- Metadata checks passed on all pages for unique titles and descriptions, canonical URLs, Open Graph URLs/images, Twitter cards, and icon links. HTTP checks confirmed asset availability, expected PNG dimensions, three sitemap locations, and the robots sitemap URL. Sharing artwork was visually inspected.
- axe-core scanned 17 page/menu/viewer/zoom states at 320 and 1440 pixels with WCAG 2 A/AA, 2.1 A/AA, 2.2 AA, and best-practice tags: zero automated violations. Gradient, image, pseudo-element, and overlapping backgrounds produced manual contrast-review items. Calculated contrast against a conservative brightest header composite was 4.97:1 for muted text, 6.40:1 for accent text, and 13.21:1 for primary text; rendered states were spot-checked. This is not a full screen-reader or cross-browser conformance certification.
- Keyboard checks passed for skip-link visibility and focus, mobile-menu entry/Escape, modal focus containment and restoration, and at least 44 × 44 pixel dialog controls at 320 × 600. Forced-colors viewer controls were visually inspected.
- All three routes passed 200% root text sizing and custom text-spacing checks at 320 and 1440 pixels without page overflow or measured heading clipping. Mobile navigation and its Contact anchor also worked with JavaScript disabled.
- Existing regression checks passed for gallery arrows/wrapping/Escape/focus/scroll restoration, touch swipes, image zoom and keyboard pan, active-section navigation, reading progress, reduced-motion changes, and once-only scroll reveals.
- Route checks passed on all three pages at 320, 390, 768, and 1440 pixels: no browser errors or horizontal overflow, expected headings/anchors, direct reload, next-project links, and return navigation.
- Privacy checks found no phone-number matches in source, public assets, docs, or static export; no download/PDF/tel links remained on any route; the former local PDF URL and current GitHub branch URL returned 404.
- Ignore-rule and Git whitespace checks passed.

Tests used installed Chrome via Playwright against the production static export. Temporary harnesses, axe-core installation, and captures remain ignored in `tmp/`.

## Remaining issues and review

The historical raw PDF URL still returned HTTP 200 from GitHub after the confirmed history rewrite. GitHub Support is needed to purge unreachable server objects and cached views, as described in [GitHub’s sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository). A private request draft is saved locally in `tmp/github-privacy-removal-request.txt`; it is not committed, and no old commit IDs or historical raw URLs are published in these notes. No support request was sent.

Anyone with an existing clone should use the sanitized history rather than merge the old commits back into it. The current local repository and advertised GitHub branch contain no PDF.

Review Contact wording and the sharing artwork. Previously documented development-tooling audit findings remain outside this phase. GitHub Pages deployment and future phases remain deferred.
