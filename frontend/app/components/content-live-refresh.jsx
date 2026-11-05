"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { showArticlePublishedNotification } from "@/lib/browser-notifications";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

// HTTP polling replaces the Socket.IO channel unavailable on Laravel/cPanel.
// Only refresh SSR content after a *successful* API response that changed.
const POLL_INTERVAL_MS = 45000;
const ARTICLE_NOTIFICATION_STORAGE_KEY = "portfolio:last-article-notification";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

function contentSignature(data) {
  const snapshot = {
    profile: data?.profile,
    siteSettings: data?.siteSettings,
    services: data?.services,
    skills: data?.skills,
    projects: data?.projects,
    articles: data?.articles,
    experiences: data?.experiences,
    educations: data?.educations,
    achievements: data?.achievements,
    testimonials: data?.testimonials,
    faqs: data?.faqs,
    pricings: data?.pricings,
    statsCounters: data?.statsCounters,
  };
  return JSON.stringify(snapshot);
}

export default function ContentLiveRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const lastArticleNotificationRef = useRef("");

  useEffect(() => {
    if (isAdminPath(pathname)) {
      return undefined;
    }

    lastArticleNotificationRef.current =
      window.localStorage.getItem(ARTICLE_NOTIFICATION_STORAGE_KEY) || "";

    let active = true;
    let inFlight = false;
    let lastSignature = null;
    let seenArticleIds = null;

    async function poll() {
      if (!active || document.hidden || inFlight) return;
      inFlight = true;

      try {
        const response = await fetch(buildPublicApiUrl("/api/site/home"), {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data || typeof data !== "object" || !data.profile) return;

        const signature = contentSignature(data);
        if (lastSignature !== null && signature !== lastSignature) {
          router.refresh();
        }
        lastSignature = signature;

        const published = (Array.isArray(data.articles) ? data.articles : [])
          .filter((item) => item?.slug && (item?.status === "published" || !item?.status));
        const currentIds = new Set(published.map((item) => String(item.id ?? item.slug)));

        if (seenArticleIds !== null) {
          for (const article of published) {
            const id = String(article.id ?? article.slug);
            if (seenArticleIds.has(id) || id === lastArticleNotificationRef.current) continue;
            lastArticleNotificationRef.current = id;
            window.localStorage.setItem(ARTICLE_NOTIFICATION_STORAGE_KEY, id);
            showArticlePublishedNotification({
              title: article.title,
              url: "/artical/" + article.slug,
              tag: "article-published-" + id,
            });
            break;
          }
        }

        seenArticleIds = currentIds;
      } catch (_error) {
        // Background failures are not interpreted as content updates.
      } finally {
        inFlight = false;
      }
    }

    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
