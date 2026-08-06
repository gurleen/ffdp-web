import { expect, test } from "@playwright/test";

test("home page loads and renders league standings", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "ffdp-web" })).toBeVisible();

  // Proves the full round trip: web -> /rpc (proxied to apps/server) -> oRPC router ->
  // Supabase (core schema) -> back. Depends on the fantasy-football project's live data,
  // consistent with this repo's e2e philosophy of exercising the real stack, not mocks.
  await expect(page.getByText("Sisters and SigMEN")).toBeVisible();
  await expect(page.getByText("Sleeper Friends League")).toBeVisible();
});
