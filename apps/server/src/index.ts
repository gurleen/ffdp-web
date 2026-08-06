import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./router";

const rpcHandler = new RPCHandler(router);

const port = Number(process.env.PORT ?? 3001);

const server = Bun.serve({
  port,
  async fetch(request) {
    const { matched, response } = await rpcHandler.handle(request, {
      prefix: "/rpc",
    });

    if (matched) {
      return response;
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`server listening on http://localhost:${server.port}`);
