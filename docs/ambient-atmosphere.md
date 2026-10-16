# Data particle atmosphere

The latent-space sculpture refines the existing shared particle system without changing portfolio content, palette, fonts, layout, navigation, custom cursor, or weighted scrolling. Four differently shaped clusters form one synthetic computational structure on the open side of the hero. Local relationships and a few boundary links join the sculpture. Scrolling separates the clusters, fades their connections, and releases the same observations into a viewport-wide field. Reversing scroll reconstructs their deterministic positions.

## Mathematical formation

This is a **synthetic mathematical visualization**, not actual PCA, UMAP, or neural-network output. A weighted mixture assigns 38% / 28% / 21% / 13% of the observations to four components. A low-discrepancy assignment keeps every component represented even when quality removes two thirds of the particles.

Deterministic Box–Muller sampling supplies normally distributed local coordinates. Rejection conditions the samples on a Mahalanobis radius of 2.8, so the model is a truncated Gaussian mixture rather than an unbounded distribution. Each component has a different center, a full-rank Cholesky factor (`covariance = L·Lᵀ`), and a rotation. Small nonlinear bends produce organic silhouettes. Shading uses each observation's relative component density; it is not presented as a measured embedding probability.

A radius-sized spatial hash searches 27 neighboring cells for the two closest observations within 0.26 model units, using one eighth of the retained points as anchors. Three intended component relationships connect their nearest boundary samples rather than arbitrary centroids. Duplicate links are removed. The resulting high / medium / low tiers have 304 / 153 / 105 links. Unit tests compare local searches with a brute-force nearest-neighbor oracle.

Each component shares gentle bounded drift and breathing. Slow bounded rotation preserves the composition; tiny local fluctuations do not erase cluster boundaries. Fine connection pulses remain restrained. The existing cursor interpolation, repulsion, parallax, and viewport-wide ambient destinations are retained.

## Reversible scroll sequence

The existing paced hero progress still drives the renderer, with bounded catch-up for large jumps. `resolveParticleChoreography` writes three values into a reused object:

1. Clusters loosen and move slightly away from the sculpture's center.
2. Connection opacity fades between progress 0.06 and 0.36.
3. Individual release begins at 0.18 and finishes at 0.98, with a small deterministic departure stagger.
4. Curved paths carry the observations into their existing ambient destinations.

The same functions run in reverse; there is no irreversible expansion flag or regenerated random layout. Connections return as the clusters reform. The fully dispersed field uses only the points draw, so invisible connections consume no rendering pass.

## Architecture

- `src/lib/atmosphere-geometry.ts` generates deterministic mixture coordinates, stable particle identities, stratified viewport destinations, and sparse nearest-neighbor relationships. Quality tiers retain exact identities rather than generating a new cloud.
- `src/lib/atmosphere-view.mjs` shares the rest view and camera distance across the shader, scene profile, static projection, and SVG generator.
- `src/lib/atmosphere-renderer.ts` renders original GLSL with native WebGL 1. At most two batched draws use static interleaved buffers; vertex shaders handle deformation, curved dispersal, drifting depth layers, pointer repulsion, and parallax. Links fade before they can stretch into distracting lines. Expanded depth no longer depends on the rotating formation.
- `ScrollStory` publishes its existing **paced** hero progress through `story-progress`. The atmosphere consumes that value; it adds no wheel handler, scroll controller, or pinning behavior. Short desktop viewports use the existing shared Motion observer's natural document progress instead.
- `src/lib/particle-transition.ts` adds bounded, reversible catch-up. An offscreen story settling, a large wheel delta, an anchor jump, or a keyboard jump cannot teleport particles. There is no irreversible “has scrolled” flag.
- `use-data-particles.ts` owns the persistent renderer and one animation loop. Pose, expansion, and pointer values live outside React state. Local repulsion fades in after mouse movement and eases away on pointer departure or blur.
- `AmbientBackground` caches section measurements and reads the existing About story and Skills selection signals. A single canvas persists through client navigation.

No new runtime dependencies, textures, downloaded models, post-processing passes, or per-frame geometry uploads are needed. Formation and dispersed positions are blended in the shader, so the particle system does not allocate hundreds of DOM elements or run CPU particle simulations.

