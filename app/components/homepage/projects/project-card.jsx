"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const tools = Array.isArray(project?.tools) ? project.tools.filter(Boolean).slice(0, 5) : [];
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
        fetch(`${backendUrl}/api/site/projects/${encodeURIComponent(project.slug)}/impression`, {
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
      className="group relative overflow-hidden rounded-[1.9rem] border border-[#24344d] bg-[linear-gradient(160deg,rgba(17,28,46,0.98),rgba(10,18,31,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#6f9ac8] hover:shadow-[0_32px_80px_rgba(0,0,0,0.3)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="h-full w-32 -translate-x-40 bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.95),rgba(255,214,102,0.9),transparent)] transition duration-700 group-hover:translate-x-[28rem]" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px overflow-hidden">
        <div className="h-32 w-full -translate-y-40 bg-[linear-gradient(180deg,transparent,rgba(124,240,183,0.95),rgba(108,200,255,0.88),transparent)] transition duration-700 group-hover:translate-y-[26rem]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-16 top-10 h-36 w-36 rounded-full bg-[#6cc8ff]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-[#7cf0b7]/12 blur-3xl" />
      </div>

      <div className="relative h-60 overflow-hidden border-b border-[#203049] bg-[#09111d]">
        {project?.image ? (
          <Image
            src={project.image}
            alt={project?.name || "Project image"}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.14),transparent_30%),linear-gradient(180deg,#0d1728,#0a1220)] px-8 text-center text-sm text-[#8aa3bf]">
            Project visual preview
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,10,18,0.78))]" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#36557e] bg-[rgba(11,26,43,0.78)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff] backdrop-blur">
            {project?.role || "Project"}
          </span>
          <span className="rounded-full border border-[#364760] bg-[rgba(17,29,49,0.78)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#bfd0e2] backdrop-blur">
            {project?.views || 0} views
          </span>
          <span className="rounded-full border border-[#364760] bg-[rgba(17,29,49,0.78)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#bfd0e2] backdrop-blur">
            {project?.impressionCount || 0} impressions
          </span>
        </div>
      </div>

      <div className="relative p-6">
        <h3 className="text-2xl font-semibold text-white transition group-hover:text-[#9be3ff]">
          {project?.name || "Project title"}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[#c0cddd]">
          {project?.description || "Project summary goes here."}
        </p>

        {tools.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                className="rounded-full border border-[#29405d] bg-[#10233a] px-3 py-1 text-xs text-[#dfe8f2] transition group-hover:border-[#42678f]"
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={project?.slug ? `/project/${project.slug}` : "/portfolio"}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
          >
            View Case Study
            <ArrowRight size={16} />
          </Link>

        </div>
      </div>
    </article>
  );
}
