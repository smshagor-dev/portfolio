"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const sessionStorageKey = "portfolio_analytics_session_id";

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
  const url = `${backendUrl}/api/site/analytics/heartbeat`;

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

    const interval = window.setInterval(() => {
      sendAnalyticsEvent(pathname, "heartbeat");
    }, 60000);

    return () => window.clearInterval(interval);
  }, [pathname]);

  return null;
}
