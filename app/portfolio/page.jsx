import Projects from "../components/homepage/projects";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { projects } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[linear-gradient(135deg,#0f172a,#1a1443)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Portfolio</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Selected work with strong product and backend ownership.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          A focused collection of projects covering SaaS, AI workflows, travel,
          finance, and newsroom operations.
        </p>
      </section>

      <Projects projects={projects} />
    </div>
  );
}
