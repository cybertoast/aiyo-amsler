# fit-eyes

Interactive experiences on visual perception. Not a medical device; does not diagnose any condition.

## Commands

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies |
| `bunx playwright install chromium` | Install the browser for end-to-end tests (once per machine) |
| `bun run dev` | Development server at http://localhost:5173 |
| `bun run typecheck` | Type check |
| `bun run test` | Unit tests (Vitest) |
| `bun run test:e2e` | End-to-end tests (Playwright; starts the dev server) |
| `bun run build` | Production build to `dist/` |
| `bun run serve:dist` | Serve `dist/` locally as Cloudflare Pages would (http://localhost:8788) |

## License

MIT
