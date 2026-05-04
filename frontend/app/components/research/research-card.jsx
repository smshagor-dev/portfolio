import Image from "next/image";
import Link from "next/link";
import ResearchCardMetrics from "@/app/components/research/research-card-metrics";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import {
  formatResearchDate,
  getResearchStatusClasses,
  toTitleCase,
} from "@/lib/research";

export default function ResearchCard({ publication, compact = false, priority = false }) {
  const hasThumbnail = Boolean(publication?.thumbnailImage);

  if (compact) {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]">
        <div className="relative h-36 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
          {hasThumbnail ? (
            <Image
              src={buildPublicAssetUrl(publication.thumbnailImage)}
              alt={publication.title || "Research publication thumbnail"}
              fill
              className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
              sizes="(max-width: 1279px) 100vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.28em] text-[#7fcfff]">
              Research publication
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.94))]" />
          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-[#4b6991] bg-[rgba(13,24,38,0.82)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a5e3ff]">
              {publication.publicationType}
            </span>
          </div>
          <div className="absolute right-4 top-4">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getResearchStatusClasses(publication.status)}`}>
              {toTitleCase(publication.status)}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <span className="inline-flex max-w-full items-center rounded-full border border-[#36557c] bg-[rgba(8,17,29,0.8)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d9e7f5]">
              <span className="truncate">{publication.researchArea}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#88a0b9]">
            <span>{formatResearchDate(publication.publishedDate, { compact: true })}</span>
            <span className="h-1 w-1 rounded-full bg-[#47627e]" />
            <span className="truncate">{publication.publisherName}</span>
          </div>

          <Link href={`/research/${publication.slug}`} className="mt-3 block">
            <div className="rounded-[1.1rem] border border-[#22344f] bg-[#0d1728] px-4 py-3">
              <h3 className="overflow-hidden text-lg font-semibold leading-6 text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {publication.title}
              </h3>
            </div>
          </Link>

          <div className="mt-3 rounded-[1.1rem] border border-[#1f3048] bg-[#0b1422] px-4 py-3">
            <p className="h-[4.5rem] overflow-hidden text-sm leading-6 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {publication.shortSummary}
            </p>
          </div>

          <div className="mt-4 border-t border-[#1f2d41] pt-3">
            <Link href={`/research/${publication.slug}`} className="block">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#93d8ff]">Read publication</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff] transition group-hover:border-[#72d5ff] group-hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                    <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
            <ResearchCardMetrics
              slug={publication.slug}
              views={publication.views || 0}
              impressions={publication.impressionCount || 0}
              discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
              shares={publication.shareCount || 0}
              className="mt-3"
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]">
      <div className="relative h-56 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
        {hasThumbnail ? (
          <Image
            src={buildPublicAssetUrl(publication.thumbnailImage)}
            alt={publication.title || "Research publication thumbnail"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            sizes="(max-width: 1279px) 100vw, 33vw"
            priority={priority}
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
        <div className="absolute inset-x-5 bottom-5">
          <span className="inline-flex max-w-full items-center rounded-full border border-[#36557c] bg-[rgba(8,17,29,0.82)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d9e7f5]">
            <span className="truncate">{publication.researchArea}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="min-h-[1.5rem] flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#88a0b9]">
          <span>{formatResearchDate(publication.publishedDate, { compact: true })}</span>
          <span className="h-1 w-1 rounded-full bg-[#47627e]" />
          <span>{publication.publisherName}</span>
        </div>

        <Link href={`/research/${publication.slug}`} className="mt-4 block">
          <div className="rounded-[1.2rem] border border-[#22344f] bg-[#0d1728] px-5 py-4">
            <h3 className="min-h-[4rem] overflow-hidden text-2xl font-semibold leading-8 text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {publication.title}
            </h3>
          </div>
        </Link>

        <div className="mt-4 rounded-[1.2rem] border border-[#1f3048] bg-[#0b1422] px-5 py-4">
          <p className="h-[8.75rem] overflow-hidden text-sm leading-7 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] lg:h-[10.5rem] lg:[-webkit-line-clamp:6]">
            {publication.shortSummary}
          </p>
        </div>

        <div className="mt-auto border-t border-[#1f2d41] pt-5">
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
