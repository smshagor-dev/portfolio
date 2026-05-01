import Image from "next/image";
import Link from "next/link";
import ResearchCardMetrics from "@/app/components/research/research-card-metrics";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import {
  buildDoiUrl,
  formatAuthors,
  formatResearchDate,
  getResearchStatusClasses,
  toTitleCase,
} from "@/lib/research";

export default function ResearchCard({ publication, compact = false }) {
  const doiUrl = buildDoiUrl(publication?.doi);
  const hasThumbnail = Boolean(publication?.thumbnailImage);
  const actionLinks = [
    publication?.citationUrl
      ? { label: "Citation", href: publication.citationUrl }
      : null,
    doiUrl ? { label: "DOI", href: doiUrl } : null,
  ].filter(Boolean);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]">
      <div className={`relative overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523] ${compact ? "h-44" : "h-56"}`}>
        {hasThumbnail ? (
          <Image
            src={buildPublicAssetUrl(publication.thumbnailImage)}
            alt={publication.title || "Research publication thumbnail"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
            Research publication
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.9))]" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#4b6991] bg-[rgba(13,24,38,0.82)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a5e3ff]">
            {publication.publicationType}
          </span>
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${getResearchStatusClasses(publication.status)}`}>
            {toTitleCase(publication.status)}
          </span>
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6"}`}>
        <div className="min-h-[1.5rem] flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#88a0b9]">
          <span>{formatResearchDate(publication.publishedDate, { compact: true })}</span>
          <span className="h-1 w-1 rounded-full bg-[#47627e]" />
          <span>{publication.publisherName}</span>
        </div>

        <Link href={`/research/${publication.slug}`} className="block">
          <h3 className={`mt-4 text-2xl font-semibold leading-tight text-white transition group-hover:text-[#9de2ff] ${compact ? "min-h-[4.8rem]" : "min-h-[6rem]"}`}>
            {publication.title}
          </h3>
        </Link>
        <p className={`mt-4 overflow-hidden text-sm leading-7 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] ${compact ? "h-[7rem] [-webkit-line-clamp:4] lg:h-[7rem] lg:[-webkit-line-clamp:4]" : "h-[8.75rem] [-webkit-line-clamp:5] lg:h-[11rem] lg:[-webkit-line-clamp:6]"}`}>
          {publication.shortSummary}
        </p>

        <div className="mt-5 min-h-[2.5rem]">
          <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#263a55] bg-[#0d1728] px-3 py-1 text-xs text-[#d5dfeb]">
            {publication.researchArea}
          </span>
          {publication.myAuthorRole ? (
            <span className="rounded-full border border-[#2b4f43] bg-[#0f221d] px-3 py-1 text-xs text-[#8fe3be]">
              {publication.myAuthorRole}
            </span>
          ) : null}
            {actionLinks.map((item) => (
              <Link
                key={`${publication.id}-${item.label}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#263a55] bg-[#0d1728] px-3 py-1 text-xs text-[#d5dfeb] transition hover:border-[#4d7298] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <p className={`mt-4 overflow-hidden text-sm leading-7 text-[#9fb1c7] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ${compact ? "min-h-[3rem]" : "min-h-[3.5rem]"}`}>
          {formatAuthors(publication.authors)}
        </p>

        <div className={`mt-auto border-t border-[#1f2d41] ${compact ? "pt-4" : "pt-5"}`}>
          <Link href={`/research/${publication.slug}`} className="block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#93d8ff]">Read publication</span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff] transition group-hover:border-[#72d5ff] group-hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                  <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
          <div className={`flex flex-wrap items-center gap-4 text-xs text-[#8fa4bb] ${compact ? "mt-3" : "mt-4"}`}>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#70d5ff]" />
              {publication.researchArea}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#7cf0b7]" />
              {toTitleCase(publication.status)}
            </span>
          </div>
          <ResearchCardMetrics
            slug={publication.slug}
            views={publication.views || 0}
            impressions={publication.impressionCount || 0}
            discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
            shares={publication.shareCount || 0}
            className="mt-4"
          />
        </div>
      </div>
    </article>
  );
}
