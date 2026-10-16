# Erik Tran — developer portfolio

A personal portfolio connecting data science and software engineering.

## Status

Phase 1: foundation. Later sections, interactions, screenshots, and deployment are intentionally deferred until requested.

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

Use `@/` imports, semantic HTML, server components by default, and client components only for browser interactions. Colors, typography, spacing, radii, and motion values live in `globals.css`; Tailwind exposes the semantic tokens. System font stacks avoid external font requests during builds. The simple holding page exercises the foundation; it is not the final hero.

Add future projects to the typed data file and their real screenshots to `public/`. Keep unsupported URLs absent and screenshot arrays empty until assets are supplied. Do not invent achievements or model metrics.

## Development workflow

Implement only the explicitly requested phase. For each meaningful step: validate, review the diff, stage relevant files, commit descriptively, and push to `main`. Stop at the phase boundary. Deployment automation will be added in its own requested phase.

## Dependency audit

The initial full npm audit reports five high-severity development-tooling entries from the same `braces` dependency chain in `eslint-config-next`. npm suggests downgrading the Next.js lint configuration to 14.x; that incompatible downgrade has not been applied. Recheck upstream fixes before enabling CI. This tooling is not included in the static website runtime.
