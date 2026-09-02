"use client";

// /bdcc2: second visual take on the BDCC landing page. Same content model
// as /bdcc (lib/bdcc.ts), styled after a light isometric "crypto academy"
// look: pastel gradient hero over an isometric grid, floating crystal and
// coin art, an extruded gradient headline, green pill CTAs, and navy cards.

import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { ConsentSettingsLink } from "@/components/bdcc/BdccAnalytics";
import {
  BDCC2_PALETTE,
  BDCC_CONTENT,
  BDCC_SITE_URL,
  bdccUrl,
  buildLeadMailto,
  isValidLead,
  mailHref,
  telHref,
  type BdccCohort,
  type BdccCourse,
  type BdccLead,
} from "@/lib/bdcc";
import { SEL } from "@/lib/selectors";
import {
  MagneticLink,
  Reveal,
  SafeImg,
  useCountUp,
  useInView,
} from "@/components/bdcc/primitives";
import styles from "./bdcc2.module.css";

const P = BDCC2_PALETTE;

const pillSolid: React.CSSProperties = {
  background: P.teal,
  color: "#ffffff",
};

const pillOutline: React.CSSProperties = {
  border: `2px solid ${P.purple}`,
  color: P.purpleDeep,
  background: "rgba(255,255,255,0.7)",
};

/* ------------------------------ iso artwork ------------------------------ */

function Gem({
  size = 56,
  from = "#8b5cf6",
  to = "#4cd7e8",
}: {
  size?: number;
  from?: string;
  to?: string;
}) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 56 64" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <ellipse cx="28" cy="59" rx="18" ry="4" fill="rgba(30,35,64,0.14)" />
      <polygon points="28,2 44,18 37,54 19,54 12,18" fill={`url(#${id})`} />
      <polygon points="28,2 44,18 28,24 12,18" fill="#ffffff" opacity="0.25" />
      <polygon points="28,24 37,54 19,54" fill="#1e2340" opacity="0.12" />
    </svg>
  );
}

function IsoCoin({
  symbol,
  from,
  to,
  size = 64,
}: {
  symbol: string;
  from: string;
  to: string;
  size?: number;
}) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="57" rx="20" ry="4.5" fill="rgba(30,35,64,0.14)" />
      <g transform="rotate(-16 32 30)">
        <ellipse cx="32" cy="34" rx="21" ry="19" fill={to} opacity="0.85" />
        <ellipse cx="32" cy="29" rx="21" ry="19" fill={`url(#${id})`} />
        <text
          x="32"
          y="37"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="#ffffff"
        >
          {symbol}
        </text>
      </g>
    </svg>
  );
}

function IsoPlatform({ size = 72 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size * 0.66} viewBox="0 0 72 48" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9b6f7" />
          <stop offset="1" stopColor="#8ce0ea" />
        </linearGradient>
      </defs>
      <polygon points="36,26 68,40 36,54 4,40" fill="#1e2340" opacity="0.18" />
      <polygon points="36,4 68,18 36,32 4,18" fill={`url(#${id})`} />
      <polygon points="4,18 36,32 36,40 4,26" fill="#8b5cf6" opacity="0.45" />
      <polygon points="68,18 36,32 36,40 68,26" fill="#4cd7e8" opacity="0.45" />
    </svg>
  );
}

function HeroArt() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className={`absolute right-[6%] top-[12%] ${styles.floatA}`}>
        <IsoCoin symbol="₿" from="#a78bfa" to="#6d3fd6" size={72} />
      </div>
      <div className={`absolute left-[8%] top-[16%] hidden sm:block ${styles.floatB}`}>
        <Gem size={64} from="#8b5cf6" to="#e879b9" />
      </div>
      <div className={`absolute left-[22%] bottom-[10%] ${styles.floatC}`}>
        <Gem size={44} from="#4cd7e8" to="#2f9e77" />
      </div>
      <div className={`absolute right-[20%] bottom-[14%] hidden sm:block ${styles.floatD}`}>
        <IsoCoin symbol="Ξ" from="#7dd8f0" to="#5f7ce8" size={56} />
      </div>
      <div className={`absolute left-[42%] top-[6%] hidden lg:block ${styles.floatB}`}>
        <IsoPlatform size={84} />
      </div>
    </div>
  );
}

