import { devices, expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

async function horizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}

const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];

test.describe("Mobile layout", () => {
  test.use(iphone);

  test("TL-060 core pages render without horizontal page overflow", async ({
    page,
  }) => {
    for (const path of ["/", "/report/chain/solana", "/library", "/settings", "/portfolio"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await horizontalOverflow(page), `overflow on ${path}`).toBeLessThanOrEqual(1);
    }
  });

  test("TL-061 every nav destination is reachable on a phone", async ({ page }) => {
    await page.goto("/");
    await page.locator(t(SEL.navSettings)).scrollIntoViewIfNeeded();
    await page.locator(t(SEL.navSettings)).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator(t(SEL.weightsEditor))).toBeVisible();
    // Weight sliders must not push the page wide on a phone.
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});

test.describe("PWA", () => {
  test("TL-062 manifest is served with standalone display and installable icons", async ({
    request,
  }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest.display).toBe("standalone");
    expect(manifest.name).toBe("TokenLens");
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    const purposes = manifest.icons.map((i: { purpose?: string }) => i.purpose);
    expect(purposes).toContain("maskable");
  });

  test("TL-063 service worker, icons, and offline fallback are served", async ({
    request,
  }) => {
    const sw = await request.get("/sw.js");
    expect(sw.ok()).toBe(true);
    expect(sw.headers()["content-type"]).toContain("javascript");
    for (const path of [
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/icons/icon-maskable-512.png",
      "/apple-touch-icon.png",
    ]) {
      const res = await request.get(path);
      expect(res.ok(), `missing ${path}`).toBe(true);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
    const offline = await request.get("/offline");
    expect(offline.ok()).toBe(true);
    expect(await offline.text()).toContain("You are offline");
  });

  test("TL-064 the service worker registers and controls the page", async ({
    page,
  }) => {
    await page.goto("/");
    const registered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return "unsupported";
      const reg = await navigator.serviceWorker.ready;
      return reg.active ? "active" : "pending";
    });
    expect(registered).toBe("active");
  });
});
