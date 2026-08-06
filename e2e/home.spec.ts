import { expect, test } from "@playwright/test";

test("home page renders and completes an oRPC round trip", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "app-starter" })).toBeVisible();

  // A @gurleen-ui/core Panel + Input + Button, rendered via Tailwind-styled layout.
  const nameInput = page.getByLabel("Name");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Playwright");

  await page.getByRole("button", { name: "Greet" }).click();

  // Proves the full round trip: web -> /rpc (proxied to apps/server) -> oRPC router -> back.
  await expect(page.getByTestId("greet-reply")).toHaveText(
    "Hello, Playwright! This came from apps/server via oRPC.",
  );
});
