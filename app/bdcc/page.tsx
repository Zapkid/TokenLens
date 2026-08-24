import type { Metadata } from "next";
import {
  BDCC_CONTENT,
  BDCC_PALETTE,
  BDCC_SITE_URL,
  bdccUrl,
  mailHref,
  telHref,
} from "@/lib/bdcc";
import { SEL } from "@/lib/selectors";

export const metadata: Metadata = {
  title: `BDCC · ${BDCC_CONTENT.nameHe}`,
  description: BDCC_CONTENT.heroSubtitle,
};

const P = BDCC_PALETTE;

// Recreated wordmark: the official logo asset is not bundled here, so the
// mark is drawn inline (gold block motif plus the BDCC wordmark).
function BdccLogo() {
  return (
    <div
      data-testid={SEL.bdccLogo}
      className="flex items-center gap-3"
      dir="ltr"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        aria-hidden
        className="shrink-0"
      >
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          fill="none"
          stroke={P.gold}
          strokeWidth="2.5"
        />
        <polygon points="20,10 28,14.5 28,23.5 20,28 12,23.5 12,14.5" fill={P.gold} />
        <polygon
          points="20,10 28,14.5 20,19 12,14.5"
          fill={P.goldSoft}
        />
      </svg>
      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-wide" style={{ color: P.text }}>
          BDCC
        </div>
        <div className="text-[11px]" style={{ color: P.textMuted }}>
          {BDCC_CONTENT.nameHe}
        </div>
      </div>
    </div>
  );
}

function GoldButton({
  href,
  children,
  testId,
  solid = true,
}: {
  href: string;
  children: React.ReactNode;
  testId?: string;
  solid?: boolean;
}) {
  return (
    <a
      href={href}
      data-testid={testId}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
      style={
        solid
          ? { background: P.gold, color: P.bg }
          : { border: `1px solid ${P.gold}`, color: P.gold }
      }
    >
      {children}
    </a>
  );
}

export default function BdccLandingPage() {
  const c = BDCC_CONTENT;
  return (
    <div
      data-testid={SEL.bdccRoot}
      dir="rtl"
      lang="he"
      className="-mx-4 -mt-6 overflow-hidden rounded-none sm:-mx-6 sm:rounded-2xl"
      style={{ background: P.bg, color: P.text }}
    >
      {/* Top bar */}
      <header
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8"
        style={{ borderBottom: `1px solid ${P.line}` }}
      >
        <BdccLogo />
        <GoldButton href={bdccUrl("/courses")} solid={false}>
          לאתר הרשמי
        </GoldButton>
      </header>

      {/* Hero */}
      <section
        data-testid={SEL.bdccHero}
        className="relative px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(60rem 24rem at 85% -10%, ${P.surfaceRaised} 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-2xl">
          <p
            className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: P.surfaceRaised, color: P.goldSoft }}
          >
            מבית CryptoJungle, מאז 2017
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            {c.heroTitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg" style={{ color: P.textMuted }}>
            {c.heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <GoldButton href={bdccUrl("/courses")} testId={SEL.bdccCtaCourses}>
              לצפייה בקורסים
            </GoldButton>
            <GoldButton
              href={mailHref(c.contact.email)}
              testId={SEL.bdccCtaContact}
              solid={false}
            >
              דברו איתנו
            </GoldButton>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="grid grid-cols-1 gap-px sm:grid-cols-3"
        style={{ background: P.line }}
      >
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="px-5 py-5 text-center sm:px-8"
            style={{ background: P.surface }}
          >
            <div className="text-xl font-bold" style={{ color: P.gold }}>
              {s.value}
            </div>
            <div className="mt-1 text-xs" style={{ color: P.textMuted }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Courses */}
      <section className="px-5 py-12 sm:px-8">
        <h2 className="text-2xl font-bold">מסלולי הלימוד</h2>
        <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
          שלושה מסלולים, מהצעד הראשון ועד הסמכה מקצועית.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.courses.map((course) => (
            <a
              key={course.id}
              href={bdccUrl(course.path)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={SEL.bdccCourseCard}
              className="group flex flex-col rounded-xl p-5 transition-transform hover:-translate-y-0.5"
              style={{
                background: P.surface,
                border: `1px solid ${P.line}`,
              }}
            >
              {course.badge ? (
                <span
                  className="mb-3 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: P.gold, color: P.bg }}
                >
                  {course.badge}
                </span>
              ) : null}
              <h3 className="text-lg font-bold" style={{ color: P.goldSoft }}>
                {course.title}
              </h3>
              <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
                {course.tagline}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {course.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden style={{ color: P.gold }}>
                      ◆
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <span
                className="mt-5 text-sm font-semibold group-hover:underline"
                style={{ color: P.gold }}
              >
                לפרטים באתר ←
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        className="px-5 py-12 sm:px-8"
        style={{ background: P.surface, borderTop: `1px solid ${P.line}` }}
      >
        <h2 className="text-2xl font-bold">על המכללה</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: P.textMuted }}>
          {c.about}
        </p>
      </section>

      {/* Contact */}
      <footer
        data-testid={SEL.bdccContact}
        className="px-5 py-10 sm:px-8"
        style={{ borderTop: `1px solid ${P.line}` }}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <span style={{ color: P.textMuted }}>{c.contact.city}</span>
          <a
            href={telHref(c.contact.phone)}
            className="font-medium hover:underline"
            style={{ color: P.goldSoft }}
            dir="ltr"
          >
            {c.contact.phoneDisplay}
          </a>
          <a
            href={mailHref(c.contact.email)}
            className="font-medium hover:underline"
            style={{ color: P.goldSoft }}
            dir="ltr"
          >
            {c.contact.email}
          </a>
          <a
            href={BDCC_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: P.goldSoft }}
            dir="ltr"
          >
            www.bdcc.co.il
          </a>
        </div>
        <p className="mt-5 text-xs" style={{ color: P.textMuted }}>
          {c.disclaimer}
        </p>
      </footer>
    </div>
  );
}
