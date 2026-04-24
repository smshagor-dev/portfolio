"use client";

import LiveContactTicket from "@/app/components/homepage/contact/live-contact-ticket";

export default function ChatPageClient({
  ticketSession,
  emergencyContacts = [],
  websiteTitle = "Portfolio Website",
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(111,216,255,0.14),transparent_24%),linear-gradient(180deg,#08111c,#0b1422)]">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 items-stretch justify-center px-0 py-0 sm:px-3 sm:py-2">
        <LiveContactTicket
          ticketSession={ticketSession}
          isOpen={true}
          onClose={() => {}}
          emergencyContacts={emergencyContacts}
          websiteTitle={websiteTitle}
          viewMode="page"
        />
      </div>
    </section>
  );
}
