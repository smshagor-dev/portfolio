"use client";

import LiveContactTicket from "@/app/components/homepage/contact/live-contact-ticket";

export default function ChatPageClient({
  ticketSession,
  emergencyContacts = [],
  websiteTitle = "Portfolio Website",
}) {
  return (
    <section className="flex flex-1 min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(111,216,255,0.14),transparent_24%),linear-gradient(180deg,#08111c,#0b1422)] px-0 pt-0 pb-0 sm:px-4 sm:pt-4 sm:pb-4">
      <div className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col overflow-hidden">
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
