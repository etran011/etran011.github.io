# Erik Tran — developer portfolio

A personal portfolio connecting data science and software engineering.

## Status

Phase 6: final sections complete. The portfolio includes a responsive contact section, a shared footer, page-specific search and sharing metadata, favicon variants, and accessibility improvements. Résumé downloads and the public PDF were removed at the user’s request. Deployment and further phases remain deferred until requested.

Target hosting: https://etran011.github.io/ (not deployed yet).

See [content audit](docs/content-audit.md) for verified source material and outstanding assets.

## Local development

Use Node.js 24 (`nvm use`) and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To validate:

```sh
npm run lint
npm run typecheck
npm run build
```

The build emits static HTML, CSS, and JavaScript in `out/`. Serve that directory with any static HTTP server; `next start` is not used for exported sites.

## Stack and hosting contract

Next.js App Router, React, strict TypeScript, Tailwind CSS via PostCSS, and ESLint. `next.config.ts` enables static export, trailing-slash routes, and unoptimized images. The user site lives at the domain root with no repository base path. `public/.nojekyll` preserves underscore-prefixed assets on GitHub Pages.

Static-export reference: [Next.js documentation](https://nextjs.org/docs/app/guides/static-exports). Tailwind setup: [official Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

GitHub Actions deployment and Pages activation are deferred to a deployment phase. The source repository is public; the target website is not yet live. Future project routes must use `generateStaticParams`; do not add request-time APIs or Server Actions.

## Project structure and conventions

- `src/app/`: App Router entry points and global styles.
- `src/components/ui/`: reusable layout and interface primitives.
- `src/data/portfolio.ts`: verified profile and project content.
- `src/types/portfolio.ts`: shared content contracts.
- `public/`: project screenshots, icons, and social sharing artwork.
- `docs/`: content provenance and development notes.

Use `@/` imports, semantic HTML, server components by default, and client components only for browser interactions. Colors, typography, spacing, radii, and motion values live in `globals.css`; Tailwind exposes the semantic tokens. Geist and Geist Mono are self-hosted through Fontsource, with system fallbacks. The hero uses CSS entrance animations and a bounded scroll timeline; Motion springs drive the cursor and ambient depth. Reduced-motion preferences disable these enhancements.

Add future projects to the typed data file and their real screenshots to `public/`. Keep unsupported URLs absent and screenshot arrays empty until assets are supplied. Do not invent achievements or model metrics.

## Development workflow

Implement only the explicitly requested phase. For each meaningful step: validate, review the diff, stage relevant files, commit descriptively, and push to `main`. Stop at the phase boundary. Deployment automation will be added in its own requested phase.

## Dependency audit

The initial full npm audit reports five high-severity development-tooling entries from the same `braces` dependency chain in `eslint-config-next`. npm suggests downgrading the Next.js lint configuration to 14.x; that incompatible downgrade has not been applied. Recheck upstream fixes before enabling CI. This tooling is not included in the static website runtime.


## Updating the project showcase

Edit `src/data/portfolio.ts` using the `Project` contract in `src/types/portfolio.ts`. Each project includes a unique URL-safe slug, category, dates, highlights, technologies, a featured flag, and structured case-study text. Add original screenshots to `public/images/projects/<slug>/` and record their real dimensions, descriptive alt text, and captions in the data file.

Cards, galleries, and `/projects/<slug>/` pages derive from the same data. Next.js generates all project routes at build time. Rebuild after adding a project. An empty screenshot list produces a text-led card and omits the gallery; optional repository and demo links are shown on case-study pages only when supplied.

Gallery selectors and arrow buttons work with touch or keyboard. Select Enlarge to open the modal viewer; use left/right arrows to change images and Escape to close. Focus returns to the opener. Card movement is restricted to fine pointers and disabled for reduced motion.

See [Phase 3 validation](docs/phase-3-validation.md) for tested routes and interactions.


## Updating professional background

Edit `src/data/background.ts` to update experience, education, skill categories, or About copy. Section components in `src/components/background/` render these typed records. Keep role dates, accomplishments, coursework, and skills aligned with the current résumé. The résumé is a private source document; no PDF or download link is published in the portfolio.

The experience timeline distinguishes the National Cyber League competition role through its organization label. Skills are grouped by function without proficiency ratings. About copy is grounded in the supplied brief and professional materials; no personal hobbies or unsupported credentials are added.

Navigation switches to a mobile disclosure below 1024px to fit the expanded section list. Education is also linked from About. All background content is server-rendered and readable without JavaScript.

See [Phase 4 validation](docs/phase-4-validation.md) for checks performed.


## Interaction behavior

The desktop cursor and project lighting follow fine-pointer movement. Scroll reveals run once per section mount and cancel when reduced motion is enabled or focus enters an animating section. Content stays visible without JavaScript.

Swipe horizontally across a project screenshot to change images. In the enlarged viewer, select Zoom screenshot to explore a larger image and Fit screenshot to reset it. Focus the zoomed image region to pan with keyboard arrows; elsewhere, arrows select screenshots. Escape closes the viewer and restores focus.

Navigation highlights the current section (Projects on case-study routes), displays reading progress, and animates mobile-menu entry. Reduced-motion preferences suppress entry and reveal animations.

See [Phase 5 validation](docs/phase-5-validation.md) for checks performed.

The cinematic interaction update adds a contextual desktop cursor, native browser scrolling, and three short scroll stories for the hero, About, and OptionLab. Mobile, reduced-motion, and accessibility fallbacks retain natural navigation and readable content. See [interaction behavior and validation](docs/cinematic-interactions.md) for implementation details and browser coverage.

The subsequent refinement makes the hero a minimal full-screen scene, reveals navigation on scroll, bounds visual story pacing, raises and animates the skill stack, and adds a shared atmospheric background. See [refinement behavior and validation](docs/animation-refinement-validation.md). Run `npm test` for the permanent timeline regression tests.

The latest [Selected Work pinning fix](docs/selected-work-pinning-validation.md) keeps its label, heading, description, and featured card in one sticky scene. It also simplifies hero copy, shortens the three scene distances, and removes buffered wheel input so scrolling remains continuous.


## Final sections and metadata

Contact links use the verified profile email, GitHub, and LinkedIn URLs from `src/data/portfolio.ts`. The Contact navigation item and hero CTA lead to `#contact`; the shared footer appears on home and case-study pages. No résumé download or phone number is published in current portfolio files. `.gitignore` prevents résumé PDFs from being added under `public/`.

`src/lib/site-metadata.ts` defines the production URL and shared social metadata. Case studies supply their own title, description, and canonical path. `src/app/sitemap.ts` derives static project URLs from the project data; `src/app/robots.ts` points to that sitemap. Update the site URL if the hosting domain changes. The social preview PNG is rendered from `public/social-card.svg`; the SVG favicon also has PNG and Apple touch variants.

Accessibility includes a skip link, semantic landmarks, visible focus, reduced-motion support, mobile navigation without JavaScript, and keyboard-operable screenshot viewers. Text can wrap at enlarged sizes, and selected screenshot controls retain an outline in forced-colors mode.

See [Phase 6 validation](docs/phase-6-validation.md) for test coverage and the outstanding GitHub cache removal follow-up.
