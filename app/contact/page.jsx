import ContactSection from "../components/homepage/contact";
import { getHomePageData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomePageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "Contact",
    description:
      data?.siteSettings?.websiteDescription || "Get in touch about projects, support, or collaboration.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { profile, siteSettings } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <ContactSection profile={profile} settings={siteSettings} />
    </div>
  );
}
