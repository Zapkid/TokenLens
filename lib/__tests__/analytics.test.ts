// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  analyticsConfigured,
  consentModePayload,
  readConsent,
  storeConsent,
  trackEvent,
} from "../analytics";

afterEach(() => {
  localStorage.clear();
  delete window.gtag;
  delete window.fbq;
  delete window.twq;
});

describe("consent storage", () => {
  it("round-trips granted and denied and rejects garbage", () => {
    expect(readConsent()).toBeNull();
    storeConsent("granted");
    expect(readConsent()).toBe("granted");
    storeConsent("denied");
    expect(readConsent()).toBe("denied");
    localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readConsent()).toBeNull();
  });

  it("consentModePayload keys every Consent Mode v2 signal to the choice", () => {
    expect(consentModePayload("granted")).toEqual({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
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
