import type { Locator, Page } from "@playwright/test";

/**
 * Helpers for @gurleen-ui/core components whose DOM shape doesn't map onto a
 * plain Playwright role/text locator. Most components (Button, Input, Panel,
 * Checkbox, ...) render plain semantic HTML and don't need a helper here —
 * just use page.getByRole(...) directly. Add to this file only when a
 * component's interaction genuinely needs one; check the component's
 * `vendor/gurleen-ui/packages/core/src/components/<Name>.tsx` source first.
 */

/**
 * Menu renders its items as plain `<div>`s (no `role="menuitem"`) inside a
 * `role="menu"` panel, so items must be found by text within that panel
 * rather than by an accessible role.
 */
export async function openMenu(page: Page, triggerName: string | RegExp): Promise<Locator> {
  await page.getByRole("button", { name: triggerName }).click();
  return page.getByRole("menu");
}

export async function selectMenuItem(page: Page, label: string | RegExp): Promise<void> {
  await page.getByRole("menu").getByText(label).click();
}

/**
 * Slider is a native `<input type="range">`. Playwright's `fill()` doesn't
 * support range inputs, and dispatching a plain DOM `value` assignment gets
 * swallowed by React's controlled-input tracking — going through the native
 * value setter (the same trick React Testing Library uses) makes React's
 * change detection see it.
 */
export async function setSliderValue(locator: Locator, value: number): Promise<void> {
  await locator.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeSetter?.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