## Section treatment

| Context | Treatment |
| --- | --- |
| Hero | Latent-space clusters, coherent drift and bounded rotation; expansion follows the pinned story |
| About | Shared expanded points drift across the viewport; story signals remain available to the scene |
| Projects | Much lower opacity and point emphasis so screenshots remain dominant |
| Skills | Collection selection gently increases point emphasis |
| Experience, education, contact, case studies | Restrained ambient field with reduced rendering cadence |

The canvas spans the viewport after expansion. Before expansion, shader shading protects the hero text area. All layers are decorative, `aria-hidden`, and `pointer-events: none`. Existing controls retain normal hit testing and focus behavior.

## Budgets and fallbacks

High / medium / low tiers contain 1,248 / 624 / 416 points, with fewer than 110 KB of vertex data at the highest tier. Core-count and data-saving hints choose an initial tier. Sustained frame pressure lowers density before cadence, with no upward oscillation. Projects and quiet sections render at 30 FPS; capable desktop hero/About/Skills scenes target 60 FPS.

Pixel ratios cap at 1.5 / 1.25 / 1. Back buffers cap at approximately 2.4 million pixels and 4096 pixels per dimension. Resize work occurs only when needed. Hiding the tab stops rendering and resets its frame clock. Disposal releases buffers, shaders, programs, listeners, and pending frames.

Mobile/touch and reduced-motion visitors receive a simplified static vector with 416 points and simplified neighbor links, and no GPU initialization, continuous movement, or scroll expansion. On mobile the static sculpture is framed above the headline. Non-scaling strokes keep its reduced-density points and connections legible when the SVG shrinks. Forced colors hide decorative layers. The vector is in server-rendered HTML and also works with JavaScript disabled, unavailable WebGL, or context loss. A complete WebGL frame hides the fallback; successful context restoration rebuilds one renderer. Preference changes are checked both through events and inside the render loop.

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

Fifteen unit tests cover deterministic truncated sampling, mixture weights at every quality tier, anisotropic components, spatial-hash neighbor correctness, stable identities, bounded GPU buffers, destination coverage, projection, scene restraint, adaptive budgets, staged reversible release, and the existing story pacer.

An optional Chrome integration check runs against the dev server or the exported site. It requires an available Playwright installation and Chrome, without adding a portfolio runtime dependency:

```sh
# Omit PLAYWRIGHT_MODULE when playwright is already resolvable in your environment.
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/particles.browser.mjs http://127.0.0.1:4173
```

This exercises cluster separation before particle release, omission of invisible GPU line draws, first-scroll expansion, fast reversal and return to top, mouse interpolation, custom cursor coexistence, About/Selected Work pinning, quiet Projects, hidden-tab pause, real WebGL context loss/restoration, live reduced-motion changes, 320/390-pixel mobile views, no-JavaScript, and unavailable-WebGL fallbacks. Static modes also assert zero GPU initialization; reduced motion checks that decorative layers remain stationary after anchor navigation.

The production Chrome sample at 1440×1000 and device scale factor 2 measured approximately 30 FPS after automatic density reduction, with median / 95th-percentile frame intervals of 33.3 / 33.4 ms. This matches the preceding Gaussian implementation's measurement in this environment, where an idle blank page also measured the same cadence. It does not establish a 60 FPS hardware benchmark. The 60 FPS target remains, with density/cadence adaptation for slower devices.

Quiet expanded sections issued 30 draw calls per second, one points pass per frame rather than the previous two passes. A 2560×1440 resize stayed within the 2.4-million-pixel cap at 2066×1162 backing pixels with no GL error. Sustained synthetic frame pressure reached low quality without losing the model; data-saving mode started at low quality. Static export includes the local fallback and both case-study routes.

Additional existing browser regressions check weighted wheel distances, anchors and keyboard navigation, forward/reverse Selected Work stages, About readability, gallery dialogs, cursor lifecycle, and technology selection. Visual review should include a slow first scroll, a fast jump to About and back, and a mobile/reduced-motion view. GitHub Pages continues using Next.js static export with local SVG assets and no server runtime.
