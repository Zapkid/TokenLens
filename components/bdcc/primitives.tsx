"use client";

// Shared building blocks for the BDCC landing page variants (/bdcc, /bdcc2):
// scroll reveals, count-up stats, magnetic links, and resilient remote
// images. Pure math lives in lib/bdcc-fx.ts.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { countUpDisplay, magneticOffset } from "@/lib/bdcc-fx";
import styles from "./primitives.module.css";

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useInView<T extends HTMLElement>(threshold = 0.25) {
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

export function useCountUp(target: string, active: boolean, durationMs = 1400) {
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

export function Reveal({
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

export function MagneticLink({
  href,
  children,
  testId,
  className = "",
  style,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  testId?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
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
      onClick={onClick}
      className={`${styles.magnetic} ${className}`}
      style={style}
    >
      {children}
    </a>
  );
}

/** Gallery image through the Next image optimizer, fading in on load and
 * keeping a quiet themed tile on error (see /bdcc docs for the rationale). */
export function SafeImg({
  src,
  alt,
  tileStyle,
}: {
  src: string;
  alt: string;
  tileStyle: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-xl"
      style={tileStyle}
    >
      <Image
        src={src}
        alt={failed ? "" : alt}
        fill
        sizes="(max-width: 640px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition-opacity duration-700 ${
          loaded && !failed ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
