import ContactSection from "../components/homepage/contact";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { profile } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[linear-gradient(135deg,#111827,#1a1443)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Contact</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Let’s talk about your next product or business website.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          Share your idea, project scope, or support need and get a direct reply.
        </p>
      </section>

      <ContactSection profile={profile} />
    </div>
  );
}
