# Phase 2: core design

Implemented in six separate feature commits, each built and pushed before continuing:

1. Self-hosted Geist and Geist Mono; global type conventions and design dependencies.
2. Dark surfaces, button states, focus styles, and shared controls.
3. Sticky responsive navigation with a mobile disclosure menu.
4. Editorial hero and original abstract SVG illustration (not project data).
5. Staggered entrances and restrained pointer motion, disabled for reduced motion.
6. GitHub/email CTAs, LinkedIn, and the supplied résumé download.

## Validation

- ESLint, strict TypeScript, and Next.js production static export pass.
- Chrome checks at 320, 390, 768, and 1440 pixels: no horizontal overflow, missing assets, console errors, or uncaught page errors.
- Local Geist fonts load; anchor targets resolve; email destination matches supplied contact information.
- PDF download succeeds at all four widths. The original supplied PDF is preserved.
- Mobile menu open, Escape dismissal, link dismissal, and desktop visibility pass.
- Pointer movement produces a bounded transform on desktop; reduced-motion mode produces none. Headline remains visible.
- Static content remains available with JavaScript disabled.
- Final desktop and narrow-mobile screenshots visually inspected.

Navigation currently exposes Home, GitHub, and Contact. Links to project, experience, skills, and about sections will be added when those sections exist. No placeholder section links were introduced. GitHub Pages deployment remains deferred to its requested phase.

The existing development-only dependency audit findings remain documented in README.
