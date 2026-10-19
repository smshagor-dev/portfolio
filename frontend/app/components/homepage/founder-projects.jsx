import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Layers3, Sparkles } from "lucide-react";
import { founderProjects } from "@/lib/founder-projects";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";

export default function FounderProjects() {
  return (
    <section id="founder-projects" aria-labelledby="founder-projects-heading" className="my-12 lg:my-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#293a53] bg-[radial-gradient(circle_at_12%_0%,rgba(94,154,250,0.15),transparent_35%),linear-gradient(180deg,#101827,#090f1a)] px-4 py-8 text-white shadow-[0_26px_80px_rgba(0,0,0,0.27)] sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#82d6ff]">
              Founded & engineered
            </p>
            <h2 id="founder-projects-heading" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Products I'm building, from the first idea to the engineering details.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#abbdd2] sm:text-base">
              Two independent products. One goal: practical software that makes AI and development tools more accessible.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#35506a] bg-[#172438] px-4 py-2 text-xs text-[#c4d8ea]">
            <Sparkles size={14} className="text-[#9fcfff]" /> Founder & CEO · Lead Software Engineer
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {founderProjects.map((project) => (
            <article key={project.slug} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.65rem] border border-[#2b3a51] bg-[#111b2b] transition duration-300 hover:-translate-y-1 hover:border-[#79bfff] hover:shadow-[0_22px_55px_rgba(0,0,0,0.24)]">
              <Link href={`/founder/${project.slug}`} aria-label={`Explore ${project.name} development journey`} className="block">
                <div className="relative aspect-[1.86] overflow-hidden bg-[#090e16]">
                  <Image
                    src={buildPublicAssetUrl(project.image)}
                    alt={project.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-contain transition duration-500 group-hover:scale-[1.015]"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0d1522] to-transparent" />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.19em] text-[#85ceff]">{project.eyebrow}</p>
                <Link href={`/founder/${project.slug}`} className="mt-2 w-fit transition hover:text-[#99d9ff]">
                  <h3 className="text-2xl font-semibold tracking-tight">{project.name}</h3>
                </Link>
                <p className="mt-2 text-sm font-medium text-[#cfdef0]">{project.tagline}</p>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#a8bbcd]">{project.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.role.map((role) => (
                    <span key={role} className="rounded-full border border-[#334965] bg-[#15253a] px-3 py-1.5 text-xs font-medium text-[#dce9f8]">
                      {role}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.focus.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs text-[#9eb3c8]">{item}</span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#27374d] pt-5">
                  <Link
                    href={`/founder/${project.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8ad5ff,#abacff)] px-5 py-2.5 text-sm font-semibold text-[#0c1828] transition hover:brightness-110"
                  >
                    Development journey <ArrowRight size={16} />
                  </Link>
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#425673] px-4 py-2.5 text-sm text-[#cee2f4] transition hover:border-[#90d5ff]"
                  >
                    Website <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-[#8da3b8]">
          <Layers3 size={14} /> Explore each product for its architecture, decisions and development journey.
        </p>
      </div>
    </section>
  );
}
