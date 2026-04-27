"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { showArticlePublishedNotification } from "@/lib/browser-notifications";
import { getSocketServerUrl } from "@/lib/public-backend-url";

const socketServerUrl = getSocketServerUrl();
const ARTICLE_NOTIFICATION_STORAGE_KEY = "portfolio:last-article-notification";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

export default function ContentLiveRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimeoutRef = useRef(null);
  const lastArticleNotificationRef = useRef("");

  useEffect(() => {
    if (!socketServerUrl || isAdminPath(pathname)) {
      return undefined;
    }

    if (typeof window !== "undefined") {
      lastArticleNotificationRef.current = window.localStorage.getItem(ARTICLE_NOTIFICATION_STORAGE_KEY) || "";
    }

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = window.setTimeout(() => {
        router.refresh();
      }, 150);
    };

    socket.on("content:updated", scheduleRefresh);
    socket.on("article:published", (payload) => {
      const slug = String(payload?.slug || "").trim();
      const title = String(payload?.title || "").trim();
      if (!slug || !title) {
        return;
      }

      const notificationKey = String(payload?.articleId || slug);
      if (lastArticleNotificationRef.current === notificationKey) {
        return;
      }

      lastArticleNotificationRef.current = notificationKey;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ARTICLE_NOTIFICATION_STORAGE_KEY, notificationKey);
      }

      showArticlePublishedNotification({
        title,
        url: payload?.url || `/artical/${slug}`,
        tag: `article-published-${notificationKey}`,
      });
    });

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      socket.off("content:updated", scheduleRefresh);
      socket.off("article:published");
      socket.disconnect();
    };
  }, [pathname, router]);

  return null;
}
