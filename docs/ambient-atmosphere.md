# Gradient descent particle landscape

The hero uses a particle sampling of Himmelblau's loss landscape, a visible optimization trail, one moving optimization point, and three sparse coordinate rings. It retains the portfolio's palette, typography, layout, weighted scrolling, pinned scenes, cursor, navigation, and project presentations. The same landscape particles disperse into a smaller ambient field and reconstruct on reverse scroll.

## Mathematics

The objective is `f(x,z) = (x² + z − 11)² + (x + z² − 7)²`, sampled over `[-4.2, 4.2]²`. Its four basins attain the global value zero; the visualization does not claim there is one unique global minimum.

Its analytic gradient is:

- `∂f/∂x = 4x(x² + z − 11) + 2(x + z² − 7)`
- `∂f/∂z = 2(x² + z − 11) + 4z(x + z² − 7)`

Display height is `0.5 log(1 + f/16) − 0.85`, with horizontal coordinates scaled by 0.31. This monotone height compression makes the valleys legible. **Optimization uses the original objective, not the compressed display height.** Analytic display normals provide restrained lighting; the structured surface does not undergo an arbitrary idle deformation.

`loss-landscape.mjs` precomputes actual gradient descent from `(0.6, 3.8)`. Each update is `p_next = p − α∇f(p)`, starting with `α = 0.004`. This lies below the reciprocal Hessian row-sum bound on the domain. Domain checks and [Armijo backtracking](https://optax.readthedocs.io/en/latest/api/generated/optax.scale_by_backtracking_linesearch.html) halve the rate if sufficient decrease is not met. The default run takes 192 updates and converges to `(3, 2)` with loss below `10⁻¹²`. Other starting basins converge to their own minima in tests.

Playback retimes the precomputed parameter-space segments by distance, then re-evaluates the exact display height. The thin trail therefore follows the surface instead of cutting through it. It does not fabricate a decorative optimization curve. The marker has a compact bright core and a soft halo. The revealed trail fades behind it; a distance-based light illuminates nearby surface samples. A restrained radial light pulse appears near the minimum without displacing the mathematical geometry. The marker reaches the minimum, holds, fades to zero, and only then restarts. Reduced motion shows a static trail and endpoint.

## Geometry and rendering

- `loss-landscape.mjs`: objective, analytic gradient, display height/normals, descent solver, and playback.
- `atmosphere-geometry.ts`: a 48 × 26 deterministic sampling grid, stable identities, ambient destinations, sparse parameter-neighbor links, and the static trajectory buffer.
- `atmosphere-rings.ts`: three open coordinate ellipses, differently tilted and sized, with sparse ticks; one deterministic buffer under 40 KB.
- `atmosphere-view.mjs`: shared resting view and camera for WebGL and the SVG generator.
- `atmosphere-renderer.ts`: native WebGL 1 and original GLSL, with static buffers and no per-frame geometry upload.
- `particle-transition.ts`: bounded expansion catch-up and reversible release, connection opacity, loosening, and shrinking.
- `use-data-particles.ts`: one persistent renderer, one frame loop, pointer easing, adaptive quality, lifecycle handling, and no per-frame React state.

There are 1,248 / 624 / 416 landscape points at high / medium / low quality. Each quality tier retains the exact identities of its samples. Connections follow adjacent surface parameters; there are no unrelated nearest-neighbor cluster links. The trajectory uses one additional static buffer; its marker reuses the same buffer with a position uniform. The rings use one additional static buffer. There are four live GPU buffers, cleaned up on disposal. The hero uses at most five batched draws; fully dispersed sections use one points draw.

All three rings are batched into one lines draw, with different slow angular speeds and a faint traveling highlight. Depth and a left-side mask keep them subordinate to the surface and text. Invisible rings issue no draw; fully expanded particles skip trajectory illumination calculations.

No new runtime library, mesh texture, downloaded model, or post-processing pass is required. All layers remain decorative, `aria-hidden`, and `pointer-events: none`.

## Scroll, size, and idle motion

The existing paced hero `story-progress` event still drives the animation. No additional wheel handler, scroll controller, or pinning system was added. Short desktop viewports continue using the shared Motion observer's natural section progress.

1. The prominent loss surface, coordinate rings, and trajectory remain coherent at the top.
2. Early progress expands the rings and adds a bounded rotation offset. This accelerates them during scroll without multiplying active time by changing progress (which would jump). Samples loosen along their surface normals as connections and trajectory fade.
3. Ring arcs develop fine angular gaps and slight geometric separation before fading completely. Their opacity persists beyond the surface links. Deterministic curved paths disperse the samples into the viewport.
4. A smooth shrinking value follows particle release: formation points are approximately 5–6 CSS pixels before perspective; ambient points are approximately 1.15–1.8 CSS pixels.
5. Reversing the same progress restores ring fragments into intact arcs along with particle size, structure, connections, and trajectory. No irreversible expansion flag or new random layout is used.

### Deliberate storytelling, natural input

The underlying sensitivity came from short scene travel (600 px hero, 360 px About, 480 px Selected Work at a 1000 px viewport), not an excessive Lenis multiplier. `story-travel.ts` now allocates:

| Sequence | Viewport-height factor | Maximum travel |
| --- | --- | --- |
| Hero departure | 1.25 | 1200 px |
| About chapters | 1.05 | 1000 px |
| Selected Work | 1.15 | 1100 px |

Travel scales down on smaller eligible desktops and remains capped on large monitors. A 60 px input now represents 5% of the hero timeline rather than 10%. The visual pacer limits motion to 1.8 chapter intervals/second (previously 2.6), smooths velocity over 90 ms (previously 55), and converges with gain 9 (previously 12). Its bounded elapsed time prevents a delayed frame from skipping the sequence. Reversal uses the same integrator.

Lenis remains the sole input controller, with wheel multiplier 1, lerp 0.115, and native touch. No input is discarded, queued, or held until an animation completes. Ordinary content retains its previous motion. Keys interrupt smoothing, anchors preserve destination/focus, and deliberate navigation can leave a scene without waiting. Ineligible short/mobile/touch, reduced-motion, forced-colors, oversized-text, or overflowing layouts retain natural flow rather than pins. Synthetic wheel bursts cover fine and coarse patterns; physical MacBook trackpad testing still requires a person.

Ambient motion uses active animation time, independent of scroll and pointer changes. Two low-frequency sinusoidal fields vary horizontal/vertical velocities by stable particle seeds; slow depth variation supplies parallax. Motion remains gentle while reading with a stationary cursor. Hidden documents pause the loop and reset its clock, so resuming does not jump ahead.

Projects lower opacity and detail so screenshots retain focus. Skills retain their existing selection response. Experience, education, contact, and case studies use the quiet profile. Each section shares the same canvas and particle identities.

## Budgets and fallbacks

Initial quality uses core-count and data-saving hints. Sustained slow frames reduce density before lowering cadence, without upward oscillation. Quiet and project profiles render at 30 FPS. The target on capable desktop hardware remains 60 FPS.

Pixel ratio caps are 1.5 / 1.25 / 1. Back buffers stay near 2.4 million pixels and below 4096 pixels per dimension. Geometry is generated only at initialization or quality changes; playback writes into a reused object. Buffers, programs, shaders, listeners, and pending frames are disposed cleanly.

Mobile/touch, reduced motion, unavailable WebGL, and context loss use the local static SVG or the existing CSS background. Static modes avoid GPU initialization. The low-density SVG preserves the surface, coordinate rings, trajectory, and endpoint; non-scaling strokes keep details legible when it shrinks. Mobile framing keeps it above the headline. Forced colors hide decorative layers. The SVG is present in server-rendered HTML and works without JavaScript.

Regenerate the static visual after changing mathematics or framing:

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

Twenty-one unit tests cover loss/gradient agreement with finite differences, display samples/normals, valid surface links, stable quality subsets, bounded buffers, viewport destinations, scene restraint, adaptive budgets, exact negative-gradient updates, sufficient decrease, continuous downhill interpolation, multiple starting basins, surface-following playback, invisible restarts, reversible shrinking, ring geometry/reversible phases, capped story distances, and the weighted story pacer.

The optional browser regression requires Playwright and Chrome without adding a runtime dependency:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/particles.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/scroll.browser.mjs http://127.0.0.1:4173
```

It checks live downhill marker movement, staged release, shrinking and reverse growth, ongoing idle changes at a fixed scroll position, cursor coexistence, About/Selected Work pinning, quiet Projects, omitted invisible line draws, hidden-tab pause, actual context loss/restoration, disposal/recreation of all four buffers, 320/390-pixel mobile views, reduced motion, no JavaScript, and unavailable WebGL. The scroll regression covers dense small-delta bursts, large wheel input, bounded initial progress, reversal, anchors/focus, keyboard bypass, unmodified ordinary-content distance, and no delayed input replay. Standalone visual checks review desktop framing and static fallbacks. Production output keeps `.nojekyll`, local assets, and both static case-study routes for GitHub Pages.

The production Chrome sample at 1440×1000, device scale factor 2, measured approximately 60 FPS at high quality. Median and 95th-percentile frame intervals were 16.7 ms and 16.8 ms respectively, with 2,399,969 backing pixels. Quiet expanded sections used 30 draw calls per second (one points pass per frame). A 2560×1440 resize stayed within budget at 2066×1162 backing pixels with no GL error. Synthetic frame pressure reduced quality without losing the renderer, and data-saving mode began at low quality. These measurements describe this machine and sample, not every device.
