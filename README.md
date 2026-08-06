# app-starter

A copy-and-rename template for new React apps: **Bun** runtime, **Vite** + **React 19**, **Tailwind CSS v4**, **oRPC** for type-safe client↔server calls, and **[`@gurleen-ui`](https://github.com/gurleen/ui)** as the component library.

> Picking this repo up as a coding agent? Read [`AGENTS.md`](./AGENTS.md) first — it's the detailed, wiring-level orientation doc. This README is the shorter human-facing quickstart.

## Stack

| Layer | Tech |
|---|---|
| Runtime & package manager | [Bun](https://bun.sh) |
| Frontend | [Vite](https://vite.dev) + React 19 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Client↔server | [oRPC](https://orpc.dev) |
| Database | [Supabase](https://supabase.com) (`apps/server` only) |
| Components | [`@gurleen-ui`](https://github.com/gurleen/ui) (vendored as a git submodule) |
| Lint/format | [Biome](https://biomejs.dev) |
| E2E tests | [Playwright](https://playwright.dev) |

## Quickstart

```sh
git clone --recurse-submodules <this-repo-url>
cd app-starter
# if you cloned without --recurse-submodules:
git submodule update --init --recursive

bun install                                    # also builds the @gurleen-ui packages (postinstall)
bunx playwright install --with-deps chromium     # one-time, only needed for `bun run test:e2e`

cp apps/server/.env.example apps/server/.env      # Supabase project URL + anon key

bun run dev                                       # web: http://localhost:5173, server: http://localhost:3001
```

## Directory layout

```
apps/
  web/       React + Vite + Tailwind frontend
  server/    Bun HTTP server, exposes an oRPC router at /rpc
e2e/         Playwright specs + helpers (exercise the full stack)
vendor/
  gurleen-ui/  @gurleen-ui, as a git submodule
```

## Using this as a template

This repo is meant to be copied for each new app, not extended in place:

1. Rename the root `package.json`'s `"name"` (and `apps/web`/`apps/server`'s, if you want).
2. Replace the demo page (`apps/web/src/App.tsx`) and example router (`apps/server/src/router.ts`) with your real app — keep the oRPC wiring (the `orpc` client, the type-only `AppRouter` import), delete the placeholder content.
3. Update `e2e/home.spec.ts` to match.

## oRPC: how the client↔server wiring works

- `apps/server/src/router.ts` defines a `router` object of procedures (built with `os` from `@orpc/server`, optionally validated with `zod`), and exports its type as `AppRouter`.
- `apps/server/src/index.ts` serves it over HTTP via `Bun.serve()` + oRPC's fetch adapter, mounted at `/rpc`.
- `apps/web/src/lib/orpc.ts` creates a fully-typed client (`RPCLink` + `createORPCClient`), importing `AppRouter` as a **type-only** import directly from `apps/server` — no code generation, no shared package, no runtime dependency between the two apps, but full end-to-end type inference.
- In dev, `apps/web/vite.config.ts` proxies `/rpc` to the server so there's no CORS to configure.

**To add a procedure:** add it to `router` in `apps/server/src/router.ts`, then call `orpc.<name>(...)` from `apps/web` — it's typed automatically.

## Supabase

`apps/server` talks to the `fantasy-football` Supabase project via `apps/server/src/lib/supabase.ts`, typed with `apps/server/src/lib/database.types.ts`. `apps/web` never talks to Supabase directly — it goes through oRPC, same as everything else. All tables live in the `core` schema, not `public` — see `AGENTS.md`'s Supabase section for env vars, the `core` exposed-schemas gotcha, and how to regenerate types after a schema change.

## `@gurleen-ui`: why a submodule

`@gurleen-ui` isn't published to a registry. Its own docs recommend a git dependency with a `#path:packages/core` subdirectory fragment — but **Bun doesn't support that syntax** ([oven-sh/bun#15506](https://github.com/oven-sh/bun/issues/15506)). So instead, `vendor/gurleen-ui` is a git submodule pinned to a commit, and its `packages/*` are pulled into this repo's Bun workspaces directly. `bun install`'s `postinstall` step builds `@gurleen-ui/tokens`/`core`/`broadcast` automatically.

**Pulling in an update:**
```sh
cd vendor/gurleen-ui && git fetch origin && git checkout origin/main && cd ../..
git add vendor/gurleen-ui && git commit -m "chore: bump @gurleen-ui submodule"
bun install
```

**Using `@gurleen-ui/broadcast`** (TV-control-room components — tally, timecode, transport controls; not included by default): add `"@gurleen-ui/broadcast": "workspace:*"` to `apps/web/package.json`, then `bun install`.

Component docs live next to each component's source in `vendor/gurleen-ui/packages/{core,broadcast}/src/components/<Name>.md` — check there before using or extending a component.

Tailwind (used for this app's own layout/utilities) and `@gurleen-ui` (plain React + CSS-custom-properties, no Tailwind classes) don't conflict — no shared config needed.

## Testing

```sh
bun run test:e2e         # headless
bun run test:e2e:ui       # Playwright's UI mode
```

Specs live in `e2e/*.spec.ts` and exercise the running stack end-to-end (`playwright.config.ts` boots both apps itself via `bun run dev`). `e2e/helpers/gurleen-ui.ts` has locator helpers for the few `@gurleen-ui` components that need more than a plain `getByRole`/`getByLabel` locator (currently `Menu` and `Slider`) — most components don't need one.

## Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Starts `apps/web` and `apps/server` together |
| `bun run build` | Production build of both apps |
| `bun run typecheck` | `tsc --noEmit` across both apps |
| `bun run lint` / `bun run lint:fix` | Biome check / check + write |
| `bun run format` | Biome format, write |
| `bun run test:e2e` / `bun run test:e2e:ui` | Playwright, headless / UI mode |
| `bun run build:ui` | Rebuild the vendored `@gurleen-ui` packages (also runs automatically on `bun install`) |

## License

MIT — see [LICENSE](./LICENSE).
