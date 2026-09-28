# Backlog

Agreed work, not yet done. Grouped by type; order within a group is not a priority ranking.

## Before release

- Owner checks on real devices: spoken prompts audible in Chrome and Safari; print layout of the review page; grid measures 10 cm after calibration on a phone (`bun run dev --host`, open the Network URL on the phone).
- Rename the project folder `amsler` to `fit-eyes` (same parent folder), outside a running Claude session.
- Create the GitHub repository `fit-eyes` (public, nowpresent organization) and push.
- Confirm the copyright holder in `LICENSE` (currently "nowpresent").
- Cloudflare Pages support in cfops, then deploy. See [deployment.md](deployment.md).

## Features

### Amsler: distortion tracking

- Record visual distortion (lines appear wavy, bent, or missing) in addition to per-cell visibility (clear, blurry, invisible) and test colors.
- Distortion concerns grid lines and areas, not single cells, so it needs its own interaction: the user marks or traces affected areas on the grid while looking at the center dot.
- Session format: add an optional distortion field in a new session version; existing sessions stay valid.

### More eye experiences

- fit-eyes will hold further visual perception experiences, each under `src/experiences/<name>/` with its own route and session format (`x` field identifies the experience).

## Open decisions

- Test colors: red `#ff0000`, green `#00c000`, blue `#0050ff`, same on both themes (`src/experiences/amsler/lib/colors.ts`). Change per theme?
- Warn before leaving the page during a running test (the test is lost; resume is out of scope)?
