# Local animation initialization failure

## Confirmed cause

Next.js 16.4.2's development origin check rejected the loopback hostname used by the preview (`127.0.0.1`). The server was started with its default `localhost` hostname. Its log reported:

> Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1".

Chrome showed repeated failed WebSocket handshakes to `ws://127.0.0.1:3001/_next/hmr`. The development client never completed initialization: the scene retained only its server-rendered `data-scene` attribute, typing had no `data-typing` mode, and no WebGL program clock was running. The loader/typing watchdogs eventually exposed the readable static fallback. CSS-only effects could still run; the issue was not a universal CSS animation disablement.

This was reproduced outside the desktop app as well as inside its preview. The same development server worked at `http://localhost:3001/`, and the static export worked at `http://127.0.0.1:4173/`. Browser requestAnimationFrame advanced, the page was visible, reduced motion and forced colors were off in the normal-motion Chrome control, and WebGL context creation succeeded. No GSAP/ScrollTrigger or Lenis integration remains in this project. Natural scrolling and the independent native scroll observers were unrelated to this failure.

The app-update timing does not establish that the update caused the problem. The reproduced cause is the local development hostname restriction, rather than a broken GPU or individual animation components.

## Minimal repair

`next.config.ts` now explicitly includes `allowedDevOrigins: ["127.0.0.1"]`. This adds only the local preview alias; it does not allow arbitrary origins. The local development server restarted after the configuration change. Both local hostnames now receive the `turbopack-connected` handshake, hydrate their client components, cycle the terminal text and advance the WebGL shader clock.

This development-only option does not change the exported production bundle's appearance or motion. No animation speeds, geometry, component layouts, preferences, visibility handlers, scrolling or runtime dependencies were modified. The installed-version reference is `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md`.

## Environment comparison

| Environment | Before fix | After fix |
| --- | --- | --- |
| In-app preview, `127.0.0.1:3001` | Static fallback; no client initialization markers | WebGL playing, terminal cycling; no console errors |
| External Chrome, `127.0.0.1:3001` | Repeated rejected runtime WebSocket handshakes | Connected, hydrated, advancing shader clock |
| External Chrome, `localhost:3001` | Already working | Still working |
| Static export, `127.0.0.1:4173` | Already working | Production build/export retained |
| Public `https://etran011.github.io/` | Jekyll-rendered repository README, not this portfolio build | Deployment not changed by this local-runtime fix |

The public site has no portfolio animation components to verify. Publishing the generated portfolio is a separate deployment task; the investigation did not replace that public page or create a deployment workflow. Safari and physical devices were not tested.

## Regression coverage

`tests/dev-origin.browser.mjs` checks both local hostnames against an actual development server. It requires the runtime handshake, terminal cycle, WebGL initialization and an advancing shader clock, and fails on rejected WebSockets, browser console errors, runtime errors or hydration errors. Run it with `PLAYWRIGHT_MODULE=/path/to/playwright node tests/dev-origin.browser.mjs http://127.0.0.1:3001/`.

The existing rendered-browser suites verify first/return visits and refresh, loader handoff, typing/backspacing and caret, hero entrances, particle expansion/shrinking/reversal, mesh/trajectory/ring persistence, emitted energy and ring lighting, hidden-page pause/resume, context recovery, timeline activation/illumination/reveals, Tools hover/selection, cursor tracking/expansion/press, navigation and contact transitions, Education motion, keyboard controls, native scrolling and the auto-hiding scrollbar. Reduced-motion, forced-colors, touch and no-JavaScript fallbacks remain intentional.

TypeScript, ESLint, the 34 unit tests and production static export are also checked. Browser validation uses installed Chrome and the in-app preview; appearance and animation controllers are unchanged.

A 60ms scrollbar-reveal timing assertion failed once while several browser suites ran concurrently. The unchanged scrollbar suite passed when rerun alone, including immediate reveal, dragging and auto-hide; no scrollbar implementation or test thresholds were changed for this fix.

An isolated performance run after recovery measured approximately 60.5 model FPS, 16.7ms median / 16.8ms p95 frame intervals, high quality and five draws per frame at both Hero and Contact. The canvas remained capped at 2,400,692 pixels. No performance threshold or quality policy was changed.

The lifecycle suites simulate page visibility changes and verify pause/resume. A supplementary attempt to switch actual headed Chrome windows could not establish a hidden page: both windows reported `document.hidden === false` and focus simultaneously in this automation environment. Real background-tab switching therefore remains a manual verification item; the attempt did not justify changes to the site's visibility handlers.
