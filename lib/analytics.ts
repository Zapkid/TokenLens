// Consent-aware ad and analytics plumbing for the BDCC landing page.
// Tag ids are public identifiers (never secrets) supplied via NEXT_PUBLIC_*
// env vars; nothing loads when they are unset. No tag (Google, Meta, or X)
// is loaded until the visitor grants consent: even Consent Mode "denied"
// pings would send IP and user agent to Google, which under GDPR and
// ePrivacy still needs consent. Consent is recorded with a timestamp and
// policy version and can be withdrawn at any time.

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

/**
 * Bump when the consent text or the set of tags it covers changes: stored
 * choices from an older version no longer count and the banner asks again
 * (GDPR consent must be specific to what it covers).
 */
export const CONSENT_POLICY_VERSION = 2;

/** What is persisted for a choice: the choice itself, when it was made,
 * and which policy version the visitor saw. Timestamp and version are the
 * accountability record GDPR Art. 7(1) asks the controller to keep. */
export interface ConsentRecord {
  choice: ConsentChoice;
  at: string;
  version: number;
}

/** Parse a stored value into a record, or null when it is missing, garbage,
 * or from an earlier policy version. Legacy bare "granted"/"denied" strings
 * (version 1) are treated as stale for the same reason. */
export function parseConsentRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<ConsentRecord> | string;
    if (typeof v !== "object" || v === null) return null;
    if (v.choice !== "granted" && v.choice !== "denied") return null;
    if (v.version !== CONSENT_POLICY_VERSION) return null;
    if (typeof v.at !== "string" || Number.isNaN(Date.parse(v.at))) return null;
    return { choice: v.choice, at: v.at, version: v.version };
  } catch {
    return null;
  }
}

export function readConsentRecord(): ConsentRecord | null {
  try {
    return parseConsentRecord(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function readConsent(): ConsentChoice | null {
  return readConsentRecord()?.choice ?? null;
}

export function storeConsent(choice: ConsentChoice, now: Date = new Date()): void {
  const record: ConsentRecord = {
    choice,
    at: now.toISOString(),
    version: CONSENT_POLICY_VERSION,
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private mode: the banner will simply reappear next visit.
  }
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Fired on window when the visitor asks to review their choice (the
 * "cookie settings" link); the banner listens and reopens. Withdrawal must
 * be as easy as granting (GDPR Art. 7(3)). */
export const CONSENT_OPEN_EVENT = "bdcc-consent-open";

export function requestConsentDialog(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** First-party cookie names the consented tags are known to set. Used to
 * expire them on withdrawal; the list is best effort and harmless when a
 * name is absent. */
export const TRACKING_COOKIE_PREFIXES = [
  "_ga",
  "_gid",
  "_gat",
  "_gcl",
  "_fbp",
  "_fbc",
  "_twclid",
  "muc_ads",
];

export function isTrackingCookie(name: string): boolean {
  return TRACKING_COOKIE_PREFIXES.some((p) => name === p || name.startsWith(p));
}

/**
 * Cookie header strings that expire every tracking cookie present in
 * `cookieHeader`, for the host itself and each parent domain (tags set
 * their cookies on the registrable domain, which only a matching Domain
 * attribute can clear). Pure so the expansion is unit-testable.
 */
export function trackingCookieExpirations(
  cookieHeader: string,
  hostname: string,
): string[] {
  const names = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((n) => n && isTrackingCookie(n));
  const parts = hostname.split(".").filter(Boolean);
  const domains: (string | null)[] = [null];
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(parts.slice(i).join("."));
  }
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  const out: string[] = [];
  for (const name of new Set(names)) {
    for (const d of domains) {
      out.push(`${name}=; ${expired}${d ? `; domain=${d}` : ""}`);
    }
  }
  return out;
}

export function expireTrackingCookies(): void {
  if (typeof document === "undefined") return;
  for (const c of trackingCookieExpirations(document.cookie, location.hostname)) {
    document.cookie = c;
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
