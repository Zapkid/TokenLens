"use client";

import { useEffect } from "react";

// Recover from failed lazy-chunk loads. After a redeploy, an open tab's HTML
// can reference chunk files that no longer exist; the failed import surfaces
// as a ChunkLoadError and blanks the page. One forced reload fetches fresh
// HTML with current chunk names. A session timestamp guards against reload
// loops when the network itself is down.
const GUARD_KEY = "tl-chunk-reload-at";
const GUARD_WINDOW_MS = 60_000;

export function isChunkError(message: string): boolean {
  return /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module/i.test(
    message,
  );
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(GUARD_KEY) ?? 0);
    if (Date.now() - last < GUARD_WINDOW_MS) return;
    sessionStorage.setItem(GUARD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: still reload once per page lifetime.
  }
  window.location.reload();
}

export function ChunkReload() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkError(event.message ?? "")) reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : `${(reason as Error)?.name ?? ""} ${(reason as Error)?.message ?? ""}`;
      if (isChunkError(message)) reloadOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
