import Image from "next/image";
import Link from "next/link";
import ArticleCardMetrics from "@/app/components/article/article-card-metrics";
import { getSolidBlurDataUrl } from "@/lib/image-placeholder";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";

function formatArticleDate(value) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function BlogCard({ article, priority = false }) {
  const categories = Array.isArray(article?.categories) ? article.categories.slice(0, 2) : [];
  const primaryCategory = (categories.length ? categories : [{ id: "article", name: article?.category || "Article" }])[0];

  return (
    <Link
      href={`/artical/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]"
    >
      <div className="relative h-40 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
        {article?.featuredImage ? (
          <Image
            src={buildPublicAssetUrl(article.featuredImage)}
            alt={article.title || "Article cover"}
            fill
            placeholder="blur"
            blurDataURL={getSolidBlurDataUrl("#10233a")}
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            sizes="(max-width: 1279px) 100vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
            Editorial article
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.94))]" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-[#4b6991] bg-[rgba(13,24,38,0.82)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a5e3ff]">
            Artical
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <span className="inline-flex max-w-full items-center rounded-full border border-[#36557c] bg-[rgba(8,17,29,0.8)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d9e7f5]">
            <span className="truncate">{primaryCategory.name}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#88a0b9]">
          <span>{formatArticleDate(article.publishDate)}</span>
          <span className="h-1 w-1 rounded-full bg-[#47627e]" />
          <span className="truncate">{article.author || "Editorial Desk"}</span>
        </div>

        <div className="mt-3 rounded-[1.1rem] border border-[#22344f] bg-[#0d1728] px-4 py-3">
          <h3 className="overflow-hidden text-lg font-semibold leading-6 text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {article.title}
          </h3>
        </div>

        <div className="mt-3 rounded-[1.1rem] border border-[#1f3048] bg-[#0b1422] px-4 py-3">
          <p className="h-[4.5rem] overflow-hidden text-sm leading-6 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {article.shortDescription}
          </p>
        </div>

        <div className="mt-4 border-t border-[#1f2d41] pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#93d8ff]">Read article</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff] transition group-hover:border-[#72d5ff] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <ArticleCardMetrics
            slug={article.slug}
            views={article.views || 0}
            impressions={article.impressionCount || 0}
            discussionCount={(article.commentCount || 0) + (article.replyCount || 0)}
            shares={article.shareCount || 0}
            className="mt-3"
          />
        </div>
      </div>
    </Link>
  );
}
