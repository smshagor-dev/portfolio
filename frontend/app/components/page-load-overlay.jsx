"use client";

import { useEffect, useState } from "react";

const MINIMUM_VISIBLE_MS = 900;

export default function PageLoadOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let isCancelled = false;
    const startedAt = Date.now();

    const finishLoading = () => {
      if (isCancelled) {
        return;
      }

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(MINIMUM_VISIBLE_MS - elapsed, 0);

      window.setTimeout(() => {
        if (isCancelled) {
          return;
        }

        setIsClosing(true);

        window.setTimeout(() => {
          if (!isCancelled) {
            setIsVisible(false);
          }
        }, 420);
      }, remaining);
    };

    const fontReadyPromise =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    const windowReadyPromise =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener("load", resolve, { once: true });
          });

    Promise.all([fontReadyPromise, windowReadyPromise]).then(finishLoading);

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`page-load-overlay ${isClosing ? "page-load-overlay--closing" : ""}`}
      aria-hidden="true"
    >
      <div className="page-load-overlay__glow" />
      <div className="page-load-overlay__shell">
        <div className="page-load-overlay__ring" />
        <div className="page-load-overlay__ring page-load-overlay__ring--delayed" />
        <div className="page-load-overlay__core">
          <span className="page-load-overlay__dot" />
          <span className="page-load-overlay__label">Loading</span>
        </div>
      </div>
    </div>
  );
}
