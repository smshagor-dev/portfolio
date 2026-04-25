import { getSiteSettings } from "@/lib/api";

export default async function robots() {
  const settings = await getSiteSettings().catch(() => null);
  const websiteUrl = settings?.canonicalUrl || "http://localhost:3000";
  const canIndex = settings?.robotsIndexingEnabled ?? true;
  const canFollow = settings?.robotsFollowEnabled ?? true;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: canIndex ? [] : ["/"],
    },
    sitemap: `${websiteUrl.replace(/\/$/, "")}/sitemap.xml`,
    host: websiteUrl,
    ...(canFollow ? {} : { crawlDelay: 1 }),
  };
}
