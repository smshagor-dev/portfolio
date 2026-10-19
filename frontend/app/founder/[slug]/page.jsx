import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Code2, Compass,
  ExternalLink, GitBranch, Layers3, ShieldCheck, Target, Wrench,
} from "lucide-react";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { founderProjects, getFounderProject } from "@/lib/founder-projects";

export function generateStaticParams() {
  return founderProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getFounderProject(slug);
  if (!project) return { title: "Product not found" };

  return {
    title: `${project.name} | Founder & CEO · Lead Software Engineer`,
    description: project.summary,
    alternates: { canonical: `/founder/${project.slug}` },
    openGraph: {
      title: `${project.name} | Product story and engineering journey`,
      description: project.summary,
      images: [{
        url: project.image,
        width: project.imageWidth,
        height: project.imageHeight,
        alt: project.imageAlt,
      }],
    },
  };
}

function SectionHeading({ number, eyebrow, title, description, id }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-medium text-[#8dd6ff]">{number}</span>
        <span className="h-px w-8 bg-[#405a79]" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9bc8ee]">{eyebrow}</p>
      </div>
      <h2 id={id} className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">{title}</h2>
      {description && <p className="mt-4 max-w-3xl text-sm leading-8 text-[#aec2d7] sm:text-base">{description}</p>}
    </div>
  );
}

