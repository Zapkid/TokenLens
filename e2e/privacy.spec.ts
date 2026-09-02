// GDPR surfaces: consent withdrawal, data export and erasure, and the
// privacy notice itself. Test-case ids TL-100 to TL-102 in
// docs/test-plans/tokenlens-mvp.md.

import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Privacy and consent", () => {
  test("TL-100 consent can be reviewed and withdrawn as easily as it was given", async ({
    page,
  }) => {
    await page.goto("/bdcc2");
    await page.locator(t(SEL.bdccConsentAccept)).click();
    await expect(page.locator(t(SEL.bdccConsent))).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.querySelectorAll("script[src]")].some((s) =>
            (s as HTMLScriptElement).src.includes("googletagmanager"),
          ),
        ),
      )
      .toBe(true);
    // Plant a tag-style cookie so withdrawal has something to expire.
    await page.evaluate(() => {
      document.cookie = "_ga=GA1.1.test; path=/";
    });

    // The footer link reopens the dialog; declining reloads without tags.
    const manage = page.locator(t(SEL.bdccConsentManage));
    await manage.scrollIntoViewIfNeeded();
    await manage.click();
    await expect(page.locator(t(SEL.bdccConsent))).toBeVisible();
    await Promise.all([
      page.waitForLoadState("load"),
      page.locator(t(SEL.bdccConsentDecline)).click(),
    ]);
    await expect(page.locator(t(SEL.bdccConsent))).toHaveCount(0);
    const after = await page.evaluate(() => ({
      stored: JSON.parse(localStorage.getItem("bdcc-ad-consent") ?? "null"),
      scripts: [...document.querySelectorAll("script[src]")].map((s) =>
        (s as HTMLScriptElement).src,
      ),
      cookie: document.cookie,
    }));
    expect(after.stored.choice).toBe("denied");
    expect(after.scripts.some((s) => s.includes("googletagmanager"))).toBe(false);
    expect(after.cookie).not.toContain("_ga=");
    // Decline is remembered across reloads too.
    await page.reload();
    await expect(page.locator(t(SEL.bdccConsent))).toHaveCount(0);
  });

  test("TL-101 Settings exports every stored item as JSON and erases it all", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.evaluate(() => {
      localStorage.setItem(
        "tokenlens:v1:watchlist",
        JSON.stringify([{ id: "bitcoin", type: "token", name: "Bitcoin", symbol: "BTC" }]),
      );
      localStorage.setItem("tokenlens:v1:riskProfile", JSON.stringify("aggressive"));
      localStorage.setItem(
        "bdcc-ad-consent",
        JSON.stringify({ choice: "denied", at: new Date().toISOString(), version: 2 }),
      );
      sessionStorage.setItem("tl-chunk-reload-at", "1");
    });
    await page.reload();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(t(SEL.privacyExport)).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^tokenlens-data-\d{4}-\d{2}-\d{2}\.json$/);
    const path = await download.path();
    const { readFileSync } = await import("fs");
    const doc = JSON.parse(readFileSync(path!, "utf8"));
    expect(doc.format).toBe("tokenlens-data-export/1");
    expect(doc.items["tokenlens:v1:watchlist"][0].id).toBe("bitcoin");
    expect(doc.items["tokenlens:v1:riskProfile"]).toBe("aggressive");
    expect(doc.items["bdcc-ad-consent"].choice).toBe("denied");

    page.once("dialog", (d) => d.accept());
    await page.locator(t(SEL.privacyErase)).click();
    await expect(page.locator(t(SEL.privacyEraseStatus))).toContainText("erased");
    const left = await page.evaluate(() => ({
      local: Object.keys(localStorage).filter(
        (k) => k.startsWith("tokenlens:") || k === "bdcc-ad-consent",
      ),
      session: sessionStorage.getItem("tl-chunk-reload-at"),
    }));
    expect(left.local).toEqual([]);
    expect(left.session).toBeNull();
    // The dialog can also be dismissed: nothing happens then.
    await page.evaluate(() =>
      localStorage.setItem("tokenlens:v1:riskProfile", JSON.stringify("conservative")),
    );
    page.once("dialog", (d) => d.dismiss());
    await page.locator(t(SEL.privacyErase)).click();
    expect(
      await page.evaluate(() => localStorage.getItem("tokenlens:v1:riskProfile")),
    ).toBe('"conservative"');
  });

  test("TL-102 the privacy notice carries the GDPR Art. 13 content and links to the rights tools", async ({
    page,
    request,
  }) => {
    await page.goto("/privacy");
    const root = page.locator(t(SEL.privacyRoot));
    await expect(page.locator("h1")).toHaveCount(1);
    const text = (await root.innerText()).toLowerCase();
    for (const needle of [
      "controller",
      "legal basis",
      "legitimate interest",
      "retention",
      "cookies and browser storage",
      "tl_otp_session",
      "withdraw",
      "third parties and international transfers",
      "your rights",
      "portability",
      "erasure",
      "supervisory authority",
      "last updated",
    ]) {
      expect(text, needle).toContain(needle);
    }
    expect((await root.locator("h2").count())).toBeGreaterThanOrEqual(8);
    await expect(root.locator('a[href="/settings#your-data"]').first()).toBeVisible();
    // Footer link from the product shell and the lead-form link on BDCC.
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await page.goto("/bdcc");
    await expect(page.locator(t(SEL.bdccLeadPrivacy))).toHaveAttribute("href", "/privacy");
    // Markdown rendition for agents mentions the rights tooling.
    const md = await request.get("/privacy", { headers: { accept: "text/markdown" } });
    expect(md.headers()["content-type"]).toContain("text/markdown");
    expect(await md.text()).toContain("export or erase");
  });
});
