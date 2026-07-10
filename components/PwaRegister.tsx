"use client";

// Registers the service worker. Production only: a SW in dev serves stale
// bundles and makes hot reload lie to you.

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure degrades to a plain web app; nothing to do.
    });
  }, []);
  return null;
}
