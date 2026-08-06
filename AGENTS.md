# AGENTS.md

Orientation for a coding agent picking up this repo cold. Read this before touching anything.

## What this repo is

**A copy-and-rename template, not a product.** `app-starter` exists to be forked/copied into a new repo whenever a new app is started. It is not itself an app with a fixed feature set — the demo page and example oRPC procedure are placeholders meant to be replaced. See "Using this as a template" below if that's the task at hand.

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
- Dev-time CORS is avoided entirely, not configured around: `apps/web/vite.config.ts` proxies `/rpc` to the server's port, so the browser only ever talks to `localhost:5173`. If `web` and `server` are ever deployed to different origins in production, that's the point where a `CORSPlugin` (from `@orpc/server/plugins`) needs to be added to the `RPCHandler` — it isn't needed for the current same-origin-via-proxy setup.

**Adding a new procedure:**
1. Add it to the `router` object in `apps/server/src/router.ts` (with a `zod` input schema if it takes arguments).
2. Call it from `apps/web` via `orpc.<name>(...)` (imported from `src/lib/orpc.ts`) — it will be fully typed with no further wiring.
3. Extend `e2e/home.spec.ts` or add a new spec under `e2e/` if the change is user-facing.

## Supabase

This app is wired to the `fantasy-football` Supabase project (id `arpawvszlvhynkepusia`, org `gurleen-dev`), server-side only:

- `apps/server/src/lib/supabase.ts` creates the client with `createClient<Database>(...)` from `@supabase/supabase-js`, reading `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment (Bun loads `.env` automatically — no `dotenv` dependency needed). It throws at import time if either is missing.
- `apps/server/src/lib/database.types.ts` holds the generated `Database` type (and the `Tables<>`/`TablesInsert<>`/`TablesUpdate<>`/`Enums<>` helpers), passed into `createClient` for fully-typed query results.
- `apps/server/.env.example` documents the two env vars. Copy it to `apps/server/.env` (gitignored) to run locally. The URL and anon key committed there are not secrets — the anon key is meant to be exposed and is safe by design, gated by Row Level Security policies rather than secrecy. Never put the `service_role` key in this file or anywhere committed.
- The project currently has **no tables** — `database.types.ts` reflects an empty schema. `apps/web` never talks to Supabase directly (see the oRPC section above); once tables exist, add oRPC procedures in `apps/server/src/router.ts` that use `supabase` internally, the same way you'd add any other procedure.

**Regenerating types after a schema change:** use the Supabase MCP tool `generate_typescript_types` (project id `arpawvszlvhynkepusia`) and overwrite `apps/server/src/lib/database.types.ts` with the result, then run `bun run lint:fix` (Biome's formatting differs from the raw generator output — semicolons, line wrapping). Without MCP access, the equivalent is the Supabase CLI: `supabase gen types typescript --project-id arpawvszlvhynkepusia > apps/server/src/lib/database.types.ts`.

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

**Using `@gurleen-ui/broadcast`:** not wired into `apps/web` by default (it's TV-control-room-specific: tally lamps, timecode, transport controls — out of scope for a generic app template). To use it: add `"@gurleen-ui/broadcast": "workspace:*"` to `apps/web/package.json`, `bun install`. It's already built by `postinstall`.

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

## Using this as a template for a new app

1. Rename the root `package.json` `"name"` (and `apps/web`/`apps/server`'s if you want app-specific names instead of the generic `web`/`server`).
2. Replace the demo in `apps/web/src/App.tsx` and the example procedures in `apps/server/src/router.ts` with the real app — keep the wiring (the `orpc` client import, the type-only `AppRouter` import), delete the placeholder content.
3. Update or delete `e2e/home.spec.ts` to match whatever replaces the demo page.
4. If starting a genuinely new repository (not just a branch of this one), re-init git history; keep `vendor/gurleen-ui` as a submodule either way — re-add it with `git submodule add https://github.com/gurleen/ui.git vendor/gurleen-ui` if history was reset.
5. Update this file and `README.md`'s intro paragraphs — everything else about the stack, the oRPC wiring, and the submodule mechanics still applies unchanged.

## Explicit don'ts

- Don't commit `dist/` output — neither `apps/web/dist` nor any `vendor/gurleen-ui/packages/*/dist` (all gitignored; the latter is also gitignored inside the submodule's own repo).
- Don't hand-edit generated/build artifacts.
- Don't add a second UI component library or a CSS-in-JS dependency alongside `@gurleen-ui` — extend `@gurleen-ui/core` upstream (in `gurleen/ui`) if a component is missing, per its own `CLAUDE.md`.
- Don't switch the `@gurleen-ui` submodule to a git dependency in `package.json` — see the Bun `#path:` limitation above.
