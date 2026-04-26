import { notFound } from "next/navigation";
import ChatPageClient from "./chat-page-client";
import { getHomePageData, getSiteSettings } from "@/lib/api";
import { parseContactChatHash } from "@/lib/contact-chat-link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const settings = await getSiteSettings().catch(() => null);
  const websiteTitle = settings?.websiteTitle || settings?.seoTitle || "Portfolio Website";

  return {
    title: `Chat | ${websiteTitle}`,
  };
}

export default async function ChatPage({ params }) {
  const resolvedParams = await params;
  const parsedSession = parseContactChatHash(resolvedParams?.hash);

  if (!parsedSession) {
    notFound();
  }

  const homeData = await getHomePageData().catch(() => null);
  const siteSettings = homeData?.siteSettings || (await getSiteSettings().catch(() => null));
  const emergencyContacts = homeData?.emergencyContacts || [];

  return (
    <ChatPageClient
      ticketSession={parsedSession}
      emergencyContacts={emergencyContacts}
      websiteTitle={siteSettings?.websiteTitle || siteSettings?.seoTitle || "Portfolio Website"}
    />
  );
}
