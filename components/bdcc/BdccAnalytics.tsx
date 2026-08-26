"use client";

// Consent banner and tag loader for the BDCC landing page. Renders nothing
// unless at least one tag id is configured. Google tags (gtag/GTM) bootstrap
// immediately with Consent Mode v2 defaults set to denied, so denied visits
// send only cookieless pings; Meta and X pixels are injected only after the
// visitor accepts. The choice persists in localStorage.

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  BDCC_CONTENT,
  BDCC_PALETTE,
} from "@/lib/bdcc";
import {
  analyticsConfigured,
  analyticsIds,
  consentModePayload,
  readConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/analytics";
import { SEL } from "@/lib/selectors";

const P = BDCC_PALETTE;

export function BdccAnalytics() {
  const ids = analyticsIds();
  const configured = analyticsConfigured(ids);
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readConsent());
    setReady(true);
  }, []);

  if (!configured) return null;

  const decide = (value: ConsentChoice) => {
    storeConsent(value);
    setChoice(value);
    window.gtag?.("consent", "update", consentModePayload(value));
  };

  const granted = choice === "granted";

  return (
    <>
      {/* Consent Mode v2 defaults; rendered first so the inline snippet
          executes before the async gtag.js download completes. */}
      <Script id="bdcc-consent-default" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'});
gtag('js', new Date());`}
      </Script>
      {ids.ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ids.ga}`}
            strategy="afterInteractive"
          />
          <Script id="bdcc-ga-config" strategy="afterInteractive">
            {`window.gtag && gtag('config', '${ids.ga}');`}
          </Script>
        </>
      ) : null}
      {ids.gtm ? (
        <Script id="bdcc-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtm}');`}
        </Script>
      ) : null}
      {granted && ids.meta ? (
        <Script id="bdcc-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${ids.meta}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
      {granted && ids.x ? (
        <Script id="bdcc-x-pixel" strategy="afterInteractive">
          {`!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config', '${ids.x}');`}
        </Script>
      ) : null}
      {ready && choice === null ? (
        <div
          data-testid={SEL.bdccConsent}
          role="dialog"
          aria-label="הסכמה לעוגיות"
          dir="rtl"
          lang="he"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm shadow-2xl"
          style={{
            background: P.surfaceRaised,
            border: `1px solid ${P.line}`,
            color: P.text,
          }}
        >
          <p className="max-w-md text-xs" style={{ color: P.textMuted }}>
            {BDCC_CONTENT.consent.text}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid={SEL.bdccConsentAccept}
              onClick={() => decide("granted")}
              className="rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: P.gold, color: P.bg }}
            >
              {BDCC_CONTENT.consent.accept}
            </button>
            <button
              type="button"
              data-testid={SEL.bdccConsentDecline}
              onClick={() => decide("denied")}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ border: `1px solid ${P.line}`, color: P.textMuted }}
            >
              {BDCC_CONTENT.consent.decline}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
