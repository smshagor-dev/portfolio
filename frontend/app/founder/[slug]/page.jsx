import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Code2,
  Compass, ExternalLink, Layers3, Lightbulb, Monitor, Rocket,
} from "lucide-react";
import { founderProjects, getFounderProject } from "@/lib/founder-projects";

export function generateStaticParams() {
  return founderProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getFounderProject(slug);
  if (!project) return { title: "Product not found" };
  return {
    title: `${project.name} | Founder & Lead Software Engineer`,
    description: project.summary,
    alternates: { canonical: `/founder/${project.slug}` },
    openGraph: {
      title: `${project.name} — Development Journey`,
      description: project.summary,
      images: [{ url: project.image, width: project.imageWidth, height: project.imageHeight, alt: project.imageAlt }],
    },
  };
}

export default async function FounderProjectPage({ params }) {
  const { slug } = await params;
  const project = getFounderProject(slug);
  if (!project) notFound();

  const otherProject = founderProjects.find(({ slug: otherSlug }) => otherSlug !== slug);
  const isStudio = project.slug === "openmind-studio";

  return (
    <main className="py-8 text-white sm:py-10">
      <article className="overflow-hidden rounded-[2rem] border border-[#2a3a52] bg-[radial-gradient(circle_at_75%_0%,rgba(137,123,246,0.13),transparent_35%),linear-gradient(180deg,#10192b,#09111d)] shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
        <div className="px-5 pt-7 sm:px-9 sm:pt-10 lg:px-12">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-[#a4dfff] transition hover:text-white">
            <ArrowLeft size={16} /> Back to projects
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94cfff]">
            <span className="rounded-full border border-[#355673] bg-[#17253b] px-4 py-2">{project.eyebrow}</span>
            <span className="rounded-full border border-[#3e3d69] bg-[#24203e] px-4 py-2">Founder-led project</span>
          </div>
          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{project.name}</h1>
              <p className="mt-3 text-xl font-medium text-[#c9dafa] sm:text-2xl">{project.tagline}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#acc0d5]">{project.summary}</p>
            </div>
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#88d8ff,#b4adff)] px-6 py-3 text-sm font-semibold text-[#091523] transition hover:brightness-110">
              Visit {project.name} <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {project.role.map((role) => <span key={role} className="rounded-full border border-[#395472] bg-[#13263c] px-4 py-2 text-sm font-medium text-[#deecfb]">{role}</span>)}
          </div>
        </div>

        <div className="mx-3 mt-9 overflow-hidden rounded-[1.6rem] border border-[#35465d] bg-[#070c15] shadow-[0_18px_55px_rgba(0,0,0,0.35)] sm:mx-6 lg:mx-10">
          <div className="flex items-center gap-2 border-b border-[#273349] bg-[#111826] px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fd7777]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f4c96e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#69d8ad]" />
            <span className="ml-3 truncate text-xs text-[#9caec5]">{project.name} · Desktop workspace</span>
          </div>
          <Image
            src={project.image}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="h-auto w-full"
          />
        </div>
        <p className="px-5 pt-3 text-center text-xs leading-5 text-[#8096af] sm:px-9">{project.imageNote}</p>

        <div className="grid gap-8 px-5 py-12 sm:px-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:px-12 lg:py-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#82d4fc]"><Compass size={17} /> Why I built it</div>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">From a real problem to a working product direction.</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#b1c0d4]">{project.overview}</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {project.principles.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#2e405b] bg-[#121f33] p-5">
                  <CheckCircle2 size={19} className="text-[#83d8cf]" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#a5bad0]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start rounded-[1.5rem] border border-[#314762] bg-[#101e31] p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-[#99d9fc]"><Layers3 size={18} /><h2 className="text-sm font-semibold uppercase tracking-wider">Project snapshot</h2></div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-[#8296ae]">My role</p>
            {project.role.map((role) => <p key={role} className="mt-2 text-sm font-medium text-white">{role}</p>)}
            <div className="my-6 border-t border-[#31435b]" />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8296ae]">Core technologies</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => <span key={item} className="rounded-lg border border-[#344a66] bg-[#16283f] px-2.5 py-1.5 text-xs text-[#d0deee]">{item}</span>)}
            </div>
            <div className="my-6 border-t border-[#31435b]" />
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#91d7ff] transition hover:text-white"><ExternalLink size={16} /> {project.website.replace("https://", "")}</a>
          </aside>
        </div>

        <section aria-labelledby="development-journey" className="border-t border-[#273850] bg-[#0c1524]/65 px-5 py-12 sm:px-9 lg:px-12 lg:py-16">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#a4aaff]"><Rocket size={17} /> Building the product</div>
          <h2 id="development-journey" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Development journey</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aabed5]">A look at the engineering direction, how the workspace evolved and the work that continues. These are development stages, not invented release dates.</p>
          <ol className="relative mt-10 space-y-4 border-l border-[#3b506c] pl-7 sm:pl-10">
            {project.journey.map((item) => (
              <li key={item.step} className="relative rounded-2xl border border-[#2d4059] bg-[#122036]/75 p-5 sm:p-6">
                <span className="absolute -left-[2.36rem] top-7 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#182a46] bg-[#8acfff] sm:-left-[3.2rem]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.2em] text-[#8fcaff]">STAGE {item.step}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#b1c2d4]">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 border-t border-[#273850] px-5 py-12 sm:px-9 lg:grid-cols-2 lg:px-12 lg:py-16">
          <div className="rounded-[1.65rem] border border-[#2d4660] bg-[#112338] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#8ad6ff]"><Code2 size={20}/><h2 className="font-semibold">Engineering focus</h2></div>
            <p className="mt-4 text-sm leading-7 text-[#b8c8d9]">
              {isStudio
                ? "Practical editor ergonomics, runtime isolation, responsive coding assistance and the reliability of portable development on different machines."
                : "Efficient local inference, resilient runtimes, conversation persistence, portable installation and usable AI workflows across varying hardware."}
            </p>
          </div>
          <div className="rounded-[1.65rem] border border-[#3b3a64] bg-[#1b1c37] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#beb0ff]"><Lightbulb size={20}/><h2 className="font-semibold">Where it stands</h2></div>
            <p className="mt-4 text-sm leading-7 text-[#c2c1d7]">{project.outcome}</p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 border-t border-[#273850] px-5 py-8 sm:px-9 sm:flex-row sm:items-center lg:px-12">
          <div className="flex items-center gap-3"><Monitor size={19} className="text-[#90d2ff]" /><span className="text-sm text-[#b3c6d9]">Explore the product or continue to the other founder-led project.</span></div>
          <div className="flex flex-wrap gap-3">
            {otherProject && <Link href={`/founder/${otherProject.slug}`} className="inline-flex items-center gap-2 rounded-full border border-[#425875] px-5 py-3 text-sm text-white transition hover:border-[#9fd6ff]">{otherProject.name} <ArrowRight size={15}/></Link>}
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#a4d8ff] px-5 py-3 text-sm font-semibold text-[#0b1728] transition hover:bg-white">Visit website <ExternalLink size={15}/></a>
          </div>
        </div>
      </article>
    </main>
  );
}
