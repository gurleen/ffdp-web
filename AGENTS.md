# AGENTS.md

Orientation for a coding agent picking up this repo cold. Read this before touching anything.

## What this repo is

**`ffdp-web` is a personal fantasy football tracking app** — league history, franchise records, weekly matchups, rosters, drafts, transactions, and player stats, pulled from ESPN/Sleeper into the `fantasy-football` Supabase project (see the Supabase section below) and served through this app. It started life from a private starter template, which is why some of the plumbing below (the oRPC wiring, `@gurleen-ui`, Bun/Vite setup) reads generically — that infrastructure is intentional and still applies, it's just not template boilerplate anymore. This is the real app, not something to copy elsewhere.

## Stack, and why

| Piece | Choice | Why |
|---|---|---|
| Runtime / package manager | **Bun** | Single tool for install, run, and the backend HTTP server (`Bun.serve`) — no separate Node + npm/pnpm + ts-node stack. |
| Frontend build | **Vite** + React 19 | Fast dev server, standard React tooling, first-class Tailwind v4 plugin. |
| Styling | **Tailwind CSS v4** | CSS-first config (no `tailwind.config.js`), plugged in via `@tailwindcss/vite`. Used for app-level layout/utilities only — see the `@gurleen-ui` section below for why there's no conflict. |
| Client↔server calls | **oRPC** (`@orpc/server`, `@orpc/client`) | End-to-end type safety between `apps/web` and `apps/server` without codegen — the client imports the server's router *type*, not a schema file. |
| Component library | **`@gurleen-ui`** | A private design system, vendored as a git submodule (see below — this is the one piece of this repo's plumbing most likely to confuse an agent, read that section before changing it). |
| Lint/format | **Biome** | One fast tool instead of ESLint+Prettier. Config: `biome.json`. |
| E2E tests | **Playwright** | Drives the real, running stack (both apps), not mocks. |

## Directory map

```
apps/
  web/       Vite + React 19 + Tailwind frontend. Entry: src/main.tsx -> src/App.tsx.
  server/    Bun HTTP server. Entry: src/index.ts. oRPC router: src/router.ts.
e2e/         Playwright specs (root-level: they exercise web+server together, not one app).
  helpers/   Locator helpers for @gurleen-ui components that need more than a plain role locator.
vendor/
  gurleen-ui/  Git submodule -> github.com/gurleen/ui. Do not edit directly (see below).
package.json          root workspace: scripts that fan out to apps/*, postinstall builds vendor/gurleen-ui's packages
tsconfig.base.json     shared strict compiler options, extended by apps/web and apps/server
biome.json
playwright.config.ts
```

## The oRPC wiring

- The router lives in `apps/server/src/router.ts`: a plain object of procedures built with `os` from `@orpc/server`, each optionally validated with a `zod` input schema via `.input(...)`. `export type AppRouter = typeof router` is the only thing the frontend needs.
- `apps/server/src/index.ts` mounts it with `RPCHandler` from `@orpc/server/fetch` at the `/rpc` prefix inside a `Bun.serve()` fetch handler.
- `apps/web/src/lib/orpc.ts` creates the client: `RPCLink` pointed at `/rpc` (relative — see the proxy note below), wrapped with `createORPCClient`, typed via `RouterClient<AppRouter>`. `AppRouter` is imported with `import type { AppRouter } from "../../../server/src/router"` — a **type-only** relative import across the workspace. This is the standard oRPC/tRPC monorepo pattern: no runtime dependency from `web` on `server`, esbuild/Vite strip the type-only import entirely, but full type inference (arg types, return types) flows through.
- Dev-time CORS is avoided entirely, not configured around: `apps/web/vite.config.ts` proxies `/rpc` to the server's port, so the browser only ever talks to `localhost:5173`. In the Cloudflare deployment (see below), `web` and `server` **are** different origins, which is why `apps/server/src/worker.ts` (unlike `index.ts`) adds a `CORSPlugin`.

**Adding a new procedure:**
1. Add it to the `router` object in `apps/server/src/router.ts` (with a `zod` input schema if it takes arguments).
2. Call it from `apps/web` via `orpc.<name>(...)` (imported from `src/lib/orpc.ts`) — it will be fully typed with no further wiring.
3. Extend `e2e/home.spec.ts` or add a new spec under `e2e/` if the change is user-facing.

## Supabase

This app is wired to the `fantasy-football` Supabase project (id `arpawvszlvhynkepusia`, org `gurleen-dev`), server-side only:

- `apps/server/src/lib/supabase.ts` creates the client with `createClient<Database, "core">(url, key, { db: { schema: "core" } })` from `@supabase/supabase-js`, reading `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment (Bun loads `.env` automatically — no `dotenv` dependency needed). It throws at import time if either is missing.
- `apps/server/src/lib/database.types.ts` holds the generated `Database` type (and the `Tables<>`/`TablesInsert<>`/`TablesUpdate<>`/`Enums<>` helpers), passed into `createClient` for fully-typed query results.
- `apps/server/.env.example` documents the two env vars. Copy it to `apps/server/.env` (gitignored) to run locally. The URL and anon key committed there are not secrets — the anon key is meant to be exposed and is safe by design, gated by Row Level Security policies rather than secrecy. Never put the `service_role` key in this file or anywhere committed.
- `apps/web` never talks to Supabase directly (see the oRPC section above); add oRPC procedures in `apps/server/src/router.ts` that use `supabase` internally, the same way you'd add any other procedure.

**All tables live in the `core` schema, not `public`** (`league`, `league_season`, `manager`, `franchise`, `player`, `matchup`, `lineup_slot_entry`, `roster_membership`, `transaction`, `transaction_item`, `draft`, `draft_pick`, `nfl_team`, `nfl_game`, `player_week_stats`, plus join tables — 17 tables total, RLS enabled on all). `public` is and stays empty.

`core` is in this project's exposed-schemas list (Dashboard → Project Settings → Data API → Exposed schemas), confirmed working — `supabase-js` queries against `core` succeed through PostgREST.

**Standing gotcha (tool limitation, not a project setting):** the Supabase MCP `generate_typescript_types` tool always emits only `public`, regardless of the project's exposed-schemas config — its underlying Management API endpoint (`GET /v1/projects/{ref}/types/typescript`) takes an optional `included_schemas` query param, but this MCP tool doesn't expose that parameter, so there's no way to ask it for `core` through MCP. `database.types.ts`'s `core` schema is therefore **hand-authored** from `list_tables({ schemas: ["core"], verbose: true })` introspection output (see the file's header comment) — treat it as best-effort, not generator-verified, and re-derive it by hand from `list_tables` after any schema change made through MCP.

**Regenerating types via the Supabase CLI instead (covers `core` properly, if CLI access is available):** `supabase gen types typescript --project-id arpawvszlvhynkepusia --schema core > apps/server/src/lib/database.types.ts`, then `bun run lint:fix` (Biome's formatting differs from the raw generator output — semicolons, line wrapping). Prefer the CLI's output over a hand-authored file whenever it's available.

## Cloudflare deployment

Production deploys `apps/web` and `apps/server` as two separate Cloudflare resources, not one:

- **`apps/web` → Cloudflare Pages**, a static build. `apps/web/wrangler.toml` sets `pages_build_output_dir = "dist"`. Build command: `bun run build`; output directory: `dist`. Deploy with `bun run deploy` (= `wrangler pages deploy dist`) from `apps/web`, or connect the repo in the Pages dashboard for git-triggered builds.
- **`apps/server` → Cloudflare Workers**, via a dedicated entry point at `apps/server/src/worker.ts` (Bun-free — no `Bun.serve`, just `export default { fetch }`, the standard Workers shape). `index.ts` (Bun, `Bun.serve`) still exists unchanged for local dev; `worker.ts` is Workers-only. Deploy with `bun run deploy` (= `wrangler deploy`) from `apps/server`; test the Workers entry locally first with `bun run dev:worker` (= `wrangler dev`).

**Because these are separate origins, two things follow directly from the oRPC section above:**
1. `worker.ts` adds oRPC's `CORSPlugin` (default config — permissive). Once a real custom domain is chosen, tighten it with `new CORSPlugin({ origin: "https://your-domain" })` rather than leaving it wide open.
2. `apps/web/src/lib/orpc.ts` points at `import.meta.env.VITE_SERVER_URL` when set, falling back to same-origin (`window.location.origin`) for local dev. `VITE_SERVER_URL` must be set as a **build-time** environment variable in the Pages project's dashboard settings (Vite inlines `import.meta.env.VITE_*` at build time — a runtime var wouldn't reach it) pointing at the deployed Worker's URL (its `*.workers.dev` subdomain, or a custom domain routed to it). See `apps/web/.env.example`.

**Config vs. secrets in `apps/server/wrangler.toml`:** `SUPABASE_URL`/`SUPABASE_ANON_KEY` are committed directly in `[vars]`, same non-secret rationale as `apps/server/.env.example` (the Supabase section above) — the anon key is RLS-gated, not secrecy-gated. `apps/server/src/lib/supabase.ts` is unchanged for Workers: it still reads `process.env.SUPABASE_URL`/`process.env.SUPABASE_ANON_KEY`, which works under Workers because `compatibility_flags = ["nodejs_compat"]` (with a `compatibility_date` on/after 2024-09-23, which `wrangler.toml` has) populates `process.env` from `[vars]`/secrets automatically. This wasn't verified against a live Cloudflare deploy from this environment (no outbound access to Cloudflare's API here — `wrangler deploy --dry-run` and `wrangler pages deploy` were used to validate config parsing and bundling only, not an actual deploy). If `process.env` turns out empty at runtime despite this, the fix is to read from the `env` param Workers passes into `fetch(request, env, ctx)` instead — `worker.ts`'s `fetch` doesn't currently take that second argument, so it'd need to be added and threaded into `supabase.ts` (which would need to switch from a module-load-time singleton to a per-request/lazy-initialized client).

**One-time manual setup this repo's config can't do for you:** `wrangler login` (or `CLOUDFLARE_API_TOKEN`) for both apps, creating the Pages project and the Worker in the Cloudflare dashboard or via their first `deploy` run, and wiring up any custom domain.

## The `@gurleen-ui` submodule — read this before touching `vendor/`

`vendor/gurleen-ui` is a **git submodule** pointing at `github.com/gurleen/ui`, pinned to a specific commit (recorded in this repo's git tree, not floating).

**Why a submodule instead of a plain git dependency:** `@gurleen-ui` isn't published to a registry. Its own README recommends a `git+https://...#path:packages/core` dependency — but that `#path:` subdirectory syntax is an **npm/pnpm-only feature; Bun does not support it** (tracked upstream as [oven-sh/bun#15506](https://github.com/oven-sh/bun/issues/15506), unimplemented as of this writing). Do not "fix" this by switching to a git dependency in `package.json` — it will silently fail to resolve to the right subdirectory under Bun. The submodule + Bun-workspace combination below is the deliberate workaround, not a placeholder for something better.

**How it's wired in:**
- Root `package.json` `"workspaces"` includes `"vendor/gurleen-ui/packages/*"` alongside `"apps/*"` — so `bun install` at the root installs and links `@gurleen-ui/tokens`, `@gurleen-ui/core`, and `@gurleen-ui/broadcast` exactly like any other workspace package.
- `apps/web` depends on them via `"workspace:*"`.
- Each library package's `package.json` `exports` points at a built `dist/` (via `tsup`), which doesn't exist until built — so the root `postinstall` script (`build:ui`) runs `tsup` for `tokens` → `core` → `broadcast` (order matters: `broadcast` imports `core`'s built output) every time `bun install` runs. If you ever see "Cannot find module '@gurleen-ui/core'" or a stale-looking component, run `bun run build:ui` again.
- Note on Bun CLI syntax if you touch `build:ui`: `--cwd` is a flag of `bun run`, not `bun` — it's `bun run --cwd <dir> <script>`, not `bun --cwd <dir> run <script>` (the latter silently prints help and does nothing, exit code 0, easy to miss).

**Updating the pinned version:**
```sh
cd vendor/gurleen-ui
git fetch origin
git checkout origin/main   # or a specific tag/commit
cd ../..
git add vendor/gurleen-ui
git commit -m "chore: bump @gurleen-ui submodule"
bun install                 # re-links + rebuilds against the new commit
```

**Using `@gurleen-ui/broadcast`:** not wired into `apps/web` by default (it's TV-control-room-specific: tally lamps, timecode, transport controls — out of scope for this app). To use it: add `"@gurleen-ui/broadcast": "workspace:*"` to `apps/web/package.json`, `bun install`. It's already built by `postinstall`.

**Before using or modifying any `@gurleen-ui` component**, read `vendor/gurleen-ui/CLAUDE.md` (package boundaries, component conventions) and the specific component's `<Name>.md` doc next to its source in `vendor/gurleen-ui/packages/{core,broadcast}/src/components/` — don't infer usage from the `.tsx` source alone, the `.md` is written to be sufficient on its own.

**Do not edit files inside `vendor/gurleen-ui`** — it's a separate repo; changes there belong in `github.com/gurleen/ui`, not here.

## Tailwind + `@gurleen-ui` coexistence

`@gurleen-ui` components are plain React with inline `style` objects reading CSS custom properties from `@gurleen-ui/tokens` — no Tailwind classes, no CSS-in-JS. Tailwind is for this app's own layout and utility classes. They don't conflict, and there's no reason to add a second styling system on top of either.

`apps/web/src/index.css` imports `tailwindcss` **before** `@gurleen-ui/tokens` — don't reorder this. Reversing it breaks Vite's CSS import resolution for `tokens`' own internal `@import`s (it can't find `./fonts.css` etc. relative to the wrong base). In the current order there's one harmless Lightning CSS warning at build time ("`@import` rules must precede all rules") caused by `tokens`' multi-file `@import` chain landing after Tailwind's own generated `@import`s in the bundled output — this doesn't affect the build output or runtime, it's a linter-level nit inside a third-party dependency's CSS, not a bug in this repo.

## Build / verify command loop

Run these — in this order — before considering any change done:

```sh
bun install          # also runs postinstall -> builds tokens/core/broadcast
bun run typecheck     # tsc --noEmit across apps/web and apps/server
bun run lint           # biome check .
bun run build            # production build of both apps
bun run test:e2e          # playwright test — boots the real stack and drives it
```

`bun run dev` starts both apps concurrently via `bun run --filter './apps/*' dev` (web on :5173, server on :3001 by default, `PORT` env var overrides the server).

## E2E conventions

- Specs live in `e2e/*.spec.ts`, not under `apps/web` — a spec typically exercises both apps together (a UI interaction that triggers an oRPC call), so it doesn't belong to either app alone.
- `playwright.config.ts` (root) boots the dev stack itself via `webServer: { command: "bun run dev", ... }` — don't add manual "start the server first" steps to a spec or to CI config, the config already does it.
- Locators: use Playwright's built-in `getByRole`/`getByLabel`/`getByText` directly for most `@gurleen-ui` components (they render plain semantic HTML — `Button` is a real `<button>`, `Input` wraps its `<input>` in a `<label>`, etc.). Only reach for `e2e/helpers/gurleen-ui.ts` for the handful of components whose DOM shape doesn't map cleanly onto a role (documented per-helper in that file — currently `Menu`, whose items are plain `<div>`s with no `role="menuitem"`, and `Slider`, a native range input that needs the native-setter trick to work with React's controlled-input tracking). Don't add a helper for a component that doesn't need one.
- One-time setup on a fresh machine: `bunx playwright install --with-deps chromium`.

## Explicit don'ts

- Don't commit `dist/` output — neither `apps/web/dist` nor any `vendor/gurleen-ui/packages/*/dist` (all gitignored; the latter is also gitignored inside the submodule's own repo).
- Don't hand-edit generated/build artifacts.
- Don't add a second UI component library or a CSS-in-JS dependency alongside `@gurleen-ui` — extend `@gurleen-ui/core` upstream (in `gurleen/ui`) if a component is missing, per its own `CLAUDE.md`.
- Don't switch the `@gurleen-ui` submodule to a git dependency in `package.json` — see the Bun `#path:` limitation above.
