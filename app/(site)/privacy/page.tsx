import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Privacy · TokenLens",
  description:
    "What TokenLens stores, which cookies it sets, and how consent for analytics and advertising works.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Privacy</h1>
      <Card>
        <div className="space-y-3 text-sm text-ink-2">
          <h2 className="font-semibold text-ink">No accounts, local first</h2>
          <p>
            TokenLens has no user accounts and no sign-up. Your watchlist,
            portfolio positions, scoring weight preferences, and consent
            choices are stored in your own browser (localStorage) and never
            leave it by default. If you explicitly configure the optional
            personal sync token, those same items are mirrored to the server
            store you control; the token is required for every read and write.
          </p>
          <h2 className="font-semibold text-ink">Cookies</h2>
          <p>
            The only cookie TokenLens itself sets is the short-lived onchain
            analytics session (tl_otp_session): httpOnly, strict same-site,
            expiring after 10 minutes, created only when the site owner
            verifies an email code. Consent decisions are stored in
            localStorage, not cookies.
          </p>
          <h2 className="font-semibold text-ink">Analytics and advertising</h2>
          <p>
            Analytics and advertising tags (Google Analytics or Tag Manager,
            Meta and X pixels) are configured per deployment and load in a
            consent-gated way: Google tags start with Consent Mode set to
            denied, and Meta and X pixels are not loaded at all until you
            accept the consent banner. Declining keeps the site fully
            functional.
          </p>
          <h2 className="font-semibold text-ink">Forms and third parties</h2>
          <p>
            The demo landing page lead form never transmits your details to
            this server: submitting opens a pre-filled draft in your own mail
            client, and sending it is entirely your choice. Market data is
            fetched server-side from CoinGecko, DeFiLlama, and alternative.me;
            your browser does not talk to those providers directly. Gallery
            images are served through this site&apos;s own image optimizer.
          </p>
          <p>
            Questions? See{" "}
            <Link href="/contact" className="underline">
              contact
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
