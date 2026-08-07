import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "./router";

// Cloudflare Workers entry point. apps/web and this Worker are deployed as
// separate origins (Pages + Workers), unlike local dev where Vite proxies
// /rpc to the Bun server on the same origin — so CORS is needed here but
// not in index.ts. See AGENTS.md's Cloudflare section.
const rpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
});

export default {
  async fetch(request: Request): Promise<Response> {
    const { matched, response } = await rpcHandler.handle(request, {
      prefix: "/rpc",
    });

    if (matched) {
      return response;
    }

    return new Response("Not found", { status: 404 });
  },
};
