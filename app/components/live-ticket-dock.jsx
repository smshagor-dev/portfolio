"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LiveContactTicket from "./homepage/contact/live-contact-ticket";

const STORAGE_KEY = "portfolio_contact_ticket";

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

export default function LiveTicketDock() {
  const pathname = usePathname();
  const [ticketSession, setTicketSession] = useState(() => readStoredTicket());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key && event.key !== STORAGE_KEY) {
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
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("portfolio:ticket-sync", handleTicketSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("portfolio:ticket-sync", handleTicketSync);
    };
  }, []);

  if (pathname?.startsWith("/admin") || !ticketSession?.id || !ticketSession?.token) {
    return null;
  }

  return (
    <LiveContactTicket
      ticketSession={ticketSession}
      isOpen={isOpen}
      onClose={() => setIsOpen((current) => !current)}
    />
  );
}
