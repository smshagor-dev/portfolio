"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildPublicApiUrl } from "@/lib/public-backend-url";
const sessionStorageKey = "portfolio_analytics_session_id";
const heartbeatIntervalMs = 30000;

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  const existing = window.localStorage.getItem(sessionStorageKey);
  if (existing) {
    return existing;
  }

  const nextId = createSessionId();
  window.localStorage.setItem(sessionStorageKey, nextId);
  return nextId;
}

function sendAnalyticsEvent(pathname, eventType = "heartbeat") {
  if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login/admin")) {
    return;
  }

  const payload = JSON.stringify({
    sessionId: getSessionId(),
    path: pathname,
    eventType,
  });
  const url = buildPublicApiUrl("/api/site/analytics/heartbeat");

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    return;
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return undefined;
    }

    sendAnalyticsEvent(pathname, "pageview");

    const sendVisibleHeartbeat = () => {
      if (document.visibilityState === "visible") {
        sendAnalyticsEvent(pathname, "heartbeat");
      }
    };

    const interval = window.setInterval(() => {
      sendVisibleHeartbeat();
    }, heartbeatIntervalMs);

    document.addEventListener("visibilitychange", sendVisibleHeartbeat);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sendVisibleHeartbeat);
    };
  }, [pathname]);

  return null;
}
