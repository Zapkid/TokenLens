// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_OPEN_EVENT,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  analyticsConfigured,
  clearConsent,
  consentModePayload,
  isTrackingCookie,
  parseConsentRecord,
  readConsent,
  readConsentRecord,
  requestConsentDialog,
  storeConsent,
  trackEvent,
  trackingCookieExpirations,
} from "../analytics";

afterEach(() => {
  localStorage.clear();
  delete window.gtag;
  delete window.fbq;
  delete window.twq;
});

describe("consent storage", () => {
  it("round-trips granted and denied as a timestamped, versioned record", () => {
    expect(readConsent()).toBeNull();
    const at = new Date("2026-09-02T10:00:00.000Z");
    storeConsent("granted", at);
    expect(readConsent()).toBe("granted");
    expect(readConsentRecord()).toEqual({
      choice: "granted",
      at: at.toISOString(),
      version: CONSENT_POLICY_VERSION,
    });
    storeConsent("denied");
    expect(readConsent()).toBe("denied");
    clearConsent();
    expect(readConsent()).toBeNull();
  });

  it("rejects garbage, legacy bare strings, and stale policy versions", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readConsent()).toBeNull();
    // Version 1 stored the bare choice; the policy changed, so ask again.
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    expect(readConsent()).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({ choice: "granted", at: "2026-01-01T00:00:00Z", version: 1 }),
      ),
    ).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({ choice: "granted", at: "not a date", version: CONSENT_POLICY_VERSION }),
      ),
    ).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({ choice: "yes", at: "2026-01-01T00:00:00Z", version: CONSENT_POLICY_VERSION }),
      ),
    ).toBeNull();
    expect(parseConsentRecord(null)).toBeNull();
    expect(parseConsentRecord("{not json")).toBeNull();
  });

  it("consentModePayload keys every Consent Mode v2 signal to the choice", () => {
    expect(consentModePayload("granted")).toEqual({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  });

  it("requestConsentDialog fires the reopen event on window", () => {
    const handler = vi.fn();
    window.addEventListener(CONSENT_OPEN_EVENT, handler);
    requestConsentDialog();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(CONSENT_OPEN_EVENT, handler);
  });
});

describe("withdrawal cookie expiry", () => {
  it("recognizes tag cookies by prefix and leaves ours alone", () => {
    expect(isTrackingCookie("_ga")).toBe(true);
    expect(isTrackingCookie("_ga_ABC123")).toBe(true);
    expect(isTrackingCookie("_gcl_au")).toBe(true);
    expect(isTrackingCookie("_fbp")).toBe(true);
    expect(isTrackingCookie("tl_otp_session")).toBe(false);
    expect(isTrackingCookie("")).toBe(false);
  });

  it("expires each tracking cookie on the host and every parent domain", () => {
    const out = trackingCookieExpirations(
      "_ga=GA1.1.1; tl_otp_session=abc; _ga_X1=GS1; _fbp=fb.1",
      "www.example.co.uk",
    );
    const names = new Set(out.map((c) => c.split("=")[0]));
    expect([...names].sort()).toEqual(["_fbp", "_ga", "_ga_X1"]);
    // host itself, www.example.co.uk, example.co.uk, co.uk: 4 variants each.
    expect(out).toHaveLength(12);
    expect(out).toContain(
      "_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=example.co.uk",
    );
    expect(out.some((c) => c.startsWith("_ga=; ") && !c.includes("domain="))).toBe(true);
    expect(out.join("\n")).not.toContain("tl_otp_session");
  });

  it("returns nothing for an empty jar or localhost with no tag cookies", () => {
    expect(trackingCookieExpirations("", "localhost")).toEqual([]);
    expect(trackingCookieExpirations("_ga=1", "localhost")).toEqual([
      "_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/",
    ]);
  });
});

describe("analyticsConfigured", () => {
  it("is true when any tag id is present, false when none are", () => {
    expect(analyticsConfigured({})).toBe(false);
    expect(analyticsConfigured({ ga: "G-1" })).toBe(true);
    expect(analyticsConfigured({ meta: "123" })).toBe(true);
  });
});

describe("trackEvent", () => {
  it("no-ops safely when no tags are present", () => {
    expect(() => trackEvent("generate_lead")).not.toThrow();
  });

  it("fans out to gtag, maps generate_lead to the Meta Lead event, and hits twq", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    const twq = vi.fn();
    window.gtag = gtag;
    window.fbq = fbq;
    window.twq = twq;
    trackEvent("generate_lead", { track: "x" });
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", { track: "x" });
    expect(fbq).toHaveBeenCalledWith("track", "Lead", { track: "x" });
    expect(twq).toHaveBeenCalledWith("event", "generate_lead", { track: "x" });
    trackEvent("select_promotion");
    expect(fbq).toHaveBeenCalledWith("trackCustom", "select_promotion", {});
  });
});
