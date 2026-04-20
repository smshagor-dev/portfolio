import Experience from "../components/homepage/experience";
import Skills from "../components/homepage/skills";
import { getHomePageData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ServicePage() {
  const { profile, skills, experiences } = await getHomePageData();

  return (
    <div className="py-8 text-white">
      <section className="rounded-3xl border border-[#25213b] bg-[radial-gradient(circle_at_top,#1a1443,rgba(13,18,36,0.9)_55%)] p-8 lg:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[#16f2b3]">Service</p>
        <h1 className="mt-4 text-4xl font-bold lg:text-5xl">
          Building products that are fast, clean, and easy to scale.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[#d3d8e8] lg:text-lg">
          {profile?.name} helps brands and businesses launch modern web experiences
          with strong backend thinking, clear UX, and production-ready delivery.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Web App Development",
            copy: "Full-stack application delivery using modern frontend and backend architecture.",
          },
          {
            title: "API & Backend Systems",
            copy: "Node.js backend structure, database design, admin control, and content management.",
          },
          {
            title: "Deployment & Support",
            copy: "Server setup, performance optimization, and launch support for real client work.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#25213b] bg-[#10172d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.18)]"
          >
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-[#d3d8e8]">{item.copy}</p>
          </div>
        ))}
      </section>

      <Skills skills={skills} />
      <Experience experiences={experiences} />
    </div>
  );
}