function Point({ children, icon: Icon = Check }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-7 text-[#c3d3e4]">
      <Icon size={16} className="mt-1.5 shrink-0 text-[#8bd5ee]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default async function FounderProjectPage({ params }) {
  const { slug } = await params;
  const project = getFounderProject(slug);
  if (!project) notFound();
  const otherProject = founderProjects.find((candidate) => candidate.slug !== slug);

  return (
    <main className="py-8 text-white sm:py-10">
      <article className="overflow-hidden rounded-[2rem] border border-[#293b55] bg-[radial-gradient(circle_at_80%_0%,rgba(118,145,244,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] shadow-[0_28px_85px_rgba(0,0,0,0.28)]">
        <header className="px-5 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-[#99d8ff] transition hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Back to all projects
          </Link>
          <div className="mt-9 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#34516e] bg-[#11243a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#a8dbff]">{project.eyebrow}</span>
            <span className="rounded-full border border-[#444267] bg-[#1d203a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#c9c1fa]">Founder-led product</span>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{project.name}</h1>
              <p className="mt-3 text-lg font-medium text-[#cadbfd] sm:text-2xl">{project.tagline}</p>
              <p className="mt-5 max-w-3xl text-sm leading-8 text-[#b4c4d7] sm:text-base">{project.summary}</p>
            </div>
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8ad4ff,#b2abff)] px-6 py-3 text-sm font-semibold text-[#0a1626] transition hover:brightness-110">
              Explore product <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2" aria-label="Leadership roles">
            {project.role.map((role) => (
              <span key={role} className="rounded-full border border-[#3b5573] bg-[#14273e] px-4 py-2 text-xs font-medium text-[#e1efff] sm:text-sm">{role}</span>
            ))}
          </div>
        </header>

        <figure className="mx-3 mt-10 overflow-hidden rounded-[1.35rem] border border-[#34465f] bg-[#080d15] sm:mx-7 lg:mx-12">
          <div className="flex items-center gap-2 border-b border-[#26334a] bg-[#121927] px-5 py-3" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f9797a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2c768]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#6bceac]" />
            <span className="ml-3 truncate text-xs text-[#9eb0c5]">{project.name} · Desktop overview</span>
          </div>
          <Image
            src={buildPublicAssetUrl(project.image)}
            width={project.imageWidth}
            height={project.imageHeight}
            alt={project.imageAlt}
            className="h-auto w-full"
            sizes="(max-width: 1280px) 100vw, 1200px"
            unoptimized
            priority
          />
          <figcaption className="border-t border-[#263349] px-5 py-3 text-xs leading-6 text-[#9aacbf]">{project.imageNote}</figcaption>
        </figure>

        <section aria-labelledby="story-heading" className="grid gap-9 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-12 lg:py-20">
          <div className="min-w-0">
            <SectionHeading number="01" eyebrow="The story" title="Built around a specific problem, not just a feature list." id="story-heading" />
            <p className="mt-6 text-base leading-8 text-[#d3e0ef]">{project.overview}</p>
            <div className="mt-5 space-y-4">
              {project.context.map((paragraph) => <p key={paragraph.slice(0,52)} className="text-sm leading-8 text-[#aec1d5] sm:text-base">{paragraph}</p>)}
            </div>
            <h3 className="mt-9 text-lg font-semibold">What guided the product</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {project.principles.map((principle) => (
                <div key={principle.title} className="rounded-2xl border border-[#2d4059] bg-[#132139] p-5">
                  <ShieldCheck size={19} className="text-[#85d5ca]" aria-hidden="true" />
                  <h4 className="mt-4 text-sm font-semibold text-white">{principle.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-[#a9bed3]">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start rounded-[1.5rem] border border-[#304763] bg-[#111e32] p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-[#a5ddff]"><Layers3 size={18} /><h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Project profile</h2></div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#8fa5ba]">Leadership</p>
            <div className="mt-3 space-y-2">{project.role.map((role) => <p key={role} className="text-sm font-medium text-white">{role}</p>)}</div>
            <div className="my-6 border-t border-[#30445d]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8fa5ba]">Responsibilities</p>
            <ul className="mt-4 space-y-3">{project.responsibilities.map((item) => <Point key={item}>{item}</Point>)}</ul>
            <div className="my-6 border-t border-[#30445d]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8fa5ba]">Technology</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => <span key={item} className="rounded-lg border border-[#354d67] bg-[#192a42] px-2.5 py-1.5 text-xs text-[#d3e0ef]">{item}</span>)}
            </div>
            <div className="mt-7 space-y-3">
              <a href={project.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl border border-[#3f5a79] bg-[#1a2e48] px-4 py-3 text-sm text-[#cbe7ff] transition hover:border-[#8fd5ff]">
                Visit website <ExternalLink size={15} />
              </a>
              <a href={project.repository} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl border border-[#3f5a79] bg-[#1a2e48] px-4 py-3 text-sm text-[#cbe7ff] transition hover:border-[#8fd5ff]">
                Public project repository <GitBranch size={16} />
              </a>
            </div>
          </aside>
        </section>

        <section aria-labelledby="journey-heading" className="border-t border-[#283a54] bg-[#0b1525]/80 px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <SectionHeading number="02" eyebrow="Development journey" title="How the product took shape, and why the engineering decisions mattered." description={project.journeyIntro} id="journey-heading" />
          <ol className="relative mt-10 space-y-5 border-l border-[#3a5576] pl-6 sm:pl-9">
            {project.journey.map((stage) => (
              <li key={stage.step} className="relative overflow-visible rounded-[1.45rem] border border-[#2d405b] bg-[#132039] p-5 sm:p-7">
                <span aria-hidden="true" className="absolute -left-[2.12rem] top-8 h-4 w-4 rounded-full border-[3px] border-[#0c1a2e] bg-[#8fd6ff] sm:-left-[2.95rem]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#8ad6ff]">STAGE {stage.step}</span>
                  <span className="rounded-full border border-[#3b4f68] bg-[#202f45] px-3 py-1.5 text-xs text-[#b9cde0]">{stage.status}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">{stage.title}</h3>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-[#c6d5e4] sm:text-base">{stage.lead}</p>
                <h4 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#9ab9d4]">Implementation and decisions</h4>
                <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                  {stage.details.map((detail) => <Point key={detail}>{detail}</Point>)}
                </ul>
                <div className="mt-6 rounded-xl border-l-2 border-[#79d7bc] bg-[#1b2c43] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#96e5cd]">What this established</p>
                  <p className="mt-2 text-sm leading-7 text-[#d6e4ef]">{stage.result}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="decisions-heading" className="border-t border-[#2c3b52] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <SectionHeading number="03" eyebrow="Architecture and trade-offs" title="Engineering decisions made with real constraints in mind." description="Good technical decisions are never only about the chosen technology. These are the constraints, approaches and costs that influenced the design." id="decisions-heading" />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {project.decisions.map((decision) => (
              <div key={decision.title} className="rounded-[1.4rem] border border-[#304562] bg-[#142239] p-6">
                <div className="flex items-center gap-2 text-[#9cdeff]"><Wrench size={17} /><span className="text-xs font-semibold uppercase tracking-[0.12em]">Technical decision</span></div>
                <h3 className="mt-4 text-lg font-semibold leading-7">{decision.title}</h3>
                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#92a8be]">The constraint</h4>
                <p className="mt-2 text-sm leading-7 text-[#c0d1e0]">{decision.situation}</p>
                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#92a8be]">My approach</h4>
                <p className="mt-2 text-sm leading-7 text-[#c0d1e0]">{decision.approach}</p>
                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#92a8be]">The trade-off</h4>
                <p className="mt-2 text-sm leading-7 text-[#c0d1e0]">{decision.tradeoff}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="delivery-heading" className="border-t border-[#2a3a51] bg-[#0d1728] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <SectionHeading number="04" eyebrow="Delivery and next priorities" title="What has been built, and what is still being evaluated." description="Separating implemented work from ongoing work matters in a technical portfolio. It keeps the case study grounded in the product's published maturity rather than implying that every planned capability has shipped." id="delivery-heading" />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#315761] bg-[#102b35] p-6 sm:p-8">
              <div className="flex items-center gap-3 text-[#89e5c8]"><CheckCircle2 size={20} /><h3 className="text-lg font-semibold text-white">Implemented work</h3></div>
              <ul className="mt-6 space-y-4">{project.delivered.map((item) => <Point key={item} icon={CheckCircle2}>{item}</Point>)}</ul>
            </div>
            <div className="rounded-[1.5rem] border border-[#444266] bg-[#1c2139] p-6 sm:p-8">
              <div className="flex items-center gap-3 text-[#bab2ff]"><Target size={20} /><h3 className="text-lg font-semibold text-white">Ongoing priorities</h3></div>
              <ul className="mt-6 space-y-4">{project.ongoing.map((item) => <Point key={item} icon={Compass}>{item}</Point>)}</ul>
            </div>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-[#324c69] bg-[#15263d] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#9cdeff]"><Code2 size={19} /><h3 className="font-semibold text-white">Product perspective</h3></div>
            <p className="mt-3 max-w-5xl text-sm leading-8 text-[#ceddeb] sm:text-base">{project.outcome}</p>
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-[#293a52] px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm font-semibold text-white">Explore more of the work</p>
            <p className="mt-1 text-sm text-[#9baec5]">View the other product or continue to the published website.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {otherProject && <Link href={`/founder/${otherProject.slug}`} className="inline-flex items-center gap-2 rounded-full border border-[#4b6280] px-5 py-3 text-sm transition hover:border-[#9ddaff]">{otherProject.name} <ArrowRight size={15} /></Link>}
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#a6dcff] px-5 py-3 text-sm font-semibold text-[#0a1626] transition hover:bg-white">Visit product <ExternalLink size={15} /></a>
          </div>
        </footer>
      </article>
    </main>
  );
}
