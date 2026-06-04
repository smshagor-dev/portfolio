import { getSiteSettings } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Terms and Conditions",
    description: "Terms and conditions for using this portfolio website.",
    path: "/terms-and-conditions",
  });
}

export default async function TermsAndConditionsPage() {
  const settings = await getSiteSettings().catch(() => null);
  const content = settings?.termsConditionsHtml || "<p>Terms and conditions content will be updated soon.</p>";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white sm:px-10 lg:py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-[#78d7ff]">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold">Terms and Conditions</h1>
      <article
        className="legal-content mt-8 rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-6 text-[#dce8f6] shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
