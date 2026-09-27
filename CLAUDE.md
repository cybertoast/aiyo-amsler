# Overview

fit-eyes: open source (MIT) interactive experiences on visual perception, hosted at `fit-eyes.nowpresent.co`. Amsler grid is the first experience. Not a medical or diagnostic tool. Keep the system simple and easy to maintain.

## Current Status

- Phase 1 (scaffold) complete: router, home page with disclaimer, smoke tests. Next: phase 2 (grid, theme, calibration).
- Commands: `README.md`.
- Draft plan: `tmp/plan/index.md` (git-ignored, local only).
- Deployment blocked on Cloudflare Pages support in cfops (`present-ops`).

## Stack

- Vue 3 + Vite + TypeScript, `vue-router`. Runtime dependencies: `vue`, `vue-router` only. No state library.
- TypeScript pinned to 6.0 (`vue-tsc` does not support TypeScript 7).
- Bun for installs and scripts. Vitest (unit, `tests/unit/`), Playwright (end-to-end, `tests/e2e/`).
- Code shared by all experiences in `src/shared/`; each experience in `src/experiences/<name>/`.

## Critical Rules

- Static site only. No server storage, no Cloudflare KV, no Pages Functions. Sessions exist only in the URL fragment (`#s=<base64url(deflate-raw(JSON))>`) and in downloaded JSON files.
- No personally identifying data in sessions. No analytics, cookies, or third-party requests at runtime.
- Disclaimer (not a medical or diagnostic tool) on the home page and every review page.
- Voice: spoken prompts via `speechSynthesis` only. No speech recognition (it sends audio off the device).
- Calibration against an ID-1 card (85.60 × 53.98 mm), stored per device in `localStorage`, never in a session.
- Deploy and DNS for the nowpresent account only through `ops cloudflare` (`present-ops`, `present-ops-registry`). Never the dashboard or a manual `wrangler pages deploy`.
- Test locally (dev server, then `wrangler pages dev dist`) before any deploy.

## Amsler Experience

- Grid: 20 × 20 squares, 5 mm each (100 mm side), center fixation dot. Rows `1`–`20`, columns `A`–`T`. Light or dark mode; optional row and column labels.
- Session = one test: eye (`left`, `right`, `both`), one color, one timestamp. A repeat test is a new session.
- Incremental test: one cell at a time, sequential or random (seeded); colors mono (black on light, white on dark), red, green, blue; display mode colored cell (coordinate hidden) or coordinate label; scope full grid, region (quadrant or central 10×10), or random sample of N; responses clear / blurry / invisible via buttons or keys `1`/`2`/`3`.
- Optional blood pressure entry before a test, with reuse of a reading from the last 60 minutes on the same device.
- Review: share link, JSON download and upload, compare several sessions side by side, "next test" shortcut.
