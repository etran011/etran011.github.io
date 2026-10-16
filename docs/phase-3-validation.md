# Phase 3: project showcase

## Scope

Seven feature increments plus a separately committed modal-focus correction: centralized project content; reusable cards; original screenshot integration; featured layouts and navigation; screenshot galleries; hover interactions; individual case-study pages.

OptionLab and PlatePredict are supported by supplied materials. Original screenshots are preserved without cropping or replacement. No project repository or live-demo URLs were supplied, so those optional links remain absent. PlatePredict has a text-led presentation and no fabricated app imagery or performance metrics.

## Checks completed

- ESLint without warnings, strict TypeScript, and production static export pass.
- `/`, `/projects/optionlab/`, and `/projects/platepredict/` return successfully from a plain static HTTP server.
- All three routes pass Chrome checks at 320, 390, 768, and 1440px: one primary heading, no horizontal overflow, no console/page errors, no failing resource requests, correct case-study titles, and valid local section anchors.
- Homepage case-study links, direct reload, next-project navigation, and return-to-projects links pass.
- All three original PNG dimensions match their centralized metadata and exported assets.
- Desktop/mobile gallery checks on the homepage and OptionLab case study pass: selection, next/previous wrapping, modal keyboard arrows, explicit Tab/Shift+Tab focus containment, Escape, close button, restored opener focus, and restored body scrolling.
- Fine-pointer hover creates a subtle three-pixel lift; reduced-motion hover produces no transform. Keyboard focus highlights the containing card without movement.
- Existing mobile-menu open/close/Escape/link behavior and desktop navigation remain functional.
- Desktop case study, narrow-mobile homepage, and mobile PlatePredict screenshots visually reviewed.
- Git diff whitespace checks pass before commits.

## Review notes

Case studies use the shared project data; no server or API runtime is required. The PlatePredict evaluation limitations remain explicit, and its résumé-reported deployment is distinguished from the inspected notebook. Additional project links, images, or updated results can be supplied later.

GitHub Pages deployment is still deferred; this phase publishes source commits, not a live website deployment.
