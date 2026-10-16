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
