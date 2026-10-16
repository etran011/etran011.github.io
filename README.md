# Erik Tran — developer portfolio

A personal portfolio connecting data science and software engineering.

## Status

Phase 3: project showcase complete. Includes the core design, reusable project cards, featured layouts, original OptionLab screenshots, accessible galleries, hover interactions, and statically exported OptionLab and PlatePredict case studies. Additional sections and deployment remain deferred until requested.

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
- `public/`: future screenshots and downloadable assets.
- `docs/`: content provenance and development notes.

Use `@/` imports, semantic HTML, server components by default, and client components only for browser interactions. Colors, typography, spacing, radii, and motion values live in `globals.css`; Tailwind exposes the semantic tokens. Geist and Geist Mono are self-hosted through Fontsource, with system fallbacks. The hero uses CSS entrance animations and Motion springs for subtle pointer response; reduced-motion preferences disable both.

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
