"use client";

import { useEffect } from "react";
import { ensureNotificationPermission, registerNotificationServiceWorker } from "@/lib/browser-notifications";

export default function BrowserNotificationBootstrap() {
  useEffect(() => {
    registerNotificationServiceWorker();

    if (typeof window === "undefined" || !("Notification" in window)) {
      return undefined;
    }

    if (Notification.permission !== "default") {
      return undefined;
    }

    const requestPermission = () => {
      ensureNotificationPermission();
      window.removeEventListener("pointerdown", requestPermission);
      window.removeEventListener("keydown", requestPermission);
    };

    window.addEventListener("pointerdown", requestPermission, { once: true });
    window.addEventListener("keydown", requestPermission, { once: true });

    return () => {
      window.removeEventListener("pointerdown", requestPermission);
      window.removeEventListener("keydown", requestPermission);
    };
  }, []);

  return null;
}
