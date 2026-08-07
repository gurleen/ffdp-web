import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
// Type-only import: pulls in apps/server's router *types* for end-to-end
// type safety, with zero runtime coupling between the two apps.
import type { AppRouter } from "../../../server/src/router";

// VITE_SERVER_URL points at the deployed Worker when web and server are
// separate origins (Cloudflare Pages + Workers) — see AGENTS.md's Cloudflare
// section. Falls back to same-origin for local dev, where vite.config.ts
// proxies /rpc to the Bun server instead.
const serverUrl = import.meta.env.VITE_SERVER_URL ?? window.location.origin;

const link = new RPCLink({
  url: `${serverUrl}/rpc`,
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link);
