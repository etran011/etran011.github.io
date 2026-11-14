# Intro timing verification

The old React effect waited for fonts, image decode, and renderer readiness after
900 ms, with an 1800 ms deadline, then added 160 ms for completion and 620 ms for
exit. This allowed roughly 1.68–2.58 seconds depending on assets and hydration.
An independent bootstrap watchdog and CSS safety timer ran on other clocks.
Session storage could also suppress the intro in opener-created/copied tabs.

The bootstrap now starts as soon as the loader markup is parsed, independently of
React bundles. One monotonic requestAnimationFrame clock seeks the existing CSS
animations: completion at 1720 ms, exit at 1880 ms, dismissal at 2500 ms. Hidden
intervals pause the clock and effects. No font, image, or renderer readiness gates
remain. The existing server-rendered hero and static scene remain the fallback;
reduced motion and controller errors release the page immediately.

New document navigations to the landing page play even with copied storage.
Reloads retain the prior session skip; client routing, back/forward, project pages,
and section deep links avoid unnecessary replays. Duplicate-tab behavior is based
on the browser's navigation classification; a browser reporting a duplicate as a
reload cannot be distinguished reliably from a real refresh by standard APIs.

Production Chrome foreground measurements (cold first visit, shared cache,
retained tabs and a closed/reopened tab): **2550, 2517, 2517, 2517, 2500 ms**.
A final repeat measured **2517 ms in all five trials**, with no browser console
or runtime errors. Touch-mobile emulation: **2517 ms**. These measure rendered loader frames, not
network load time. The approximately 50 ms spread includes initial paint/frame
scheduling. Background or suspended tabs are not promised exact wall-clock time.

Regression coverage: opener-copied storage, refresh, project return, reduced
motion, visibility pause/resume, controller failure, keyboard access, no client
bundles, slow fonts, storage denial, no WebGL, and mobile widths. Headless Chrome's
visibility transition is simulated because it does not hide background pages;
mobile is browser emulation, not a physical-device timing guarantee.
