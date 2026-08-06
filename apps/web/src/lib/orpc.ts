import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
// Type-only import: pulls in apps/server's router *types* for end-to-end
// type safety, with zero runtime coupling between the two apps.
import type { AppRouter } from "../../../server/src/router";

const link = new RPCLink({
  url: `${window.location.origin}/rpc`,
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link);
