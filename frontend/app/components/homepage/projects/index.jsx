import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProjectCard from "./project-card";
import SectionHeading from "../section-heading";
import { sortProjectsByRecency } from "@/lib/projects";

export default function Projects({
  projects = [],
  limit = 6,
  showBottomActions = true,
  showIntro = true,
}) {
  const sortedProjects = sortProjectsByRecency(projects);
  const visibleProjects = typeof limit === "number" ? sortedProjects.slice(0, limit) : sortedProjects;

  return (
    <section id="projects" className="my-12 lg:my-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(122,218,181,0.12),transparent_30%),linear-gradient(180deg,#101828,#09111d)] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.28)] sm:p-5 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(117,160,255,0.14),transparent_18%),radial-gradient(circle_at_10%_78%,rgba(255,214,102,0.1),transparent_16%)]" />

        {showIntro ? (
          <SectionHeading
            label="Projects"
            title="Selected product work with stronger storytelling, cleaner presentation, and real delivery context"
            description="A focused project section designed more like modern agency and product websites, with clearer visuals, stronger hierarchy, and direct paths into each case study."
            className="relative"
          />
        ) : null}

        <div className={`relative grid gap-5 sm:gap-6 xl:grid-cols-3 ${showIntro ? "mt-8 sm:mt-10" : ""}`}>
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id || project.slug || project.name}
              project={project}
              priority={index < 3}
            />
          ))}
        </div>

        {showBottomActions ? (
          <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/portfolio"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#3a5678] bg-[rgba(11,24,39,0.85)] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff] sm:w-auto"
            >
              See More Project
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 sm:w-auto"
            >
              Start a Project
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
