# Data particle atmosphere

The Gaussian density surface refines the existing shared particle system without changing the portfolio's content, palette, fonts, section layouts, navigation, custom cursor, or weighted scrolling. Particles sample a standard bivariate Gaussian probability density on the open side of the hero. Three closed contours and eight meridians expose its recognizable bell silhouette. The first scroll releases those same observations into a viewport-wide field, then reverse scrolling draws them back into formation.

## Mathematical formation

The horizontal coordinates are measured in standard deviations. The sampled function is the normalized bivariate Gaussian PDF, `f(x,z) = exp(-(x² + z²)/2) / (2π)`. Display height is scaled by its peak so the mathematical surface is legible in the hero; it is not a separately invented shape. Nonlinear radial sampling concentrates observations around the peak without increasing the total particle count.

There are 48 azimuths and 26 radii. Three radii are exactly 1σ, 2σ and 3σ, with heights proportional to `exp(-1/2)`, `exp(-2)` and `exp(-9/2)`. The fine closed contours therefore represent real equal-density levels. No equations or decorative scientific labels are displayed over the page.

A 1.2% shared height modulation keeps every sample on the same bell profile. Slow azimuth rotation and bounded pitch/roll changes reveal depth without introducing independent positional wobble. Density-weighted shading emphasizes the summit, while softer tails and foreground shading protect the typography. Dispersed particle destinations, drift, pointer response, and scroll pacing remain unchanged.

## Architecture

- `src/lib/atmosphere-geometry.ts` generates deterministic Gaussian coordinates, stable particle identities, stratified viewport destinations, equal-density contours, and meridians. Quality tiers retain exact identities rather than generating a new cloud.
- `src/lib/atmosphere-view.mjs` shares the rest view and camera distance across the shader, scene profile, static projection, and SVG generator.
- `src/lib/atmosphere-renderer.ts` renders original GLSL with native WebGL 1. Two batched draws use static interleaved buffers; vertex shaders handle deformation, curved dispersal, drifting depth layers, pointer repulsion, and parallax. Links fade before they can stretch into distracting lines. Expanded depth no longer depends on the rotating formation.
- `ScrollStory` publishes its existing **paced** hero progress through `story-progress`. The atmosphere consumes that value; it adds no wheel handler, scroll controller, or pinning behavior. Short desktop viewports use the existing shared Motion observer's natural document progress instead.
- `src/lib/particle-transition.ts` adds bounded, reversible catch-up. An offscreen story settling, a large wheel delta, an anchor jump, or a keyboard jump cannot teleport particles. There is no irreversible “has scrolled” flag.
- `use-data-particles.ts` owns the persistent renderer and one animation loop. Pose, expansion, and pointer values live outside React state. Local repulsion fades in after mouse movement and eases away on pointer departure or blur.
- `AmbientBackground` caches section measurements and reads the existing About story and Skills selection signals. A single canvas persists through client navigation.

No new runtime dependencies, textures, downloaded models, post-processing passes, or per-frame geometry uploads are needed. Formation and dispersed positions are blended in the shader, so the particle system does not allocate hundreds of DOM elements or run CPU particle simulations.

## Section treatment

| Context | Treatment |
| --- | --- |
| Hero | Gaussian bell surface, coherent breathing and slow rotation; expansion follows the pinned story |
| About | Shared expanded points drift across the viewport; story signals remain available to the scene |
| Projects | Much lower opacity and point emphasis so screenshots remain dominant |
| Skills | Collection selection gently increases point emphasis |
| Experience, education, contact, case studies | Restrained ambient field with reduced rendering cadence |

The canvas spans the viewport after expansion. Before expansion, shader shading protects the hero text area. All layers are decorative, `aria-hidden`, and `pointer-events: none`. Existing controls retain normal hit testing and focus behavior.

## Budgets and fallbacks

High / medium / low tiers contain 1,248 / 624 / 416 points, with fewer than 72 KB of vertex data at the highest tier. Core-count and data-saving hints choose an initial tier. Sustained frame pressure lowers density before cadence, with no upward oscillation. Projects and quiet sections render at 30 FPS; capable desktop hero/About/Skills scenes target 60 FPS.

Pixel ratios cap at 1.5 / 1.25 / 1. Back buffers cap at approximately 2.4 million pixels and 4096 pixels per dimension. Resize work occurs only when needed. Hiding the tab stops rendering and resets its frame clock. Disposal releases buffers, shaders, programs, listeners, and pending frames.

Mobile/touch and reduced-motion visitors receive a simplified static vector with 416 points, closed sigma contours, and no GPU initialization, continuous movement, or scroll expansion. On mobile the static bell is framed above the headline. Forced colors hide decorative layers. The vector is in server-rendered HTML and also works with JavaScript disabled, unavailable WebGL, or context loss. A complete WebGL frame hides the fallback; successful context restoration rebuilds one renderer. Preference changes are checked both through events and inside the render loop.

Regenerate the vector after changing formation geometry:

```sh
node --experimental-strip-types scripts/generate-atmosphere-fallback.mjs
```

## Verification

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Thirteen unit tests cover Gaussian heights and symmetry, exact sigma radii, closed contours at all quality tiers, stable quality subsets, bounded GPU data, destination coverage, static projection, scene restraint, adaptive frame budgets, reversible expansion, and the existing story pacer.

An optional Chrome integration check runs against the dev server or the exported site. It requires an available Playwright installation and Chrome, without adding a portfolio runtime dependency:

```sh
# Omit PLAYWRIGHT_MODULE when playwright is already resolvable in your environment.
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/particles.browser.mjs http://127.0.0.1:4173
```

This exercises first-scroll expansion, fast reversal and return to top, mouse interpolation, custom cursor coexistence, About/Selected Work pinning, quiet Projects, hidden-tab pause, real WebGL context loss/restoration, live reduced-motion changes, 320/390-pixel mobile views, no-JavaScript, and unavailable-WebGL fallbacks. Static modes also assert zero GPU initialization; reduced motion checks that decorative layers remain stationary after anchor navigation.

The Gaussian production sample at 1440×1000, device scale factor 2, ran at approximately 30 FPS after adaptive density reduction. A separate comparison measured the same 33.3 ms median and 33.4 ms 95th-percentile RAF intervals on both an idle blank page and the Gaussian page, indicating browser/environment scheduling rather than an observed frame-cadence regression from this geometry. The Gaussian renderer's CPU submission time (not GPU completion) was at most 0.1 ms at the 95th percentile in that comparison. The 60 FPS target is unchanged, but this run does not establish 60 FPS on other hardware.

Quiet sections used 60 draw calls per second (two calls per frame). A 2560×1440 resize stayed within budget at 2066×1162 backing pixels with no GL error. Simulated sustained pressure reached low quality, and data-saving mode started at low quality. Results describe this machine and sample, not a hardware-wide guarantee.

Additional existing browser regressions check weighted wheel distances, anchors and keyboard navigation, forward/reverse Selected Work stages, About readability, gallery dialogs, cursor lifecycle, and technology selection. Visual review should include a slow first scroll, a fast jump to About and back, and a mobile/reduced-motion view. GitHub Pages continues using Next.js static export with local SVG assets and no server runtime.
