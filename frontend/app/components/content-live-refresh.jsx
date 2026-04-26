"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { getSocketServerUrl } from "@/lib/public-backend-url";

const socketServerUrl = getSocketServerUrl();

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login/admin";
}

export default function ContentLiveRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socketServerUrl || isAdminPath(pathname)) {
      return undefined;
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

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      socket.off("content:updated", scheduleRefresh);
      socket.disconnect();
    };
  }, [pathname, router]);

  return null;
}
