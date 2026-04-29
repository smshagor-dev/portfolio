import Projects from "../components/homepage/projects";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomePageData } from "@/lib/api";
import SectionHeading from "../components/homepage/section-heading";
import { sortProjectsByRecency } from "@/lib/projects";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomePageData().catch(() => null);
  return buildPageMetadata(data?.siteSettings, {
    title: "Project",
    description: "Explore selected projects, case studies, and shipped work.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const { projects, siteSettings } = await getHomePageData();
  const websiteTitle = siteSettings?.websiteTitle || "this portfolio";
  const sortedProjects = sortProjectsByRecency(projects);

  return (
    <div className="py-8 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(122,218,181,0.14),transparent_30%),linear-gradient(180deg,#101828,#09111d)] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-8 lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(117,160,255,0.16),transparent_18%),radial-gradient(circle_at_10%_78%,rgba(255,214,102,0.12),transparent_16%)]" />
        <SectionHeading
          label="Projects"
          title={`Selected work from ${websiteTitle} with stronger product thinking and delivery clarity`}
          description="Newly added projects now stay up front here as well, so fresh work appears first while the page keeps the same polished heading style as the home section."
          className="relative"
        />

        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-[#36557e] bg-[rgba(11,26,43,0.78)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff] backdrop-blur">
              {sortedProjects.length} active projects
            </span>
            <span className="rounded-full border border-[#364760] bg-[rgba(17,29,49,0.78)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#bfd0e2] backdrop-blur">
              New additions first
            </span>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
          >
            Start a Project
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Projects projects={sortedProjects} limit={null} showBottomActions={false} showIntro={false} />
    </div>
  );
}
