import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Arbitrum course project page", () => {
  test("TL-114 /arb renders in English by default with all questions and live fixture data", async ({ page }) => {
    await page.goto("/");
    await page.locator(t(SEL.navArb)).click();
    await expect(page).toHaveURL(/\/arb$/);
    const root = page.locator(t(SEL.arbRoot));
    await expect(root).toHaveAttribute("dir", "ltr");
    await expect(root).toHaveAttribute("lang", "en");
    await expect(page.locator(t(SEL.arbQuestion))).toHaveCount(29);
    await expect(page.locator(t(SEL.arbGuidelines))).toContainText("30 March 2027");
    await expect(page.locator(t(SEL.arbTimeline)).locator("li")).toHaveCount(7);
    await expect(page.locator(t(SEL.arbLiveStatus))).toHaveAttribute("data-status", "ready");
    await expect(page.locator(t(SEL.arbLivePanel))).toContainText("Synthetic fixture data");
    await expect(page.locator(t(SEL.arbTrendChart)).first()).toBeVisible();
  });

  test("TL-115 Hebrew switch flips to RTL and the choice survives a reload", async ({ page }) => {
    await page.goto("/arb");
    await page.locator(t(SEL.arbLangToggle)).click();
    const root = page.locator(t(SEL.arbRoot));
    await expect(root).toHaveAttribute("dir", "rtl");
    await expect(page.locator("h1")).toContainText("פרויקט גמר");
    await expect(page).toHaveURL(/lang=he/);
    await page.goto("/arb");
    await expect(root).toHaveAttribute("dir", "rtl");
    await page.locator(t(SEL.arbLangToggle)).click();
    await expect(root).toHaveAttribute("dir", "ltr");
  });

  for (const lang of ["en", "he"] as const) {
    test(`TL-116 Word download (${lang}) is Arial 12 pt with 1.5 spacing`, async ({ page }) => {
      await page.goto(lang === "he" ? "/arb?lang=he" : "/arb");
      await expect(page.locator(t(SEL.arbLiveStatus))).toHaveAttribute("data-status", "ready");
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator(t(SEL.arbDownload)).click(),
      ]);
      expect(download.suggestedFilename()).toBe(
        lang === "he" ? "Arbitrum-final-project-HE.docx" : "Arbitrum-final-project-EN.docx",
      );
      const path = await download.path();
      const files = unzipSync(new Uint8Array(readFileSync(path)));
      const xml = strFromU8(files["word/document.xml"]);
      expect(xml).toContain('w:ascii="Arial"');
      expect(xml).toContain('<w:sz w:val="24"/>');
      expect(xml).toContain('w:line="360"');
      if (lang === "he") {
        expect(xml).toContain("<w:bidi/>");
        expect(xml).toContain("מהות הפרויקט");
      } else {
        expect(xml).toContain("What the project is");
      }
      await expect(page.locator(t(SEL.arbDownloadError))).toHaveCount(0);
    });
  }

  test("TL-117 /api/arb serves labeled fixture JSON; /arb negotiates markdown", async ({ request }) => {
    const res = await request.get("/api/arb");
    expect(res.status()).toBe(200);
    expect(res.headers()["x-api-version"]).toBe("1");
    const body = await res.json();
    expect(body.mode).toBe("fixture");
    expect(body.market.priceUsd).toBeGreaterThan(0);
    expect(body.github.commits30d).toBeGreaterThan(0);

    const md = await request.get("/arb", { headers: { Accept: "text/markdown" } });
    expect(md.status()).toBe(200);
    const text = await md.text();
    expect(text).toContain("### B.5 Real adoption versus token value");
  });
});
