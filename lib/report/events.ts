// Decision Calendar: dated, resolvable events. This build wires the macro
// calendar (FOMC dates, published a year ahead) and derives a dilution flag;
// governance, unlock, and regulatory feeds are documented as not yet wired.

import { FOMC_DATES_2026 } from "../constants";
import type { AssetRef, DecisionEvent } from "../types";

export function buildEvents(
  _asset: AssetRef,
  opts: { mcFdvRatio: number | null; horizonDays?: number; now?: Date },
): DecisionEvent[] {
  const now = opts.now ?? new Date();
  const horizonDays = opts.horizonDays ?? 365;
  const end = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);
  const events: DecisionEvent[] = [];

  for (const d of FOMC_DATES_2026) {
    const date = new Date(`${d}T18:00:00Z`);
    if (date > now && date < end) {
      events.push({
        date: d,
        type: "macro",
        title: "FOMC rate decision",
        impact: "medium",
        scope: "market",
        note: "The single biggest recurring macro driver of crypto beta",
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
