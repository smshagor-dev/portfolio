"use client";

import { useEffect, useState } from "react";
import BrowserNotificationBootstrap from "./browser-notification-bootstrap";
import ContentLiveRefresh from "./content-live-refresh";
import LiveTicketDock from "./live-ticket-dock";

export default function DeferredClientFeatures({
  emergencyContacts = [],
  websiteTitle = "Portfolio Website",
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => {
            setIsReady(true);
          }, { timeout: 2500 })
        : window.setTimeout(() => {
            setIsReady(true);
          }, 1200);

    return () => {
      if ("cancelIdleCallback" in window && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <BrowserNotificationBootstrap />
      <ContentLiveRefresh />
      <LiveTicketDock emergencyContacts={emergencyContacts} websiteTitle={websiteTitle} />
    </>
  );
}
