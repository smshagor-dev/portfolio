"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LiveContactTicket from "./homepage/contact/live-contact-ticket";

const STORAGE_KEY = "portfolio_contact_ticket";
const OPEN_CHAT_SIGNAL_KEY = "portfolio_force_open_chat";

function readStoredTicket() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.id || !parsedValue?.token) {
      return null;
    }

    return parsedValue;
  } catch (_error) {
    return null;
  }
}

export default function LiveTicketDock({ emergencyContacts = [], websiteTitle = "Portfolio Website" }) {
  const pathname = usePathname();
  const [ticketSession, setTicketSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialSyncId = window.setTimeout(() => {
      setTicketSession(readStoredTicket());
    }, 0);

    function openChat() {
      setTicketSession(readStoredTicket());
      setIsOpen(true);
    }

    function handleStorage(event) {
      if (!event.key) {
        setTicketSession(readStoredTicket());
        return;
      }

      if (event.key === OPEN_CHAT_SIGNAL_KEY) {
        openChat();
        return;
      }

      if (event.key !== STORAGE_KEY) {
        return;
      }

      const nextTicket = readStoredTicket();
      setTicketSession(nextTicket);
    }

    function handleTicketSync(event) {
      const nextTicket = event.detail?.ticket;
      const shouldOpen = Boolean(event.detail?.open);

      if (nextTicket?.id && nextTicket?.token) {
        setTicketSession(nextTicket);
        if (shouldOpen) {
          setIsOpen(true);
        }
      } else {
        setTicketSession(readStoredTicket());
        if (shouldOpen) {
          setIsOpen(true);
        }
      }
    }

    function handleOpenChat() {
      openChat();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("portfolio:open-chat", handleOpenChat);
    window.addEventListener("portfolio:ticket-sync", handleTicketSync);

    if (window.localStorage.getItem(OPEN_CHAT_SIGNAL_KEY)) {
      openChat();
      window.localStorage.removeItem(OPEN_CHAT_SIGNAL_KEY);
    }

    return () => {
      window.clearTimeout(initialSyncId);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("portfolio:open-chat", handleOpenChat);
      window.removeEventListener("portfolio:ticket-sync", handleTicketSync);
    };
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chat")) {
    return null;
  }

  return (
    <LiveContactTicket
      ticketSession={ticketSession}
      isOpen={isOpen}
      emergencyContacts={emergencyContacts}
      websiteTitle={websiteTitle}
      onClose={() => setIsOpen((current) => !current)}
    />
  );
}
