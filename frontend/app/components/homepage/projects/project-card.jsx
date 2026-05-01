"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const tools = Array.isArray(project?.tools) ? project.tools.filter(Boolean).slice(0, 3) : [];

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !project?.slug || typeof window === "undefined") {
      return;
    }

    const sessionKey = `project-impression:${project.slug}`;
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        window.sessionStorage.setItem(sessionKey, "1");
        fetch(buildPublicApiUrl(`/api/site/projects/${encodeURIComponent(project.slug)}/impression`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch(() => {});
        observer.disconnect();
      },
      {
        threshold: 0.4,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [project?.slug]);

  return (
    <article
      ref={cardRef}
      className="group relative overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]"
    >
      <div className="relative h-40 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
        {project?.image ? (
          <Image
            src={project.image}
            alt={project?.name || "Project image"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
            Project visual preview
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.94))]" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-[#4b6991] bg-[rgba(13,24,38,0.82)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a5e3ff]">
            Project
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <span className="inline-flex max-w-full items-center rounded-full border border-[#36557c] bg-[rgba(8,17,29,0.8)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d9e7f5]">
            <span className="truncate">{project?.role || "Project"}</span>
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#88a0b9]">
          <span>{project?.views || 0} views</span>
          <span className="h-1 w-1 rounded-full bg-[#47627e]" />
          <span>{project?.impressionCount || 0} impressions</span>
        </div>

        <div className="mt-3 rounded-[1.1rem] border border-[#22344f] bg-[#0d1728] px-4 py-3">
          <h3 className="overflow-hidden text-lg font-semibold leading-6 text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {project?.name || "Project title"}
          </h3>
        </div>

        <div className="mt-3 rounded-[1.1rem] border border-[#1f3048] bg-[#0b1422] px-4 py-3">
          <p className="h-[4.5rem] overflow-hidden text-sm leading-6 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {project?.description || "Project summary goes here."}
          </p>
        </div>

        {tools.length ? (
          <div className="mt-3 rounded-[1.1rem] border border-[#1f3048] bg-[#0b1422] px-4 py-3">
            <div className="flex flex-wrap gap-2">
            {tools.map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                className="rounded-full border border-[#29405d] bg-[#10233a] px-3 py-1 text-xs text-[#dfe8f2]"
              >
                {tool}
              </span>
            ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 border-t border-[#1f2d41] pt-3">
          <Link
            href={project?.slug ? `/project/${project.slug}` : "/portfolio"}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm font-medium text-[#93d8ff]">View case study</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff] transition group-hover:border-[#72d5ff] group-hover:text-white">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
