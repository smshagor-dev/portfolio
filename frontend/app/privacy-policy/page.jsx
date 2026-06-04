import { getSiteSettings } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Privacy Policy",
    description: "Privacy policy for this portfolio website.",
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings().catch(() => null);
  const content = settings?.privacyPolicyHtml || "<p>Privacy policy content will be updated soon.</p>";

  return (
    <main className="w-full py-12 text-white lg:py-20">
      <p className="text-center text-xs uppercase tracking-[0.28em] text-[#78d7ff]">Legal</p>
      <h1 className="mt-3 text-center text-4xl font-semibold">Privacy Policy</h1>
      <article
        className="legal-content mt-8 rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-6 text-[#dce8f6] shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-8"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
