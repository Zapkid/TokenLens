import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Onchain analytics behind the OTP gate", () => {
  test("TL-088 the API refuses onchain requests without a session", async ({
    request,
  }) => {
    const res = await request.get("/api/onchain?network=eth");
    expect(res.status()).toBe(401);
    const status = await request.get("/api/otp");
    const json = (await status.json()) as {
      enabled: boolean;
      authenticated: boolean;
    };
    expect(json.enabled).toBe(true);
    expect(json.authenticated).toBe(false);
  });

  test("TL-089 full gate flow: code request, wrong code rejected, right code opens a session", async ({
    page,
  }) => {
    await page.goto("/onchain");
    await expect(page.locator(t(SEL.onchainRoot))).toBeVisible();
    await page.locator(t(SEL.otpRequest)).click();
    const codeInput = page.locator(t(SEL.otpCodeInput));
    await expect(codeInput).toBeVisible();

    // Fixture mode surfaces the issued code for tests.
    const hint = page.getByText(/Fixture mode code/);
    await expect(hint).toBeVisible();
    const code = (await hint.textContent())?.match(/(\d{6})/)?.[1] ?? "";
    expect(code).toMatch(/^\d{6}$/);

    const wrong = code === "000000" ? "111111" : "000000";
    await codeInput.fill(wrong);
    await page.locator(t(SEL.otpVerify)).click();
    await expect(page.locator(t(SEL.otpError))).toBeVisible();

    await codeInput.fill(code);
    await page.locator(t(SEL.otpVerify)).click();
    const table = page.locator(t(SEL.onchainTable));
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).toHaveCount(6);

    // The 10 minute session now authorizes API calls without a new code.
    const sessionRes = await page.request.get("/api/onchain?network=solana");
    expect(sessionRes.status()).toBe(200);
    const json = (await sessionRes.json()) as { pools: unknown[] };
    expect(json.pools).toHaveLength(6);

    // Switching networks reloads pools within the same session.
    await page.locator(t(SEL.onchainNetwork)).selectOption("base");
    await expect(table.locator("tbody tr")).toHaveCount(6);
  });

  test("TL-090 the Onchain nav destination reaches the gate", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator(t(SEL.navOnchain)).click();
    await expect(page).toHaveURL(/\/onchain/);
    await expect(page.locator(t(SEL.onchainRoot))).toBeVisible();
  });
});
