# GitHub Pages deployment

- Account: `etran011`
- Public repository: `etran011/etran011.github.io`
- Website: https://etran011.github.io/
- Publishing source: GitHub Actions (replaces the legacy Jekyll branch build)
- HTTPS: enforced
- Production branch: `main`; existing history is preserved

The workflow in `.github/workflows/pages.yml` installs locked dependencies with Node.js 24, runs lint and unit tests, builds the Next.js static export, validates TypeScript, and checks exported routes, anchors, and local assets. Only the resulting `out/` directory is uploaded and deployed.

The deployment job uses the `github-pages` environment and GitHub's short-lived workflow identity. No separate deployment token or third-party hosting service is required. Deployments run serially and do not cancel an in-progress deployment.

## Releasing updates

Push reviewed changes to `main`, then check the **Deploy portfolio to GitHub Pages** workflow in Actions. Alternatively, choose **Run workflow** on `main`. A failed validation prevents publishing the new artifact.

Keep `output: "export"`, `trailingSlash: true`, and unoptimized images in `next.config.ts`. This is a user site at the domain root, so no repository-name base path is needed. `public/.nojekyll` is included in the export. Server-only routes, runtime secrets, and a Node.js server are not part of this hosting setup.

To undo a released source change, create a normal revert commit and push it to `main`; do not rewrite public history.

## Live verification

After deployment, check the home page, direct entry to both project case studies, gallery image loading and enlargement, home/section navigation, mobile layouts, and the themed 404 page. Confirm HTTPS, favicon, robots.txt, and sitemap.xml resolve.

The automated production browser checks accept the live URL:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node tests/project-navigation.browser.mjs https://etran011.github.io
PLAYWRIGHT_MODULE=/path/to/playwright node tests/cursor.browser.mjs https://etran011.github.io
```

