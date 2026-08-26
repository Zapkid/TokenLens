// Consent-aware ad and analytics plumbing for the BDCC landing page.
// Tag ids are public identifiers (never secrets) supplied via NEXT_PUBLIC_*
// env vars; nothing loads when they are unset. Google tags bootstrap with
// Consent Mode v2 defaults set to denied; Meta and X pixels load only after
// the visitor accepts the banner.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    twq?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsIds {
  ga?: string;
  gtm?: string;
  meta?: string;
  x?: string;
}

/** Static property access keeps NEXT_PUBLIC_* inlining working. */
export function analyticsIds(): AnalyticsIds {
  return {
    ga: process.env.NEXT_PUBLIC_GA_ID || undefined,
    gtm: process.env.NEXT_PUBLIC_GTM_ID || undefined,
    meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined,
    x: process.env.NEXT_PUBLIC_X_PIXEL_ID || undefined,
  };
}

export function analyticsConfigured(ids: AnalyticsIds = analyticsIds()): boolean {
  return Boolean(ids.ga || ids.gtm || ids.meta || ids.x);
}

export type ConsentChoice = "granted" | "denied";
export const CONSENT_STORAGE_KEY = "bdcc-ad-consent";

export function readConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Private mode: the banner will simply reappear next visit.
  }
}

/** Consent Mode v2 signal set, all keyed to one choice. */
export function consentModePayload(choice: ConsentChoice) {
  return {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  };
}

/**
 * Fire a conversion event on every tag that is present. Safe to call
 * unconditionally: absent tags no-op, and Google tags gate delivery through
 * Consent Mode on their own.
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number> = {},
): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  if (window.fbq) {
    if (name === "generate_lead") window.fbq("track", "Lead", params);
    else window.fbq("trackCustom", name, params);
  }
  window.twq?.("event", name, params);
}
