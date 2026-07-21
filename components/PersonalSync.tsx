"use client";

// Mounts once in the root layout. When a personal token is configured in
// Settings, keeps localStorage and the server personal store converged:
// reconciles on load and on an interval, and pushes after local changes.
// Applying a server document writes the same keys it listens to, so a
// guard flag stops those writes from re-triggering a push loop.

import { useEffect, useRef } from "react";
import {
  changeEventName,
  markLocalChanged,
  reconcile,
  SYNCED_KEYS,
} from "@/lib/personal-sync";
import { usePersonalToken } from "@/lib/storage";

const PUSH_DEBOUNCE_MS = 1_500;
const PERIODIC_MS = 60_000;

export function PersonalSync() {
  const [token] = usePersonalToken();
  const applying = useRef(false);

  useEffect(() => {
    if (!token) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      applying.current = true;
      try {
        await reconcile(token);
      } catch {
        // Offline or unconfigured server: local state remains authoritative.
      } finally {
        applying.current = false;
      }
    };

    const onLocalChange = () => {
      if (applying.current) return;
      markLocalChanged();
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, PUSH_DEBOUNCE_MS);
    };

    run();
    const interval = setInterval(run, PERIODIC_MS);
    const events = SYNCED_KEYS.map((key) => changeEventName(key));
    for (const name of events) window.addEventListener(name, onLocalChange);
    return () => {
      clearInterval(interval);
      if (timer) clearTimeout(timer);
      for (const name of events) window.removeEventListener(name, onLocalChange);
    };
  }, [token]);

  return null;
}
