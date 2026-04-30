"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

const sessionStorageKey = "portfolio_analytics_session_id";
const geoStorageKey = "portfolio_analytics_geo";
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

async function getVisitorGeo() {
  const cachedValue = window.sessionStorage.getItem(geoStorageKey);
  if (cachedValue) {
    try {
      return JSON.parse(cachedValue);
    } catch (_error) {
      window.sessionStorage.removeItem(geoStorageKey);
    }
  }

  try {
    const response = await fetch("/api/visitor-geo", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const payload = {
      ipAddress: String(data?.ipAddress || "").trim(),
      country: String(data?.country || "").trim(),
      region: String(data?.region || "").trim(),
      city: String(data?.city || "").trim(),
    };

    window.sessionStorage.setItem(geoStorageKey, JSON.stringify(payload));
    return payload;
  } catch (_error) {
    return null;
  }
}

async function sendAnalyticsEvent(pathname, eventType = "heartbeat") {
  if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login/admin")) {
    return;
  }

  const geo = await getVisitorGeo();
  const payload = JSON.stringify({
    sessionId: getSessionId(),
    path: pathname,
    eventType,
    ipAddress: geo?.ipAddress || "",
    country: geo?.country || "",
    region: geo?.region || "",
    city: geo?.city || "",
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
