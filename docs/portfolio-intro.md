# First-session portfolio introduction

The home page starts with a compact `initialize.ts` terminal in the existing background, Geist Mono and blue accent palette. Four lines form a valid developer object through short stepped text reveals. A quiet cursor signals activity. There is no percentage or spinner.

The normal sequence takes about 1.7 seconds: roughly 900ms for the code, a 160ms ready beat, and a 620ms handoff. The terminal dissolves into 18 small CSS fragments (eight on mobile); a leftward curtain exposes the existing gradient-descent sculpture and orbital rings, followed by the original hero typography. No extra particle renderer, animation dependency, network request or generated asset is required.

## State and safety

A small inline head script decides eligibility before body parsing. `sessionStorage` marks the intro once per browser session. Return visits, internal routes, non-home hashes, history restoration, reduced motion and forced colors skip it. Blocked session storage is handled safely; persistence across full document reloads cannot be guaranteed when storage is denied.

The normal handoff waits for the existing font/image readiness and either one complete WebGL frame or the existing static fallback. The renderer prepares that frame at clock zero, pauses under the terminal, then resumes its original opening camera and idle clock at handoff. Its temporary intro observer disconnects immediately afterward. The model, rings, geometry, scale and animation speeds are unchanged.

A slow asset deadline begins the transition after at most 1.8 seconds, plus the ready beat and handoff (about 2.6 seconds total). An independent three-second bootstrap watchdog removes the lock even when the client bundle never initializes. JavaScript-disabled pages never acquire the lock. Decode failures, missing WebGL and animation support do not prevent access. Hiding the browser tab or enabling reduced motion dismisses the intro. Intro timers, readiness observation and preference listeners are released on dismissal.

While active, CSS prevents document scrolling and removes hidden page controls from visibility, hit testing and keyboard navigation. Existing Lenis observes only the intro state so it stops and resumes through its current controller. Scroll position is never reset. The loader is a polite status region; decorative code and fragments are hidden from assistive technology. It never moves focus or traps the keyboard. The existing custom cursor stays above the overlay.

## Validation

- `npm test`: 30 passing tests, including bootstrap eligibility, session denial and missing-client watchdog.
- `npm run typecheck`, `npm run lint`, `npm run build`: pass; Next.js statically exports the home page, both case studies and metadata files, with `.nojekyll` retained.
- `tests/intro.browser.mjs`: first/return visits, valid code, ready state, reveal, input lock, focus, original wheel distance, cursor, mobile widths 320/390/768, reduced motion, live preference changes, forced colors, disabled CSS animations, no JavaScript, no client bundle, no WebGL, blocked storage and slow assets.
- Dedicated GPU check: prepared frame stays at time zero while terminal executes; clock advances during reveal; hero resumes at the original scroll position.
- Existing cinematic, sculpture and scrollbar browser suites: verify navigation, pins, galleries, idle/ring motion, clock continuity, dragging and accessibility fallbacks after the intro. Their entry checks wait for the first-session intro to finish.

Browser checks use installed Chrome. Safari, Firefox and Edge have not been directly verified in this environment. The implementation uses native session storage, CSS animations/transforms/opacity and existing renderer fallbacks.
