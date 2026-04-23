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
      <section className="rounded-3xl border border-[#25213b] bg-[linear-gradient(135deg,#111827,#1a1443)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Contact</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Let&apos;s talk about your next product or business website.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          Share your idea, project scope, or support need and get a direct reply at{" "}
          {siteSettings?.contactEmail || profile?.email || "the listed email"}.
        </p>
      </section>

      <ContactSection profile={profile} settings={siteSettings} />
    </div>
  );
}
