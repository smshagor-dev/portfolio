import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Eye, Layers3, Sparkles } from "lucide-react";
import { getProjectDetailData } from "@/lib/api";
import ProjectCommentsPanel from "@/app/components/project/project-comments-panel";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const data = await getProjectDetailData(resolvedParams.slug).catch(() => null);

  return buildPageMetadata(data?.siteSettings, {
    title: data?.project?.name || "Project",
    description: data?.project?.description || "Project details page.",
    path: `/project/${resolvedParams.slug}`,
    image: data?.project?.image || data?.siteSettings?.seoImage,
  });
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ProjectDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getProjectDetailData(resolvedParams.slug).catch(() => null);

  if (!data?.project) {
    notFound();
  }

  const { project, siteSettings, relatedProjects = [] } = data;
  const buttons = Array.isArray(project?.buttons)
    ? project.buttons.filter((item) => item?.text && item?.link)
    : [];
  const legacyButtons = [
    ...(project?.demo ? [{ text: "Live Demo", link: project.demo }] : []),
    ...(project?.code ? [{ text: "Code", link: project.code }] : []),
  ];
  const actionButtons = [...buttons, ...legacyButtons].filter(
    (item, index, array) =>
      item?.text &&
      item?.link &&
      array.findIndex(
        (candidate) => candidate.text?.toLowerCase() === item.text?.toLowerCase() && candidate.link === item.link,
      ) === index,
  );

  return (
    <div className="py-8 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(122,218,181,0.14),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="p-6 md:p-8 xl:p-10">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-[#79d4ff] transition hover:text-white"
            >
              <span>{"<"}</span>
              Back to portfolio
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2d5074] bg-[#11253a] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                <BriefcaseBusiness size={13} />
                <span>{project.role || "Project"}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#344760] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                <Eye size={13} />
                <span>{project.views || 0} views</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#344760] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                <Sparkles size={13} />
                <span>{project.impressionCount || 0} impressions</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#344760] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                <span>{project.comments?.length || 0} comments</span>
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {project.name}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#bcc8d8] md:text-base">
              {project.description}
            </p>

            <div className="mt-8 border-t border-[#203049] pt-8">
              <p className="text-xs uppercase tracking-[0.32em] text-[#70d5ff]">Project Details</p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Built with practical delivery decisions, product clarity, and room to scale
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[#9fb1c7] md:text-base">
                This page presents the project more like a modern case-study layout, with a stronger visual intro, clearer CTA placement, and better supporting context in the sidebar.
              </p>
              <div
                className="service-content mt-8"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />

              {actionButtons.length ? (
                <div className="mt-8 flex flex-wrap gap-4 border-t border-[#1d2d42] pt-8">
                  {actionButtons.map((button, index) => (
                    <Link
                      key={`${button.text}-${index}`}
                      href={button.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-6 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
                    >
                      {button.text}
                      <ArrowRight size={16} />
                    </Link>
                  ))}
                </div>
              ) : null}

              <p className="mt-6 text-sm text-[#9fb1c7]">
                Want a similar build? Contact {siteSettings?.contactEmail || "through the contact page"}.
              </p>
            </div>
          </div>

          <aside className="border-t border-[#1d2d42] bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(8,13,23,0.96))] p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="overflow-hidden rounded-[1.5rem] border border-[#263753] bg-[#0c1523]">
              <div className="relative h-60 w-full bg-[#0a1321]">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name || "Project image"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8aa3bf]">
                    Project image not added yet
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#35597f] bg-[linear-gradient(180deg,#10253d,#0b1625)] text-[#8fdcff]">
                    <Layers3 size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Tech Stack</p>
                    <p className="mt-1 text-sm text-[#9fb1c7]">Core tools used in this build</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tools || []).map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-[#24344d] bg-[#0d1728] px-3 py-1 text-xs text-[#d7dfec]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Project Snapshot</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                  <span className="text-sm text-[#9fb1c7]">Role</span>
                  <span className="text-sm font-medium text-white">{project.role || "Project"}</span>
                </div>
                <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                  <span className="text-sm text-[#9fb1c7]">Views</span>
                  <span className="text-sm font-medium text-white">{project.views || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                  <span className="text-sm text-[#9fb1c7]">Impressions</span>
                  <span className="text-sm font-medium text-white">{project.impressionCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">More Projects</p>
              <div className="mt-4 space-y-3">
                {relatedProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a3b55] bg-[#0e1829] p-4 text-sm text-[#9fb1c7]">
                    No related projects available.
                  </div>
                ) : (
                  relatedProjects.map((item) => (
                    <Link
                      key={item.id}
                      href={`/project/${item.slug}`}
                      className="block rounded-[1.25rem] border border-[#24344d] bg-[#0d1728] p-4 transition hover:border-[#3a5678]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.name}</p>
                        <span className="text-xs text-[#8fa4bb]">{item.role || "Project"}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
                        {stripHtml(item.description).slice(0, 110)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ProjectCommentsPanel projectSlug={project.slug} comments={project.comments || []} />
    </div>
  );
}
