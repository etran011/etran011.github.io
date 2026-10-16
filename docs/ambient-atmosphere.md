# Woven signal atmosphere

## Visual direction

The [reference portfolio](https://anoopsonkriya.dev/) was inspected in the browser for slow geometric motion, pointer response, depth-weighted detail, and foreground separation. Its code, models, assets, colors, and editor-style interface were not reused.

This portfolio uses an original procedural Möbius ribbon: a continuous half-twist sampled as woven longitudinal filaments, cross-ribs, and a few points attached to the surface. The model occupies the open right side of the existing hero. The existing blue design tokens, grid, halo, typography, content, and layout remain intact. A horizontal mask protects the text area.

## Rendering

- `src/lib/atmosphere-geometry.ts` defines the surface and three finite geometry tiers. Unit tests verify its reversed seam, finite buffers, bounded coordinates, and static projection.
- `src/lib/atmosphere-renderer.ts` uses native WebGL 1 and original GLSL. Two batched draws render lines and surface points. A slow spatial wave deforms the surface; gentle rotation and depth-weighted light establish dimensionality. Pointer lighting stays subtle.
- `use-signal-ribbon.ts` owns one persistent renderer, one animation loop, and imperative pose interpolation. It does not update React state per frame. The renderer is loaded only for eligible desktop devices.
- Pointer movement feeds a bounded target with exponential easing. It neither intercepts input nor changes foreground layout. The existing custom cursor remains independent.

There are no new runtime dependencies, textures, model downloads, post-processing passes, depth buffers, or multisample render targets. Resource allocation happens during initialization or a quality change, not during ordinary animation. Buffers, shaders, programs, listeners, and pending frames are cleaned up. These choices follow [WebGL resource and batching guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

## Content continuity

The existing Motion scroll observer uses cached section positions. About's existing `story-step` event and the Skills stack's selection attribute supply narrative state without changing those sections.

| Context | Treatment |
| --- | --- |
| Hero | Strongest lighting and full surface detail in the available right-side space |
| About | Smaller, softer form; its orientation follows Learn / Build / Explain |
| Projects | Low opacity and sparse surface points so screenshots retain focus |
| Skills | More detail; selecting a collection gently adjusts orientation and point emphasis |
| Experience, education, contact, case studies | Quiet treatment with reduced rendering cadence |

Poses interpolate over time, so fast and reverse scrolling remain continuous. The renderer persists across client routes; section changes do not rebuild GPU geometry. No wheel handler or scroll pacing behavior was added.

## Budgets and fallbacks

The initial quality uses local core-count and data-saving hints. Sustained slow frame timing reduces density through high, medium, and low tiers before lowering cadence to 30 FPS. A warm-up and full observation windows prevent reactions to isolated frames; quality never oscillates upward during the same session. Project and quiet profiles render at 30 FPS directly.

Pixel ratios cap at 1.5 / 1.25 / 1 across the three tiers. The back buffer caps at approximately 2.4 million pixels and 4096 pixels per dimension. The densest line buffer is under 100 KB. Resizing only reallocates the drawing surface when required.

Touch/mobile, reduced motion, forced colors, failed WebGL initialization, and context loss retain a self-hosted static visual or the existing CSS background. Reduced-motion and mobile views do not initialize WebGL. The static vector is present in server-rendered HTML and works without JavaScript. Regenerate it after changing the base geometry:

```sh
node --experimental-strip-types scripts/generate-atmosphere-fallback.mjs
```

The inactive-document handler stops rendering and resets the frame clock. Context loss reveals the fallback immediately; restoration rebuilds resources according to the current preferences, following the browser's [context-loss lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event). A frame also rechecks eligibility because preference change notifications can arrive after the new media state is observable.

## Verification

Ten unit tests cover geometry, projection, scene bounds, quality adaptation, and the existing storytelling pacer. Browser checks exercise WebGL compilation, actual context loss and recovery, live reduced-motion changes, disposal, no-WebGL/no-JS views, pointer interpolation, About stages, Skills selection, fast/reverse navigation, and persistent route resources.

A development Chrome sample at 1440×1000 and device scale factor 2 measured approximately 60 FPS at high quality, with median and 95th-percentile frame intervals of 16.7 ms and 2,399,969 backing pixels. Quiet sections issued approximately 62 draw calls per second (two draws per frame). A 2560×1440 resize stayed within the buffer cap with no GL error. Synthetic frame pressure reached the low tier without losing the renderer. Results describe this machine and sample, not a universal hardware guarantee.

For visual regression review, inspect the hero at rest and while moving the pointer, About in both scroll directions, Projects with a screenshot viewer open, and Skills with different collections selected. Resize to mobile and enable reduced motion. Check that the atmosphere remains behind readable content, never captures clicks, and that the cursor and existing scroll scenes remain intact.
