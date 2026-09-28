# Overview

fit-eyes: open source (MIT) interactive experiences on visual perception, hosted at `fit-eyes.nowpresent.co`. Amsler grid is the first experience. Not a medical or diagnostic tool. Keep the system simple and easy to maintain.

## Current Status

- Phases 1–5 complete (2026-09-28): the app is feature-complete for local use. Unit tests: 77. End-to-end tests: 22.
- Next: owner refinement on the laptop, then deployment (blocked on Pages support in cfops).
- Remaining work and open decisions: `docs/backlog.md`. Deployment: `docs/deployment.md`. Commands: `README.md`.
- `tmp/plan/` holds the original draft plan (git-ignored, historical). Code and `docs/` are the source of truth.

## Stack

- Vue 3 + Vite + TypeScript, `vue-router`. Runtime dependencies: `vue`, `vue-router` only. No state library.
- TypeScript pinned to 6.0 (`vue-tsc` does not support TypeScript 7).
- Bun for installs and scripts. Vitest (unit, `tests/unit/`, mirrors `src/`), Playwright (end-to-end, `tests/e2e/`, reuses a running dev server on port 5173).
- Code shared by all experiences in `src/shared/`; each experience in `src/experiences/<name>/`. Routes: `src/router.ts`.

## Critical Rules

- Static site only. No server storage, no Cloudflare KV, no Pages Functions. Sessions exist only in the URL fragment (`#s=<base64url(deflate-raw(JSON))>`, codec `src/shared/lib/session-codec.ts`) and in downloaded JSON files.
- No personally identifying data in sessions. No analytics, cookies, or third-party requests at runtime.
- Per-device data (calibration, theme, preferences, recent blood pressure) only in `localStorage` under `fit-eyes.*` keys, via `src/shared/lib/storage.ts`. Never in a session.
- Disclaimer (not a medical or diagnostic tool) on the home page and every review and compare page.
- Voice: spoken prompts via `speechSynthesis` only. No speech recognition (it sends audio off the device).
- Calibration against an ID-1 card (85.60 × 53.98 mm).
- Deploy and DNS for the nowpresent account only through `ops cloudflare`; rules in `docs/deployment.md`.
- Workflow per change: tests first, `bun run typecheck`, `bun run test`, `bun run test:e2e`, check in the browser, then commit only after owner approval with explicit `git add <paths>`.

## Amsler Experience

- Pages: `/amsler` (grid), `/amsler/test` (setup and incremental test), `/amsler/review` (results, share, download, open file), `/amsler/compare` (several sessions; all payloads in the URL), `/calibrate` (shared).
- Grid: 20 × 20 squares, 5 mm each (100 mm side), center fixation dot. Rows `1`–`20`, columns `A`–`T`.
- Session = one test: eye (`left`, `right`, `both`), one color, one timestamp. A repeat test is a new session. Format and validation: `src/experiences/amsler/lib/session-schema.ts` (source of truth; bump `v` for incompatible changes).
- Test options: order sequential or random (seeded); colors mono (black on light, white on dark), red, green, blue; highlight colored cell or coordinate label; scope full grid, region (quadrant or central 10×10), or random sample of N. Answers clear / blurry / invisible via buttons or keys `1`/`2`/`3`; `Backspace` back; `Esc` pause.
- Optional blood pressure before a test; a reading is offered for reuse for 60 minutes on the same device.