function Bdcc2Logo() {
  const id = useId();
  return (
    <div data-testid={SEL.bdccLogo} className="flex items-center gap-3" dir="ltr">
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={P.purple} />
            <stop offset="1" stopColor={P.cyan} />
          </linearGradient>
        </defs>
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="2.5"
        />
        <polygon points="20,10 28,14.5 28,23.5 20,28 12,23.5 12,14.5" fill={`url(#${id})`} />
      </svg>
      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-wide" style={{ color: P.navy }}>
          BDCC
        </div>
        <div className="text-[11px]" style={{ color: P.textMuted }}>
          {BDCC_CONTENT.nameHe}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- sections ------------------------------- */

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const display = useCountUp(value, inView);
  return (
    <div ref={ref}>
      <Reveal delay={delay} className="h-full">
        <div className={`${styles.lightCard} h-full px-5 py-6 text-center`}>
          <div
            data-testid={SEL.bdccStatValue}
            className={`${styles.title3d} text-3xl font-extrabold tabular-nums`}
          >
            {display}
          </div>
          <div className="mt-1 text-xs" style={{ color: P.textMuted }}>
            {label}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Marquee() {
  const items = BDCC_CONTENT.ticker;
  const group = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center whitespace-nowrap px-5 text-sm font-medium"
          style={{ color: P.textMuted }}
        >
          <span aria-hidden className="pe-5 text-[9px]" style={{ color: P.purple }}>
            ◆
          </span>
          {item}
        </span>
      ))}
    </div>
  );
  return (
    <div
      data-testid={SEL.bdccMarquee}
      dir="ltr"
      aria-hidden
      className={`${styles.marquee} py-3`}
      style={{
        borderTop: `1px solid ${P.line}`,
        borderBottom: `1px solid ${P.line}`,
        background: "#ffffff",
      }}
    >
      <div className={styles.marqueeTrack}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

function CourseCard({ course, delay }: { course: BdccCourse; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <a
        href={bdccUrl(course.path)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={SEL.bdccCourseCard}
        className={`${styles.navyCard} flex h-full flex-col p-5`}
        style={{ background: P.navy, color: P.navyText }}
      >
        {course.badge ? (
          <span
            className="mb-3 self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: P.gold, color: P.navy }}
          >
            {course.badge}
          </span>
        ) : null}
        <h3 className="text-lg font-bold" style={{ color: P.cyan }}>
          {course.title}
        </h3>
        <p className="mt-1 text-sm" style={{ color: P.navyMuted }}>
          {course.tagline}
        </p>
        <ul className="mt-4 flex-1 space-y-2 text-sm">
          {course.points.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden style={{ color: P.purple }}>
                ◆
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <span className="mt-5 text-sm font-semibold" style={{ color: "#5fd6a8" }}>
          לפרטים באתר ←
        </span>
      </a>
    </Reveal>
  );
}

function CohortCard({ cohort }: { cohort: BdccCohort }) {
  const few = cohort.status === "few";
  const statusLabel =
    cohort.status === "full" ? "תפוסה מלאה" : few ? "מקומות בודדים" : "ההרשמה בעיצומה";
  return (
    <div
      className={`${few ? styles.navyCard : styles.lightCard} flex h-full flex-col items-center gap-1 px-4 pb-4 pt-5 text-center`}
      style={
        few
          ? { background: P.navy, color: P.navyText, border: `1px solid ${P.purple}` }
          : { opacity: cohort.status === "full" ? 0.75 : 1 }
      }
    >
      <div className="text-lg font-bold">{cohort.cycle}</div>
      <div className="text-xs" style={{ color: few ? P.navyMuted : P.textMuted }}>
        {cohort.when}
      </div>
      <div
        className="mt-2 text-xl font-extrabold leading-tight"
        style={{ color: few ? P.cyan : P.navy }}
      >
        {statusLabel}
      </div>
      {few ? (
        <a
          href={bdccUrl(BDCC_CONTENT.cohorts.path)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("select_promotion", { promotion: "cohort_few_spots" })}
          className={`${styles.pulse} ${styles.pill} mt-3 w-full px-3 py-2 text-sm font-bold`}
          style={pillSolid}
        >
          {BDCC_CONTENT.cohorts.fewSpotsCta}
        </a>
      ) : null}
    </div>
  );
}

function LeadFormSection() {
  const f = BDCC_CONTENT.leadForm;
  const email = BDCC_CONTENT.contact.email;
  const [lead, setLead] = useState<BdccLead>({
    name: "",
    phone: "",
    email: "",
    track: "",
    consent: false,
  });
  const [state, setState] = useState<"idle" | "invalid" | "sent">("idle");
  const mailto = buildLeadMailto(email, lead);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLead(lead)) {
      setState("invalid");
      return;
    }
    setState("sent");
    trackEvent("generate_lead", { track: lead.track });
    try {
      window.location.href = mailto;
    } catch {
      // The success note still offers the draft link.
    }
  };

  const inputClass =
    "rounded-xl border px-4 py-3 text-right text-sm outline-none";
  const inputStyle: React.CSSProperties = {
    background: "#ffffff",
    borderColor: P.silver,
    color: P.text,
  };

  return (
    <section id="lead" style={{ borderTop: `1px solid ${P.line}` }}>
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: P.navy }}>
            {f.title}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm" style={{ color: P.textMuted }}>
            {f.subtitle}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <form
            data-testid={SEL.bdccLeadForm}
            onSubmit={submit}
            noValidate
            className={`${styles.lightCard} mx-auto mt-8 flex w-full max-w-md flex-col gap-3 p-5 sm:p-6`}
            style={{ borderColor: P.purple }}
          >
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              placeholder={f.namePlaceholder}
              aria-label={f.namePlaceholder}
              className={inputClass}
              style={inputStyle}
            />
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              dir="ltr"
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              placeholder={f.phonePlaceholder}
              aria-label={f.phonePlaceholder}
              className={inputClass}
              style={inputStyle}
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              dir="ltr"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              placeholder={f.emailPlaceholder}
              aria-label={f.emailPlaceholder}
              className={inputClass}
              style={inputStyle}
            />
            <fieldset className="mt-1">
              <legend className="mb-2 text-sm font-medium" style={{ color: P.navy }}>
                {f.trackLabel}
              </legend>
              <div className="flex flex-col gap-2">
                {f.tracks.map((track) => (
                  <label
                    key={track}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    style={{ color: P.textMuted }}
                  >
                    <input
                      type="radio"
                      name="bdcc-track"
                      checked={lead.track === track}
                      onChange={() => setLead({ ...lead, track })}
                      className="accent-[#2f9e77]"
                    />
                    {track}
                  </label>
                ))}
              </div>
            </fieldset>
            <label
              className="mt-1 flex cursor-pointer items-start gap-2 text-xs"
              style={{ color: P.textMuted }}
            >
              <input
                type="checkbox"
                checked={lead.consent}
                onChange={(e) => setLead({ ...lead, consent: e.target.checked })}
                className="mt-0.5 accent-[#2f9e77]"
              />
              {f.consent}
            </label>
            <p className="text-xs" style={{ color: P.textMuted }}>
              {f.privacyNote}{" "}
              <a
                href="/privacy"
                className="underline"
                data-testid={SEL.bdccLeadPrivacy}
              >
                {f.privacyLink}
              </a>
            </p>
            {state === "invalid" ? (
              <p
                data-testid={SEL.bdccLeadError}
                role="alert"
                className="text-sm font-medium"
                style={{ color: "#c2413f" }}
              >
                {f.invalid}
              </p>
            ) : null}
            {state === "sent" ? (
              <p
                data-testid={SEL.bdccLeadSuccess}
                role="status"
                className="text-sm"
                style={{ color: P.tealDeep }}
              >
                {f.success}{" "}
                <a href={mailto} className="underline" dir="ltr">
                  {email}
                </a>
              </p>
            ) : (
              <button
                type="submit"
                data-testid={SEL.bdccLeadSubmit}
                className={`${styles.pulse} ${styles.pill} mt-2 px-5 py-3 text-sm font-bold`}
                style={pillSolid}
              >
                {f.submit}
              </button>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- page ---------------------------------- */

export function Bdcc2Landing() {
  const c = BDCC_CONTENT;
  const [heroLine1, heroLine2] = (() => {
    const idx = c.heroTitle.indexOf(". ");
    if (idx < 0) return [c.heroTitle, ""];
    return [c.heroTitle.slice(0, idx + 1), c.heroTitle.slice(idx + 2)];
  })();

  return (
    <div
      data-testid={SEL.bdccRoot}
      dir="rtl"
      lang="he"
      className={`${styles.focusRing} min-h-dvh overflow-x-clip`}
      style={{ background: P.bg, color: P.text }}
    >
      {/* Urgency announcement bar */}
      <a
        href={bdccUrl(c.announcement.path)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={SEL.bdccAnnouncement}
        onClick={() => trackEvent("select_promotion", { promotion: "announcement" })}
        className="block px-4 py-2 text-center text-sm font-bold text-white hover:opacity-95"
        style={{ background: `linear-gradient(100deg, ${P.purpleDeep}, ${P.purple})` }}
      >
        {c.announcement.text} <span className="underline">{c.announcement.cta}</span>
      </a>

      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${P.line}`, background: "#ffffffcc" }}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Bdcc2Logo />
          <MagneticLink
            href={bdccUrl("/courses")}
            className={`${styles.pill} inline-block px-5 py-2.5 text-sm font-semibold`}
            style={pillSolid}
          >
            לאתר הרשמי
          </MagneticLink>
        </div>
      </header>

      {/* Hero */}
      <section data-testid={SEL.bdccHero} className={`relative ${styles.heroBg}`}>
        <div aria-hidden className={`absolute inset-0 ${styles.isoGrid}`} />
        <HeroArt />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <Reveal>
            <p
              className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-semibold"
              style={{ background: "#ffffff", color: P.purpleDeep, border: `1px solid ${P.silver}` }}
            >
              מבית CryptoJungle, מאז 2017
            </p>
          </Reveal>
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            <span className={`block ${styles.title3d}`}>{heroLine1}</span>
            {heroLine2 ? (
              <span className="mt-1 block" style={{ color: P.navy }}>
                {heroLine2}
              </span>
            ) : null}
          </h1>
          <Reveal delay={150}>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg" style={{ color: P.textMuted }}>
              {c.heroSubtitle}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticLink
                href={bdccUrl("/courses")}
                testId={SEL.bdccCtaCourses}
                onClick={() => trackEvent("select_content", { content: "hero_courses" })}
                className={`${styles.pill} inline-block px-6 py-3 text-sm font-bold`}
                style={pillSolid}
              >
                לצפייה בקורסים
              </MagneticLink>
              <MagneticLink
                href="#lead"
                testId={SEL.bdccCtaContact}
                className={`${styles.pill} inline-block px-6 py-3 text-sm font-bold`}
                style={pillOutline}
              >
                דברו איתנו
              </MagneticLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {c.stats.map((s, i) => (
            <Stat key={s.label} value={s.value} label={s.label} delay={i * 120} />
          ))}
        </div>
      </section>

      <Marquee />

      {/* Courses */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: P.navy }}>
            מסלולי הלימוד
          </h2>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            שלושה מסלולים, מהצעד הראשון ועד הסמכה מקצועית.
          </p>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.courses.map((course, i) => (
            <CourseCard key={course.id} course={course} delay={i * 120} />
          ))}
        </div>
      </section>

      {/* Cohorts */}
      <section
        data-testid={SEL.bdccCohorts}
        className={styles.heroBg}
        style={{ borderTop: `1px solid ${P.line}` }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: P.navy }}>
              {c.cohorts.title}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm" style={{ color: P.textMuted }}>
              {c.cohorts.subtitle}
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.cohorts.items.map((cohort, i) => (
              <Reveal key={cohort.cycle} delay={i * 100} className="h-full">
                <CohortCard cohort={cohort} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section data-testid={SEL.bdccVideo}>
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold" style={{ color: P.navy }}>
              {c.video.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
              {c.video.subtitle}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div
              className={`${styles.lightCard} mx-auto mt-6 aspect-video w-full max-w-3xl overflow-hidden`}
              style={{ background: P.navy }}
            >
              <iframe
                src={c.video.src}
                title={c.video.title}
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section data-testid={SEL.bdccGallery} style={{ background: "#ffffff" }}>
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Reveal>
            <h2 className="text-2xl font-bold" style={{ color: P.navy }}>
              {c.gallery.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
              {c.gallery.subtitle}
            </p>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {c.gallery.images.map((image, i) => (
              <Reveal key={image.src} delay={i * 80}>
                <SafeImg
                  src={image.src}
                  alt={image.alt}
                  tileStyle={{ background: P.silver, border: `1px solid ${P.line}` }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ borderTop: `1px solid ${P.line}` }}>
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Reveal>
            <h2 className="text-2xl font-bold" style={{ color: P.navy }}>
              על המכללה
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: P.textMuted }}>
              {c.about}
            </p>
          </Reveal>
        </div>
      </section>

      <LeadFormSection />

      {/* Contact footer */}
      <footer
        data-testid={SEL.bdccContact}
        style={{ background: P.navy, color: P.navyText }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <span style={{ color: P.navyMuted }}>{c.contact.city}</span>
            <a
              href={telHref(c.contact.phone)}
              className="font-medium hover:underline"
              style={{ color: P.cyan }}
              dir="ltr"
            >
              {c.contact.phoneDisplay}
            </a>
            <a
              href={mailHref(c.contact.email)}
              className="font-medium hover:underline"
              style={{ color: P.cyan }}
              dir="ltr"
            >
              {c.contact.email}
            </a>
            <a
              href={BDCC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: P.cyan }}
              dir="ltr"
            >
              www.bdcc.co.il
            </a>
          </div>
          <p className="mt-5 text-xs" style={{ color: P.navyMuted }}>
            {c.disclaimer}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 text-xs">
            <a href="/privacy" className="underline" style={{ color: P.navyMuted }}>
              {c.consent.privacyLink}
            </a>
            <ConsentSettingsLink
              className="underline"
              style={{ color: P.navyMuted }}
            />
          </p>
        </div>
      </footer>
    </div>
  );
}
