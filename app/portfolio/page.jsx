import Projects from "../components/homepage/projects";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomePageData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomePageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "Portfolio",
    description: "Explore selected projects, case studies, and shipped work.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const { projects, siteSettings } = await getHomePageData();
  const websiteTitle = siteSettings?.websiteTitle || "this portfolio";

  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[linear-gradient(135deg,#0f172a,#1a1443)] p-8 text-center lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Portfolio</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Selected work from {websiteTitle} with strong product and backend ownership.
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          A focused collection of projects covering SaaS, AI workflows, travel,
          finance, and newsroom operations.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
          >
            Start a Project
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Projects projects={projects} limit={null} showBottomActions={false} showIntro={false} />
    </div>
  );
}
