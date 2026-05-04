"use client";

import { useEffect } from "react";
import { ensureNotificationPermission, registerNotificationServiceWorker } from "@/lib/browser-notifications";

export default function BrowserNotificationBootstrap() {
  useEffect(() => {
    const scheduleRegistration =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => {
            registerNotificationServiceWorker();
          }, { timeout: 3000 })
        : window.setTimeout(() => {
            registerNotificationServiceWorker();
          }, 1500);

    if (typeof window === "undefined" || !("Notification" in window)) {
      return () => {
        if ("cancelIdleCallback" in window && typeof scheduleRegistration === "number") {
          window.cancelIdleCallback(scheduleRegistration);
        } else {
          window.clearTimeout(scheduleRegistration);
        }
      };
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
      if ("cancelIdleCallback" in window && typeof scheduleRegistration === "number") {
        window.cancelIdleCallback(scheduleRegistration);
      } else {
        window.clearTimeout(scheduleRegistration);
      }
      window.removeEventListener("pointerdown", requestPermission);
      window.removeEventListener("keydown", requestPermission);
    };
  }, []);

  return null;
}
