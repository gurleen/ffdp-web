import { os } from "@orpc/server";
import { z } from "zod";

const ping = os.handler(async () => {
  return { message: "pong", time: new Date().toISOString() };
});

const greet = os.input(z.object({ name: z.string().min(1).max(80) })).handler(async ({ input }) => {
  return { message: `Hello, ${input.name}! This came from apps/server via oRPC.` };
});

export const router = {
  ping,
  greet,
};

export type AppRouter = typeof router;
