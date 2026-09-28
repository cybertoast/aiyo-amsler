# Deployment

Target: Cloudflare Pages on the nowpresent account, custom domain `fit-eyes.nowpresent.co`, `kind: "public"` (no Cloudflare Access).

## Status

Blocked: cfops (`present-ops`) has no Cloudflare Pages support. That work belongs in `present-ops`, with its own spec and plan there. This file lists what fit-eyes needs from it.

## Rules

- Deploy, custom domain, and DNS only through `ops cloudflare` (`present-ops`) against `present-ops-registry`. Never the Cloudflare dashboard, the API directly, or a manual `wrangler pages deploy`.
- Run every `ops cloudflare` step with `--dry-run` first.
- DNS changes on the `nowpresent.co` zone need explicit owner approval for each step.
- Before deploying: `bun run build`, then `bun run serve:dist` and the Playwright suite pass locally.

## Findings (2026-09-27)

- cfops serve types are `spa`, `static`, `proxy`, `worker`, `tunnel` (`present-ops/ops/common/config.py`, `VALID_SERVE_TYPES`).
- The wrangler token (`wrangler_api_token` in the cfops `cloudflare.ini`) has Workers Scripts, D1, and KV scopes, but no Pages scope (`present-ops/CLAUDE.md`). Missing permissions are requested from the owner, not worked around (`present-infra/CLAUDE.md`).
- `kind: "public"` means no Access app (`present-ops/CLAUDE.md`).
- Closest existing pattern: `serve.type: "worker"`, where `expose` skips DNS because wrangler owns the record (`present-ops/ops/cloudflare/provision.py`). Rejected for fit-eyes in favor of Pages (decision 2026-09-27).

## Requirements for cfops

- New serve type `pages`, with fields: Pages project name, build output dir (`dist`), repo location.
- Repo location from a named setting in the machine context file (one setting per repo): this repo is not under the shared projects root.
- Commands, each with `--dry-run`: create the Pages project if absent; upload `dist/` (cfops runs `wrangler pages deploy`); attach custom domain `fit-eyes.nowpresent.co` and its DNS record.
- Registry entry: `name: "fit-eyes"`, `hostname: "fit-eyes.nowpresent.co"`, `kind: "public"`, serve type `pages`.
- `audit`: confirm the domain resolves to the Pages project.
- Owner action: add the "Cloudflare Pages: Edit" scope to the wrangler token.

## Not needed

Pages Functions, KV, D1, Access, comments Worker. `wrangler.toml` in this repo only sets the project name and `pages_build_output_dir`.

## After deploy

Run the Playwright suite against `https://fit-eyes.nowpresent.co` (set `baseURL` in a Playwright config override; the dev `webServer` is not needed).
