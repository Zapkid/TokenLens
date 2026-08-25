"use client";

// Interactive BDCC landing page. All rendering lives here; the animation
// math (scramble frames, tilt, magnetism, count-up easing) is pure and
// unit-tested in lib/bdcc-fx.ts. Every effect checks prefers-reduced-motion
// and the CSS module disables the keyframe animations under it too.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BDCC_CONTENT,
  BDCC_PALETTE,
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
import {
  HEBREW_POOL,
  LATIN_POOL,
  countUpDisplay,
  magneticOffset,
  pointerVars,
  scrambleFrame,
  tiltAngles,
} from "@/lib/bdcc-fx";
import { SEL } from "@/lib/selectors";
import styles from "./bdcc.module.css";

const P = BDCC_PALETTE;

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ------------------------------- hooks ---------------------------------- */

function useScramble(target: string, pool: string, durationMs = 900) {
  const [display, setDisplay] = useState(target);
  const raf = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const play = useCallback(() => {
    if (reducedMotion()) return;
    stop();
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      if (t >= 1) {
        setDisplay(target);
        return;
      }
      setDisplay(
        scrambleFrame(target, Math.floor(t * target.length), Math.random, pool),
      );
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    // rAF can be throttled in occluded or background tabs; this guarantees
    // the text always settles to the target shortly after the duration.
    settle.current = setTimeout(() => {
      if (raf.current) cancelAnimationFrame(raf.current);
      setDisplay(target);
    }, durationMs + 200);
  }, [target, pool, durationMs, stop]);

  useEffect(() => {
    play();
    return stop;
  }, [play, stop]);

  return { display, play };
}

