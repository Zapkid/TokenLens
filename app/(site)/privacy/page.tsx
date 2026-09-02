import Link from "next/link";
import { Card } from "@/components/ui";
import { PRIVACY_POLICY_UPDATED } from "@/lib/privacy";
import { SEL } from "@/lib/selectors";

export const metadata = {
  title: "Privacy · TokenLens",
  description:
    "GDPR privacy notice: who is responsible, what TokenLens processes and why, cookies and browser storage, third parties, retention, and your rights.",
  alternates: { canonical: "/privacy" },
};

// Controller identity comes from the same public env vars the homepage
// JSON-LD uses; nothing is fabricated when they are unset.
const controller = {
  name: process.env.NEXT_PUBLIC_ORG_NAME,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  street: process.env.NEXT_PUBLIC_ORG_STREET,
  locality: process.env.NEXT_PUBLIC_ORG_LOCALITY,
  postal: process.env.NEXT_PUBLIC_ORG_POSTAL,
  country: process.env.NEXT_PUBLIC_ORG_COUNTRY,
};

const address = [
  controller.street,
  [controller.postal, controller.locality].filter(Boolean).join(" "),
  controller.country,
]
  .filter(Boolean)
  .join(", ");

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-2 font-semibold text-ink">{children}</h2>;
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-xs">
        <thead>
          <tr className="border-b border-hairline text-faint">
            {head.map((h) => (
              <th key={h} className="py-1.5 pe-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-hairline align-top">
              {r.map((c, i) => (
                <td key={i} className="py-1.5 pe-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" data-testid={SEL.privacyRoot}>
      <h1 className="text-2xl font-bold">Privacy notice</h1>
      <p className="text-xs text-faint">
        Last updated {PRIVACY_POLICY_UPDATED}. Written for the EU and UK
        General Data Protection Regulation (GDPR) and the ePrivacy rules on
        cookies; the same protections apply to every visitor wherever they
        are.
      </p>
      <Card>
        <div className="space-y-3 text-sm text-ink-2">
          <H2>The short version</H2>
          <p>
            TokenLens has no accounts and no sign-up. Your watchlist,
            portfolio, preferences, and consent choice live in your own
            browser. The server keeps nothing about you unless you turn on
            personal sync with your own token. No analytics or advertising
            script loads anywhere on this site until you say yes, and you
            can say no or change your mind at any time. You can export or
            erase everything from{" "}
            <Link href="/settings#your-data" className="underline">
              Settings, Your data
            </Link>
            .
          </p>

          <H2>Who is responsible (controller)</H2>
          <p>
            The controller for this deployment is{" "}
            {controller.name ?? "the operator of this TokenLens instance"}
            {address ? `, ${address}` : ""}.{" "}
            {controller.email ? (
              <>
                Contact for privacy matters:{" "}
                <a href={`mailto:${controller.email}`} className="underline">
                  {controller.email}
                </a>
                .
              </>
            ) : (
              <>
                Contact for privacy matters: see the{" "}
                <Link href="/contact" className="underline">
                  contact page
                </Link>
                .
              </>
            )}{" "}
            TokenLens is open source; anyone may run their own copy, and each
            operator is the controller for their copy.
          </p>

          <H2>What is processed, why, and on which legal basis</H2>
          <Table
            head={["Activity", "Data", "Purpose", "Legal basis", "Retention"]}
            rows={[
              [
                "Serving pages and the API",
                "IP address, user agent, requested URL, timestamps (standard server and hosting logs)",
                "Delivering the site, security, abuse prevention",
                "Legitimate interest, Art. 6(1)(f)",
                "Hosting provider log retention, typically days to a few weeks; not used to build profiles",
              ],
              [
                "API rate limiting",
                "IP address (first hop of X-Forwarded-For), request count",
                "Fair use of the public API",
                "Legitimate interest, Art. 6(1)(f)",
                "In memory only, dropped after the 60 second window",
              ],
              [
                "Your preferences",
                "Watchlist, positions, asset tiers, scoring weights, risk profile, up to 12 saved reports",
                "Making the app work for you",
                "Not transmitted to us: stored in your browser (localStorage), under your control",
                "Until you erase them or clear site data",
              ],
              [
                "Personal sync (optional)",
                "The same watchlist, positions, and tiers, mirrored to a server store you unlock with a token",
                "Sharing your state with the MCP connector on your instruction",
                "Contract or your request, Art. 6(1)(b); you enable it explicitly",
                "Until you erase it (Settings, Your data clears the server copy too)",
              ],
              [
                "Onchain analytics gate",
                "The site owner's configured email address and a one-time code hash",
                "Protecting the operator's paid data quota",
                "Legitimate interest, Art. 6(1)(f); only the operator's own address is used",
                "Code hashes expire after 5 minutes; sessions after 10",
              ],
              [
                "BDCC landing page lead form",
                "Name, phone, email, chosen track, marketing consent",
                "Letting you contact the college",
                "Not processed by us: submitting opens a draft in your own mail client and only you decide to send it",
                "Nothing is stored on this site",
              ],
              [
                "Analytics and advertising (BDCC pages only, if configured)",
                "Cookies and identifiers set by Google, Meta, or X, page views, conversion events",
                "Measuring and advertising the college's courses",
                "Consent, Art. 6(1)(a) and ePrivacy; nothing loads until you accept",
                "Per the provider's policy; withdrawing consent expires their first-party cookies here",
              ],
            ]}
          />
          <p>
            TokenLens scores and scenarios describe crypto assets, not you.
            There is no profiling and no automated decision-making about
            people (Art. 22). The site is not directed at children under 16
            and knowingly collects nothing from them.
          </p>

          <H2>Cookies and browser storage</H2>
          <Table
            head={["Name", "Kind", "Set by", "Purpose", "Lifetime"]}
            rows={[
              [
                "tl_otp_session",
                "Cookie (httpOnly, strict same-site, secure)",
                "TokenLens, only after the owner verifies an email code",
                "Onchain analytics session; strictly necessary for that feature",
                "10 minutes",
              ],
              [
                "tokenlens:v1:*",
                "localStorage",
                "TokenLens",
                "Your preferences, watchlist, positions, saved reports, optional sync token; strictly necessary for the features you use",
                "Until erased",
              ],
              [
                "bdcc-ad-consent",
                "localStorage",
                "TokenLens",
                "Records your consent choice with a timestamp and policy version so we can prove it and not ask again",
                "Until erased or the consent text changes",
              ],
              [
                "tl-chunk-reload-at",
                "sessionStorage",
                "TokenLens",
                "Prevents a reload loop after a deployment; technical",
                "Browser tab",
              ],
              [
                "Offline cache",
                "Service worker Cache Storage",
                "TokenLens",
                "Offline fallback page and static assets; contains no personal data",
                "Until erased or the app version changes",
              ],
              [
                "_ga, _gid, _gcl_*, _fbp, _fbc, _twclid and similar",
                "Cookies",
                "Google, Meta, X",
                "Analytics and advertising on the BDCC landing pages",
                "Only after consent; expired on withdrawal",
              ],
            ]}
          />
          <p>
            Strictly necessary storage does not need consent under ePrivacy
            Art. 5(3). Everything else is off by default. Declining keeps the
            site fully functional.
          </p>

          <H2>Consent: how it works and how to withdraw it</H2>
          <p>
            On the BDCC landing pages a banner asks before any Google, Meta,
            or X script is loaded. Accept and decline are equally easy, one
            click each, and no script is loaded while you have not chosen.
            Your choice is stored with the date and the version of the text
            you saw. To review or withdraw it, use the &quot;cookie
            settings&quot; link in the page footer: withdrawing expires the
            tags&apos; first-party cookies and reloads the page without them.
            Withdrawal does not affect processing that happened while consent
            was in force (Art. 7(3)). If the consent text changes, you will
            be asked again.
          </p>

          <H2>Third parties and international transfers</H2>
          <ul className="list-disc space-y-1.5 ps-5">
            <li>
              Hosting: the site is served by a hosting platform (Vercel on the
              reference deployment) that processes request logs as our
              processor under its data processing terms, with standard
              contractual clauses for transfers outside the EEA.
            </li>
            <li>
              Market data: CoinGecko, DeFiLlama, and alternative.me are called
              server-side. Your browser never contacts them, and none of your
              data is sent to them.
            </li>
            <li>
              Personal sync storage (only if the operator configured it):
              Supabase or Upstash hold the synced document as processors; the
              operator chooses the region.
            </li>
            <li>
              Email codes: Resend delivers one-time codes to the operator&apos;s
              own address only.
            </li>
            <li>
              Video: the BDCC pages embed a Vimeo player with the Do Not Track
              flag, so Vimeo does not track viewing sessions. Loading the
              player still sends your IP address to Vimeo, which is necessary
              to play the video.
            </li>
            <li>
              Analytics and advertising (Google, Meta, X): only after consent,
              and only on the BDCC pages. These providers may transfer data to
              the United States under the EU-US Data Privacy Framework or
              standard contractual clauses; their own notices describe the
              details.
            </li>
            <li>
              Images: gallery pictures are served through this site&apos;s own
              image optimizer, so your browser does not request them from the
              original host.
            </li>
          </ul>
          <p>
            We never sell personal data and there is no cross-site tracking
            outside the consented tags.
          </p>

          <H2>Your rights</H2>
          <p>
            Under the GDPR you have the right of access (Art. 15),
            rectification (Art. 16), erasure (Art. 17), restriction (Art. 18),
            data portability (Art. 20), objection to processing based on
            legitimate interest (Art. 21), and to withdraw consent at any
            time. Because your data lives in your browser, you can exercise
            most of these yourself, instantly:
          </p>
          <ul className="list-disc space-y-1.5 ps-5">
            <li>
              Access and portability:{" "}
              <Link href="/settings#your-data" className="underline">
                Settings, Your data, Export
              </Link>{" "}
              downloads everything as a machine-readable JSON file.
            </li>
            <li>
              Erasure: the Erase button on the same page removes all local
              data, the synced server copy if you configured a token, and the
              offline cache.
            </li>
            <li>
              Rectification: edit your watchlist, positions, and settings
              directly in the app.
            </li>
            <li>
              Consent: the cookie settings link in the BDCC page footer.
            </li>
          </ul>
          <p>
            For anything that needs the operator (for example server log
            questions) write to the contact above. We answer within one month.
            Identity checks are proportionate: since we hold no account, we
            may ask what you need us to look for. You also have the right to
            lodge a complaint with a supervisory authority, in particular in
            the EU member state of your residence, workplace, or the alleged
            infringement; the{" "}
            <a
              href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              European Data Protection Board lists them
            </a>
            . In the UK that is the Information Commissioner&apos;s Office.
          </p>

          <H2>Security</H2>
          <p>
            All traffic is HTTPS with HSTS. Secrets stay server-side and are
            never exposed to the browser. The sync token is compared in
            constant time, one-time codes are stored only as salted hashes,
            and the sync store is locked down so only the server can reach it.
            The full source is public for review.
          </p>

          <H2>Changes</H2>
          <p>
            Changes to this notice are published here with a new date. A
            change that widens what consent covers bumps the consent version,
            which makes the banner ask again.
          </p>
        </div>
      </Card>
    </div>
  );
}
