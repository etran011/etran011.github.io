# Gradient descent particle landscape

The continuous-workspace redesign supersedes the historical pinned-scene and particle-dispersal behavior described below. See [Continuous portfolio workspace](continuous-workspace.md) for the current layout, persistent model, and validation.

The hero uses a particle sampling of Himmelblau's loss landscape, a visible optimization trail, one moving optimization point, and three detailed instrument rings. It retains the portfolio's palette, typography, layout, weighted scrolling, pinned scenes, cursor, navigation, and project presentations. The same landscape particles disperse into a smaller ambient field and reconstruct on reverse scroll.

## Mathematics

The objective is `f(x,z) = (x² + z − 11)² + (x + z² − 7)²`, sampled over `[-4.2, 4.2]²`. Its four basins attain the global value zero; the visualization does not claim there is one unique global minimum.

Its analytic gradient is:

- `∂f/∂x = 4x(x² + z − 11) + 2(x + z² − 7)`
- `∂f/∂z = 2(x² + z − 11) + 4z(x + z² − 7)`

Display height is `0.5 log(1 + f/16) − 0.85`, with horizontal coordinates scaled by 0.31. This monotone height compression makes the valleys legible. **Optimization uses the original objective, not the compressed display height.** Analytic display normals provide restrained lighting; the structured surface retains its recognizable geometry. A shared display-only breathing offset of at most ±0.016 world units moves the samples, trail, and marker together; optimization still uses the unmodified objective and gradient.

