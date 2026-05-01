"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/app/components/homepage/projects/project-card";

function collectUniqueValues(items, selector) {
  return Array.from(
    new Set(
      (items || [])
        .map(selector)
        .flat()
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export default function ProjectCatalog({ projects = [] }) {
  const [activeRole, setActiveRole] = useState("all");
  const [activeTool, setActiveTool] = useState("all");

  const roleOptions = useMemo(
    () => collectUniqueValues(projects, (project) => project?.role),
    [projects],
  );
  const toolOptions = useMemo(
    () => collectUniqueValues(projects, (project) => project?.tools || []),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    return (projects || []).filter((project) => {
      const matchesRole = activeRole === "all" || String(project?.role || "").trim() === activeRole;
      const matchesTool =
        activeTool === "all" ||
        (Array.isArray(project?.tools) && project.tools.some((tool) => String(tool || "").trim() === activeTool));

      return matchesRole && matchesTool;
    });
  }, [activeRole, activeTool, projects]);

  return (
    <div className="mt-8 space-y-8 sm:mt-10">
      <section className="rounded-[1.75rem] border border-[#23354d] bg-[linear-gradient(180deg,rgba(14,24,39,0.96),rgba(9,17,29,0.96))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Project Filter</p>
            <p className="mt-2 text-sm leading-7 text-[#aabacc]">
              Filter projects by role or tool without leaving the portfolio page.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:min-w-[32rem]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcff]">
                Filter By Role
              </label>
              <div className="relative">
                <select
                  value={activeRole}
                  onChange={(event) => setActiveRole(event.target.value)}
                  className="w-full appearance-none rounded-[1.1rem] border border-[#2f4866] bg-[#102033] px-4 py-3 pr-12 text-sm font-medium text-white outline-none transition focus:border-[#74d6ff] focus:bg-[#102033] [&>option]:bg-[#102033] [&>option]:text-white"
                >
                  <option value="all" className="bg-[#102033] text-white">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role} className="bg-[#102033] text-white">
                      {role}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8fdcff]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcff]">
                Filter By Tool
              </label>
              <div className="relative">
                <select
                  value={activeTool}
                  onChange={(event) => setActiveTool(event.target.value)}
                  className="w-full appearance-none rounded-[1.1rem] border border-[#2f4866] bg-[#102033] px-4 py-3 pr-12 text-sm font-medium text-white outline-none transition focus:border-[#74d6ff] focus:bg-[#102033] [&>option]:bg-[#102033] [&>option]:text-white"
                >
                  <option value="all" className="bg-[#102033] text-white">All Tools</option>
                  {toolOptions.map((tool) => (
                    <option key={tool} value={tool} className="bg-[#102033] text-white">
                      {tool}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8fdcff]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        {filteredProjects.length === 0 ? (
          <div className="xl:col-span-3 rounded-[1.75rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] p-10 text-center">
            <p className="text-lg font-semibold text-white">No matching projects found</p>
            <p className="mt-3 text-sm leading-7 text-[#b8c7d8]">
              Try another role or tool to explore a different slice of the portfolio.
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id || project.slug || project.name} project={project} />
          ))
        )}
      </section>
    </div>
  );
}