function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: string, active: boolean, durationMs = 1400) {
  const numeric = Number.isFinite(Number(target));
  const [display, setDisplay] = useState(numeric ? "0" : target);
  useEffect(() => {
    if (!active) return;
    if (!numeric || reducedMotion()) {
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / durationMs;
      setDisplay(countUpDisplay(target, t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, numeric, durationMs]);
  return display;
}

/* ---------------------------- building blocks ---------------------------- */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${inView ? styles.revealIn : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function MagneticLink({
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
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const { dx, dy } = magneticOffset(
      el.getBoundingClientRect(),
      e.clientX,
      e.clientY,
    );
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  const external = href.startsWith("http");
  return (
    <a
      ref={ref}
      href={href}
      data-testid={testId}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${styles.magnetic} inline-block rounded-lg px-5 py-2.5 text-sm font-semibold`}
      style={
        solid
          ? {
              background: P.gold,
              color: P.bg,
              boxShadow: `0 0 24px ${P.gold}55`,
            }
          : { border: `1px solid ${P.gold}`, color: P.gold }
      }
    >
      {children}
    </a>
  );
}

function BdccLogo() {
  const { display, play } = useScramble("BDCC", LATIN_POOL, 700);
  return (
    <div
      data-testid={SEL.bdccLogo}
      className="flex items-center gap-3"
      dir="ltr"
      onMouseEnter={play}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        aria-hidden
        className={`shrink-0 ${styles.floatB}`}
      >
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          fill="none"
          stroke={P.gold}
          strokeWidth="2.5"
        />
        <polygon
          points="20,10 28,14.5 28,23.5 20,28 12,23.5 12,14.5"
          fill={P.gold}
        />
        <polygon points="20,10 28,14.5 20,19 12,14.5" fill={P.goldSoft} />
      </svg>
      <div className="leading-tight">
        <div
          className="font-mono text-xl font-extrabold tracking-wide"
          style={{ color: P.text }}
        >
          {display}
        </div>
        <div className="text-[11px]" style={{ color: P.textMuted }}>
          {BDCC_CONTENT.nameHe}
        </div>
      </div>
    </div>
  );
}

function FloatingHexes() {
  const hex = (size: number, opacity: number) => (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <polygon
        points="20,2 36,11 36,29 20,38 4,29 4,11"
        fill="none"
        stroke={P.gold}
        strokeWidth="1.5"
        opacity={opacity}
      />
    </svg>
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className={`absolute left-[8%] top-[18%] ${styles.floatA}`}>
        {hex(56, 0.35)}
      </div>
      <div className={`absolute left-[20%] bottom-[14%] ${styles.floatB}`}>
        {hex(30, 0.25)}
      </div>
      <div className={`absolute left-[45%] top-[10%] ${styles.floatC}`}>
        {hex(22, 0.2)}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const display = useCountUp(value, inView);
  return (
    <div
      ref={ref}
      className="px-5 py-6 text-center sm:px-8"
      style={{ background: P.surface }}
    >
      <Reveal delay={delay}>
        <div
          data-testid={SEL.bdccStatValue}
          className="text-2xl font-bold tabular-nums"
          style={{ color: P.gold }}
        >
          {display}
        </div>
        <div className="mt-1 text-xs" style={{ color: P.textMuted }}>
          {label}
        </div>
      </Reveal>
    </div>
  );
}

function Marquee() {
  const items = BDCC_CONTENT.ticker;
  const group = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center whitespace-nowrap px-5 text-sm font-medium"
          style={{ color: P.textMuted }}
        >
          <span aria-hidden className="pe-5 text-[9px]" style={{ color: P.gold }}>
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
      className={`${styles.marquee} py-3`}
      style={{
        borderTop: `1px solid ${P.line}`,
        borderBottom: `1px solid ${P.line}`,
        background: P.surface,
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
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const { rx, ry } = tiltAngles(el.getBoundingClientRect(), e.clientX, e.clientY);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return (
    <Reveal delay={delay} className="h-full">
      <a
        ref={ref}
        href={bdccUrl(course.path)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={SEL.bdccCourseCard}
        data-glow
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`${styles.glowCard} group block h-full`}
        style={{ "--bdcc-card-bg": P.surface } as React.CSSProperties}
      >
        <div aria-hidden className={styles.glowCardInner} />
        <div className={`${styles.cardContent} flex h-full flex-col p-5`}>
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
        </div>
      </a>
    </Reveal>
  );
}

/** Remote image that fades in when loaded and keeps a quiet branded tile
 * when the CDN is unreachable, so the grid never shows broken-image icons. */
function SafeImg({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="aspect-[4/3] overflow-hidden rounded-xl"
      style={{ background: P.surfaceRaised, border: `1px solid ${P.line}` }}
    >
      {/* Hotlinked from BDCC's public course CDN; next/image optimization is
          skipped on purpose so the demo has no image-proxy dependency. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function VideoSection() {
  const v = BDCC_CONTENT.video;
  return (
    <section
      data-testid={SEL.bdccVideo}
      style={{ background: P.surface, borderTop: `1px solid ${P.line}` }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-bold">{v.title}</h2>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            {v.subtitle}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div
            className="mx-auto mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-xl"
            style={{ background: P.bg, border: `1px solid ${P.line}` }}
          >
            <iframe
              src={v.src}
              title={v.title}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GallerySection() {
  const g = BDCC_CONTENT.gallery;
  return (
    <section data-testid={SEL.bdccGallery}>
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-bold">{g.title}</h2>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            {g.subtitle}
          </p>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {g.images.map((src, i) => (
            <Reveal key={src} delay={i * 80}>
              <SafeImg src={src} alt={`${g.title} ${i + 1}`} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CohortCard({ cohort }: { cohort: BdccCohort }) {
  const few = cohort.status === "few";
  const statusLabel =
    cohort.status === "full"
      ? "תפוסה מלאה"
      : few
        ? "מקומות בודדים"
        : "ההרשמה בעיצומה";
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl px-4 pb-4 pt-5 text-center"
      style={{
        background: P.surfaceRaised,
        border: `1px solid ${few ? P.gold : P.line}`,
        opacity: cohort.status === "full" ? 0.55 : 1,
      }}
    >
      <div className="text-lg font-bold">{cohort.cycle}</div>
      <div className="text-xs" style={{ color: P.textMuted }}>
        {cohort.when}
      </div>
      <div
        className="mt-2 text-xl font-extrabold leading-tight"
        style={{ color: few ? P.goldSoft : P.text }}
      >
        {statusLabel}
      </div>
      {few ? (
        <a
          href={bdccUrl("/courses")}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.pulse} mt-3 w-full rounded-lg px-3 py-2 text-sm font-bold`}
          style={{ background: P.gold, color: P.bg }}
        >
          {BDCC_CONTENT.cohorts.fewSpotsCta}
        </a>
      ) : null}
    </div>
  );
}

function CohortsSection() {
  const co = BDCC_CONTENT.cohorts;
  return (
    <section
      data-testid={SEL.bdccCohorts}
      style={{ background: P.surface, borderTop: `1px solid ${P.line}` }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{co.title}</h2>
          <p
            className="mx-auto mt-2 max-w-2xl text-sm"
            style={{ color: P.textMuted }}
          >
            {co.subtitle}
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {co.items.map((cohort, i) => (
            <Reveal key={cohort.cycle} delay={i * 100} className="h-full">
              <CohortCard cohort={cohort} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
    try {
      window.location.href = mailto;
    } catch {
      // The success panel still offers the draft link.
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "#ffffff",
    color: "#10151f",
  };

  return (
    <section id="lead" style={{ borderTop: `1px solid ${P.line}` }}>
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{f.title}</h2>
          <p
            className="mx-auto mt-2 max-w-2xl text-sm"
            style={{ color: P.textMuted }}
          >
            {f.subtitle}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <form
            data-testid={SEL.bdccLeadForm}
            onSubmit={submit}
            noValidate
            className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 rounded-2xl p-5 sm:p-6"
            style={{ background: P.surfaceRaised, border: `1px solid ${P.gold}` }}
          >
            <input
              type="text"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              placeholder={f.namePlaceholder}
              aria-label={f.namePlaceholder}
              className="rounded-lg px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="tel"
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              placeholder={f.phonePlaceholder}
              aria-label={f.phonePlaceholder}
              className="rounded-lg px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="email"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              placeholder={f.emailPlaceholder}
              aria-label={f.emailPlaceholder}
              className="rounded-lg px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
            <fieldset className="mt-1">
              <legend className="mb-2 text-sm font-medium">{f.trackLabel}</legend>
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
                      className="accent-[#f2b632]"
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
                className="mt-0.5 accent-[#f2b632]"
              />
              {f.consent}
            </label>
            {state === "invalid" ? (
              <p
                data-testid={SEL.bdccLeadError}
                className="text-sm font-medium"
                style={{ color: "#ff9d9d" }}
              >
                {f.invalid}
              </p>
            ) : null}
            {state === "sent" ? (
              <p
                data-testid={SEL.bdccLeadSuccess}
                className="text-sm"
                style={{ color: P.goldSoft }}
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
                className={`${styles.pulse} mt-2 rounded-lg px-5 py-3 text-sm font-bold`}
                style={{ background: P.gold, color: P.bg }}
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

export function BdccLanding() {
  const c = BDCC_CONTENT;
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [heroLine1, heroLine2] = (() => {
    const idx = c.heroTitle.indexOf(". ");
    if (idx < 0) return [c.heroTitle, ""];
    return [c.heroTitle.slice(0, idx + 1), c.heroTitle.slice(idx + 2)];
  })();
  const scrambled = useScramble(heroLine1, HEBREW_POOL, 1100);

  const onHeroMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el || reducedMotion()) return;
    const { x, y } = pointerVars(el.getBoundingClientRect(), e.clientX, e.clientY);
    el.style.setProperty("--hx", `${x}px`);
    el.style.setProperty("--hy", `${y}px`);
  };

  // One pass over the grid moves the glow center of every card, so all
  // borders light up around the cursor (the Hyperplexed glow-cards trick).
  const onGridMove = (e: React.MouseEvent) => {
    if (reducedMotion()) return;
    const cards =
      gridRef.current?.querySelectorAll<HTMLElement>("[data-glow]") ?? [];
    cards.forEach((card) => {
      const { x, y } = pointerVars(
        card.getBoundingClientRect(),
        e.clientX,
        e.clientY,
      );
      card.style.setProperty("--mx", `${x.toFixed(1)}px`);
      card.style.setProperty("--my", `${y.toFixed(1)}px`);
    });
  };

  return (
    <div
      data-testid={SEL.bdccRoot}
      dir="rtl"
      lang="he"
      className="min-h-dvh overflow-x-clip"
      style={{ background: P.bg, color: P.text }}
    >
      {/* Urgency announcement bar */}
      <a
        href={bdccUrl("/courses")}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={SEL.bdccAnnouncement}
        className="block px-4 py-2 text-center text-sm font-bold hover:opacity-90"
        style={{ background: P.gold, color: P.bg }}
      >
        {c.announcement.text}{" "}
        <span className="underline">{c.announcement.cta}</span>
      </a>

      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${P.line}` }}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <BdccLogo />
          <MagneticLink href={bdccUrl("/courses")} solid={false}>
            לאתר הרשמי
          </MagneticLink>
        </div>
      </header>

      {/* Hero */}
      <section
        ref={heroRef}
        data-testid={SEL.bdccHero}
        onMouseMove={onHeroMove}
        className="relative"
      >
        <div aria-hidden className={`absolute inset-0 ${styles.gridBg}`} />
        <div aria-hidden className={`absolute inset-0 ${styles.spotlight}`} />
        <FloatingHexes />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <div className="max-w-2xl lg:max-w-3xl">
          <Reveal>
            <p
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: P.surfaceRaised, color: P.goldSoft }}
            >
              מבית CryptoJungle, מאז 2017
            </p>
          </Reveal>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            <span className="block">{scrambled.display}</span>
            {heroLine2 ? (
              <span className={`block ${styles.goldText}`}>{heroLine2}</span>
            ) : null}
          </h1>
          <Reveal delay={150}>
            <p
              className="mt-4 text-base sm:text-lg"
              style={{ color: P.textMuted }}
            >
              {c.heroSubtitle}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-7 flex flex-wrap gap-3">
              <MagneticLink
                href={bdccUrl("/courses")}
                testId={SEL.bdccCtaCourses}
              >
                לצפייה בקורסים
              </MagneticLink>
              <MagneticLink
                href="#lead"
                testId={SEL.bdccCtaContact}
                solid={false}
              >
                דברו איתנו
              </MagneticLink>
            </div>
          </Reveal>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="grid grid-cols-1 gap-px sm:grid-cols-3"
        style={{ background: P.line }}
      >
        {c.stats.map((s, i) => (
          <Stat key={s.label} value={s.value} label={s.label} delay={i * 120} />
        ))}
      </section>

      <Marquee />

      {/* Courses */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-bold">מסלולי הלימוד</h2>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            שלושה מסלולים, מהצעד הראשון ועד הסמכה מקצועית.
          </p>
        </Reveal>
        <div
          ref={gridRef}
          onMouseMove={onGridMove}
          className={`${styles.cardGrid} mt-6 grid gap-4 md:grid-cols-3`}
        >
          {c.courses.map((course, i) => (
            <CourseCard key={course.id} course={course} delay={i * 120} />
          ))}
        </div>
      </section>

      <CohortsSection />
      <VideoSection />
      <GallerySection />

      {/* About */}
      <section
        style={{ background: P.surface, borderTop: `1px solid ${P.line}` }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Reveal>
            <h2 className="text-2xl font-bold">על המכללה</h2>
            <p
              className="mt-3 max-w-3xl text-sm leading-relaxed"
              style={{ color: P.textMuted }}
            >
              {c.about}
            </p>
          </Reveal>
        </div>
      </section>

      <LeadFormSection />

      {/* Contact */}
      <footer
        data-testid={SEL.bdccContact}
        style={{ borderTop: `1px solid ${P.line}` }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
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
        </div>
      </footer>
    </div>
  );
}