`loss-landscape.mjs` precomputes actual gradient descent from `(0.6, 3.8)`. Each update is `p_next = p − α∇f(p)`, starting with `α = 0.004`. This lies below the reciprocal Hessian row-sum bound on the domain. Domain checks and [Armijo backtracking](https://optax.readthedocs.io/en/latest/api/generated/optax.scale_by_backtracking_linesearch.html) halve the rate if sufficient decrease is not met. The default run takes 192 updates and converges to `(3, 2)` with loss below `10⁻¹²`. Other starting basins converge to their own minima in tests.

Playback retimes the precomputed parameter-space segments by distance, then re-evaluates the exact display height. The thin trail therefore follows the surface instead of cutting through it. It does not fabricate a decorative optimization curve. The marker has a compact bright core and a soft halo. The revealed trail fades behind it; a distance-based light illuminates nearby surface samples. A restrained radial light pulse appears near the minimum without displacing the mathematical geometry. The marker reaches the minimum, holds, fades to zero, and only then restarts. Reduced motion shows a static trail and endpoint.

## Geometry and rendering

- `loss-landscape.mjs`: objective, analytic gradient, display height/normals, descent solver, and playback.
- `atmosphere-geometry.ts`: a 72 × 42 deterministic sampling grid with two normal-offset detail layers, stable identities, ambient destinations, sparse parameter-neighbor links, and the static trajectory buffer.
- `atmosphere-rings.ts`: three open coordinate ellipses, differently tilted and sized, with nested tracks, graduated ticks and fiducial nodes; one deterministic ribbon buffer under 400 KB.
- `atmosphere-view.mjs`: shared resting view and camera for WebGL and the SVG generator.
- `atmosphere-renderer.ts`: native WebGL 1 and original GLSL, with static buffers and no per-frame geometry upload.
- `particle-transition.ts`: bounded expansion catch-up and reversible release, connection opacity, loosening, and shrinking.
- `use-data-particles.ts`: one persistent renderer, one frame loop, pointer easing, adaptive quality, lifecycle handling, and no per-frame React state.

There are 3,600 / 1,200 / 600 points (3,024 primary surface samples plus 576 secondary/micro samples at full quality) at high / medium / low quality. Each quality tier retains the exact identities of its samples. Connections follow adjacent surface parameters; there are no unrelated nearest-neighbor cluster links. The trajectory uses one additional static buffer; its marker reuses the same buffer with a position uniform. The rings use one additional static buffer. There are four live GPU buffers, cleaned up on disposal. The hero uses at most five batched draws; fully dispersed sections use one points draw.

All three rings are batched into one triangles draw. Narrow ribbons provide a reliable visible width instead of relying on unsupported wider WebGL lines. Original local radii are 2.02/2.17/2.32 units with a shared 0.85 framing factor. They rotate around different axes at 0.065/−0.045/0.03 radians per second, with traveling highlights, graduated ticks, inner tracks and depth-controlled opacity. Depth and a left-side mask keep them subordinate to the surface and text. Invisible rings issue no draw; fully expanded particles skip trajectory illumination calculations.

No new runtime library, mesh texture, downloaded model, or post-processing pass is required. All layers remain decorative, `aria-hidden`, and `pointer-events: none`.

## Scroll, size, and idle motion

The existing paced hero `story-progress` event still drives the animation. No additional wheel handler, scroll controller, or pinning system was added. Short desktop viewports continue using the shared Motion observer's natural section progress.

1. The prominent loss surface, coordinate rings, and trajectory remain coherent at the top.
2. Early progress expands the rings and adds a bounded rotation offset. This accelerates them during scroll without multiplying active time by changing progress (which would jump). Samples loosen along their surface normals as connections and trajectory fade.
3. Ring arcs develop fine angular gaps and slight geometric separation before fading completely. Their opacity persists beyond the surface links. Deterministic curved paths disperse the samples into the viewport.
4. A smooth shrinking value follows particle release: formation points are approximately 6.3–7.3 CSS pixels before perspective; ambient points are approximately 1.15–1.8 CSS pixels.
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

Ambient motion uses active animation time, independent of scroll and pointer changes. Two sinusoidal fields vary horizontal/vertical velocities by stable particle seeds, with stronger drift than the earlier implementation. The primary amplitude is 0.095 NDC scaled by stable depth, with a secondary 0.018 field; smooth depth variation supplies parallax. Ambient point sizes and section opacities remain restrained. Motion remains gentle while reading with a stationary cursor. Hidden documents pause the loop and reset its clock, so resuming does not jump ahead.

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

Unit tests cover loss/gradient agreement with finite differences, display samples/normals, valid surface links, stable quality subsets, bounded buffers, viewport destinations, scene restraint, adaptive budgets, exact negative-gradient updates, sufficient decrease, continuous downhill interpolation, multiple starting basins, surface-following playback, invisible restarts, reversible shrinking, ring geometry/reversible phases, ribbon framing bounds across desktop/tall windows, bounded display breathing and idle camera motion, capped story distances, and the weighted story pacer.

The optional browser regression requires Playwright and Chrome without adding a runtime dependency:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/particles.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/scroll.browser.mjs http://127.0.0.1:4173
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/sculpture.browser.mjs http://127.0.0.1:4173
```

It checks live downhill marker movement, staged release, shrinking and reverse growth, ongoing idle changes at a fixed scroll position, cursor coexistence, About/Selected Work pinning, quiet Projects, omitted invisible line draws, hidden-tab pause, actual context loss/restoration, disposal/recreation of all four buffers, 320/390-pixel mobile views, reduced motion, no JavaScript, and unavailable WebGL. The scroll regression covers dense small-delta bursts, large wheel input, bounded initial progress, reversal, anchors/focus, keyboard bypass, unmodified ordinary-content distance, and no delayed input replay. Standalone visual checks review desktop framing and static fallbacks. Production output keeps `.nojekyll`, local assets, and both static case-study routes for GitHub Pages.

The production Chrome sample at 1440×1000, device scale factor 2, measured approximately 60 FPS at high quality. Median and 95th-percentile frame intervals were 16.7 ms and 16.7 ms respectively, with 2,399,969 backing pixels. Quiet expanded sections used 30 draw calls per second (one points pass per frame). A 2560×1440 resize stayed within budget at 2066×1162 backing pixels with no GL error. Synthetic frame pressure reduced quality without losing the renderer, and data-saving mode began at low quality. These measurements describe this machine and sample, not every device.


## Sculpture prominence and continuous motion

The shared view uses a 0.47 requested scale (previously 0.42), camera distance 8, yaw 0.68, pitch 0.52, and a more central horizontal placement. `fitSculptureScale` preserves a 4% projected edge margin using the ring envelope; normal desktop framing is approximately 0.462, with further fitting in tall windows. The shader's left-side text protection remains intact. Increased formation particle size, fuller directional light, 0.95 hero canvas opacity, and a less attenuated edge mask make the structure visible immediately. The static SVG shares the view and has brighter particles/rings; mobile/touch/reduced-motion continue to avoid continuous GPU animation.

A single active clock drives the entire system. The bounded camera orbit uses yaw amplitudes 0.22 and 0.055 radians, pitch 0.055, and roll 0.025, producing visible movement over a few seconds while preserving the initial silhouette during a long visit. `atmosphere-idle.mjs` supplies both the tested display-wave math and GLSL. Network pulses and a gently changing light direction animate the surface. The trajectory follows the same small breathing displacement, so it remains attached; neither the gradient nor descent steps are modified.

Scroll progress continues to control only the existing loosening, release, ring fragmentation, fading, and shrinking. Idle phase keeps advancing during the transition and reconstruction; returning to the top does not reset it. Fully dispersed fields skip the now-invisible breathing calculation. The renderer still uses one frame loop, four buffers, no per-frame geometry upload, and the same maximum five hero draws/one ambient draw. No runtime libraries were added.

`tests/sculpture.browser.mjs` verifies visible idle rotation and real pixel changes without input, stationary typography, ribbon draws, ongoing ambient drift at fixed scroll, reconstruction without clock reset, and exact active-clock pause/resume while hidden. Existing lifecycle tests cover context restoration, cleanup, static modes, and preference changes.

## Stronger idle breathing and optimizer emissions

The primary rhythm now takes 4.4 seconds; a secondary spatial wave takes 6.8 seconds. Their maximum display displacements are 0.065 and 0.022 scene units along the original surface normal, rather than whole-model scaling. Formation brightness varies by ±25% and point size by ±8%. The original bounded orbit and moving directional light continue on the same active clock. Scale, framing, ring geometry, rotation speeds, and mathematical descent remain unchanged.

Every 6.8 active seconds, an emission samples the optimizer's actual position once. Its fixed origin produces an outward crest at 0.62 scene units per second with a smooth launch, Gaussian envelope, distance attenuation and fading wake. The crest adds at most 0.045 scene units of normal displacement and 24% point size. The trail shares the surface deformation; the marker evaluates its current analytic normal instead of inheriting the first trail vertex's normal. A breathing halo and moving trail highlight emphasize the original optimizer, including its existing fade before restart.

Rings receive staggered arrival times and independent traveling highlights. Their brightness responds without changing radius, tilt, center or rotation. New motion fades with surface release; existing ring opacity still controls dissolution. The ambient drift and active clock continue through scrolling and reconstruction. The emitter reuses one playback object and updates its origin only once per emission; animation retains four GPU buffers, one frame loop and no per-frame geometry uploads or React updates. Static/mobile/reduced-motion fallbacks remain unchanged.

`tests/idle-energy.browser.mjs` verifies emission coordinates against the actual descent, then holds other GPU inputs constant to isolate the wave's rendered pixels. It checks visible surface motion, a complete fade back to the same image, and the ring response separately. Run with the same `PLAYWRIGHT_MODULE` environment as the other browser suites. Unit coverage checks waveform smoothness, bounded amplitudes, primary timing, outward propagation and fading wake.


## Detailed mathematical sculpture

The primary surface now samples the same Himmelblau objective at 72 × 42 points. Mesh links follow adjacent parameters, with restrained diagonal braces. `atmosphere-contours.mjs` refines crossings against the actual loss for six full-quality contour levels (2, 8, 24, 64, 160, 400). Triangular cells avoid ambiguous saddle connections. Small arrow shafts use the analytic negative gradient and are included only when their endpoints decrease the objective; their heads are decorative directional markings, not optimizer steps. The optimizer itself remains the existing Armijo-backtracked descent.

Full quality contains 3,024 surface points, 384 smaller secondary points and 192 micro points. Detail layers sample an inset region of the same landscape and offset along its analytic normals by 0.055–0.20 scene units. GPU motion adds bounded normal/tangent oscillations at different speeds. Their sizes and opacities differ; depth attenuation, slope-sensitive lighting, localized optimizer energy and a stronger left-side mask (also on the desktop static fallback) preserve hierarchy and text readability. Connections and contours share the existing static line buffer, respond to the propagating energy field, and disappear with the existing link fade during dissolution.

Each original orbit now has two inner segmented tracks, graduated ticks and illuminated fiducial markings. Narrow ribbons have different widths and opacities, with counter-traveling highlight frequencies layered over the existing independent rotations. All details stay inside the previous outer ring envelope; framing, scale and center are unchanged. The same shared ring opacity/fragmentation controls dissolve and reconstruction.

High/medium/low quality use 3,600/1,200/600 points and 2,058/866/640 line segments, respectively. Point/line geometry occupies approximately 401/152/98 KB; all instrument rings share a 351 KB buffer. The renderer still uses four buffers, at most five hero draws, and one draw in expanded ambient sections. No post-processing, new renderer, animation loop, per-frame geometry upload or React updates are introduced. Static SVG generation includes the contours and hierarchical ring strokes; the local fallback is about 103 KB. Mobile/touch and reduced-motion remain static.

Verification includes analytic contour endpoint levels, downhill vector shafts, deterministic quality subsets, normal-anchored layers, bounded ring geometry and exact objective/gradient tests. The GPU energy regression isolates a right-side graphic crop at stable low geometry, excluding unrelated terminal typing and adaptive density changes. Browser lifecycle tests check all four buffers, loss descent, continuous idle motion, scroll reconstruction, visibility pause and context recovery. Frame-rate samples describe the test machine and are not a guarantee for all hardware.

The final isolated 1440×1000 production sample at device scale factor 2 measured about 60.3 model FPS at high quality, with 16.7ms median and 16.8ms p95 frame intervals. Quiet sections retained 30 draws/second. Large-canvas bounds, data saving and synthetic frame-pressure degradation passed.
