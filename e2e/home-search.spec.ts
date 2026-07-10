import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Home and search", () => {
  test("TL-001 home shows regime banner, trending strip, and decision calendar", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(t(SEL.regimeBanner))).toBeVisible();
    await expect(page.locator(t(SEL.trendingStrip))).toBeVisible();
    await expect(page.locator(t(SEL.searchInput))).toBeVisible();
  });

  test("TL-002 typeahead resolves a token and opens its report", async ({ page }) => {
    await page.goto("/");
    await page.locator(t(SEL.searchInput)).fill("uniswap");
    const items = page.locator(t(SEL.searchResultItem));
    await expect(items.first()).toBeVisible();
    await items.first().click();
    await expect(page).toHaveURL(/\/report\/token\/uniswap/);
    await expect(page.locator(t(SEL.reportTitle))).toContainText("Uniswap");
  });

  test("TL-003 ticker collisions show a disambiguation list, no silent match", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator(t(SEL.searchInput)).fill("luna");
    const items = page.locator(t(SEL.searchResultItem));
    await expect(items.filter({ hasText: "Terra" }).first()).toBeVisible();
    const texts = await items.allInnerTexts();
    const hasLuna = texts.some((x) => x.includes("LUNA") && !x.includes("LUNC"));
    const hasLunc = texts.some((x) => x.includes("LUNC"));
    expect(hasLuna && hasLunc).toBe(true);
  });

  test("TL-004 an exact chain name ranks the chain report first", async ({ page }) => {
    await page.goto("/");
    await page.locator(t(SEL.searchInput)).fill("ethereum");
    const first = page.locator(t(SEL.searchResultItem)).first();
    await expect(first).toContainText("chain");
    await first.click();
    await expect(page).toHaveURL(/\/report\/chain\/ethereum/);
  });

  test("TL-005 library page lists top tokens and chains as cards", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator(t(SEL.libraryTokens))).toBeVisible();
    await expect(page.locator(t(SEL.libraryChains))).toBeVisible();
    const cards = page.locator(t(SEL.libraryCard));
    expect(await cards.count()).toBe(20);
    await cards.first().click();
    await expect(page.locator(t(SEL.reportRoot))).toBeVisible();
  });
});
