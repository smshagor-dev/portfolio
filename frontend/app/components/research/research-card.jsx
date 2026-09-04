import Image from "next/image";
import Link from "next/link";
import ResearchCardMetrics from "@/app/components/research/research-card-metrics";
import { getSolidBlurDataUrl } from "@/lib/image-placeholder";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { formatResearchDate } from "@/lib/research";

function DoiLabel({ doi }) {
  if (!doi) {
    return null;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#2b405b] bg-[#0a1423] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#91abc2]">
      <span className="shrink-0 text-[#72d5ff]">DOI</span>
      <span className="truncate normal-case tracking-normal">{doi}</span>
    </span>
  );
}

export default function ResearchCard({ publication, compact = false, priority = false, titleOnly = false }) {
  if (titleOnly) {
    return (
      <article className={`group h-full overflow-hidden border border-[#24364f] bg-[linear-gradient(180deg,rgba(16,28,46,0.98),rgba(8,16,28,0.99))] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#456b91] ${compact ? "rounded-[1.4rem]" : "rounded-[1.75rem]"}`}>
        <Link
          href={`/research/${publication.slug}`}
          className={`flex h-full items-center ${compact ? "min-h-28 p-5" : "min-h-36 p-6 sm:p-7"}`}
        >
          <h3 className={`font-semibold leading-snug text-white transition group-hover:text-[#9de2ff] ${compact ? "text-lg" : "text-xl sm:text-[1.35rem]"}`}>
            {publication.title}
          </h3>
        </Link>
      </article>
    );
  }

  const hasThumbnail = Boolean(publication?.thumbnailImage);
  const imageHeight = compact ? "h-36" : "h-52";

  return (
    <article className={`group flex h-full flex-col overflow-hidden border border-[#24364f] bg-[linear-gradient(180deg,rgba(16,28,46,0.98),rgba(8,16,28,0.99))] shadow-[0_22px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#456b91] ${compact ? "rounded-[1.4rem]" : "rounded-[1.75rem]"}`}>
      <Link href={`/research/${publication.slug}`} className={`relative block overflow-hidden border-b border-[#1f3047] bg-[#0b1524] ${imageHeight}`}>
        {hasThumbnail ? (
          <Image
            src={buildPublicAssetUrl(publication.thumbnailImage)}
            alt={publication.title || "Research publication thumbnail"}
            fill
            placeholder="blur"
            blurDataURL={getSolidBlurDataUrl("#10233a")}
            className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
            sizes={compact ? "(max-width: 1279px) 100vw, 360px" : "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"}
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#79d4ff]">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth="1.4">
              <path d="M5 3.5h10l4 4V20.5H5z" strokeLinejoin="round" />
              <path d="M15 3.5v5h4M8 12h8M8 15.5h8M8 19h5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,13,23,0.04),rgba(7,13,23,0.78))]" />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full border border-[#42688e] bg-[#0a1728]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a8e4ff] backdrop-blur">
            {publication.publicationType}
          </span>
          {publication.isFeatured ? (
            <span className="rounded-full border border-[#2e6955] bg-[#0c211a]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ce9bb] backdrop-blur">
              Featured
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <span className="inline-flex max-w-full rounded-full border border-[#34516f] bg-[#081322]/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#d5e2ee] backdrop-blur">
            <span className="truncate">{publication.researchArea}</span>
          </span>
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5 sm:p-6"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.17em] text-[#7891aa]">
          <span>{formatResearchDate(publication.publishedDate, { compact: true })}</span>
          <span className="h-1 w-1 rounded-full bg-[#44627e]" />
          <span className="min-w-0 truncate">{publication.publisherName}</span>
        </div>

        <Link href={`/research/${publication.slug}`} className="mt-3 block">
          <h3 className={`font-semibold leading-snug text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] ${compact ? "text-lg" : "text-xl sm:text-[1.35rem]"}`}>
            {publication.title}
          </h3>
        </Link>

        <p className={`mt-3 overflow-hidden leading-7 text-[#b7c7d7] [display:-webkit-box] [-webkit-box-orient:vertical] ${compact ? "text-sm [-webkit-line-clamp:3]" : "text-sm [-webkit-line-clamp:5]"}`}>
          {publication.shortSummary || "Abstract metadata is not available for this publication yet."}
        </p>

        {!compact ? (
          <div className="mt-4 min-w-0">
            <DoiLabel doi={publication.doi} />
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          {!compact ? (
            <ResearchCardMetrics
              slug={publication.slug}
              views={publication.views || 0}
              impressions={publication.impressionCount || 0}
              discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
              shares={publication.shareCount || 0}
              className="border-y border-[#1d2d42] py-3"
            />
          ) : null}

          <Link href={`/research/${publication.slug}`} className={`${compact ? "mt-1" : "mt-4"} flex items-center justify-between gap-3 rounded-xl border border-[#2b405b] bg-[#0c1828] px-4 py-3 text-sm font-semibold text-[#9edfff] transition hover:border-[#66c8f5] hover:bg-[#102036] hover:text-white`}>
            <span>{compact ? "Open record" : "Read full publication record"}</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
