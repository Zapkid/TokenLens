// Pure math and text helpers behind the BDCC landing page interactions
// (cursor-tracked card glow, tilt, magnetic buttons, text scramble, stat
// count-up). Kept free of DOM access so every formula is unit-testable;
// components in components/bdcc/ own the event wiring and rAF loops.

export const HEBREW_POOL = "אבגדהוזחטיכלמנסעפצקרשת₿Ξ#*%+";
export const LATIN_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₿Ξ";

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * One frame of the scramble effect: characters before revealedCount show the
 * target, the rest show a random glyph from the pool. Whitespace is never
 * scrambled so word shapes stay stable.
 */
export function scrambleFrame(
  target: string,
  revealedCount: number,
  rand: () => number,
  pool: string,
): string {
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < revealedCount || /\s/.test(ch)) out += ch;
    else out += pool[Math.floor(rand() * pool.length) % pool.length];
  }
  return out;
}

/** Exponential ease-out, clamped to [0, 1]. */
export function easeOutExpo(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

/**
 * Display value for a counting-up stat. Numeric targets ramp with
 * easeOutExpo and land exactly on the target string at t >= 1; non-numeric
 * targets (e.g. Hebrew labels) are returned as-is.
 */
export function countUpDisplay(target: string, t: number): string {
  const n = Number(target);
  if (!Number.isFinite(n)) return target;
  if (t >= 1) return target;
  return String(Math.round(n * easeOutExpo(t)));
}

/** Pointer position relative to a rect, in px. Used for the glow center. */
export function pointerVars(
  rect: Rect,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  return { x: clientX - rect.left, y: clientY - rect.top };
}

/**
 * Card tilt angles in degrees from the pointer position. Centered pointer
 * gives zero tilt; edges give at most maxDeg. rx tips the card away from
 * the cursor vertically, ry follows it horizontally.
 */
export function tiltAngles(
  rect: Rect,
  clientX: number,
  clientY: number,
  maxDeg = 4,
): { rx: number; ry: number } {
  const px = clamp((clientX - rect.left) / rect.width, 0, 1) - 0.5;
  const py = clamp((clientY - rect.top) / rect.height, 0, 1) - 0.5;
  return { rx: -(py * 2 * maxDeg), ry: px * 2 * maxDeg };
}

/**
 * Magnetic-button offset: a fraction of the cursor's distance from the
 * element center, capped so the button never escapes its slot.
 */
export function magneticOffset(
  rect: Rect,
  clientX: number,
  clientY: number,
  strength = 0.25,
  maxShift = 10,
): { dx: number; dy: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    dx: clamp((clientX - cx) * strength, -maxShift, maxShift),
    dy: clamp((clientY - cy) * strength, -maxShift, maxShift),
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
