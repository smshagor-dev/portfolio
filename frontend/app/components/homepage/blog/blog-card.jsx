import Image from "next/image";
import Link from "next/link";
import ArticleCardMetrics from "@/app/components/article/article-card-metrics";
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

export default function BlogCard({ article }) {
  const categories = Array.isArray(article?.categories) ? article.categories.slice(0, 2) : [];
  const tags = Array.isArray(article?.tags) ? article.tags.slice(0, 2) : [];

  return (
    <Link
      href={`/artical/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]"
    >
      <div className="relative h-56 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
        {article?.featuredImage ? (
          <Image
            src={buildPublicAssetUrl(article.featuredImage)}
            alt={article.title || "Article cover"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
            Editorial article
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.9))]" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          {(categories.length ? categories : [{ id: "article", name: article?.category || "Article" }]).map((category) => (
            <span
              key={`${article.id}-${category.id || category.name}`}
              className="rounded-full border border-[#4b6991] bg-[rgba(13,24,38,0.8)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a5e3ff]"
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="min-h-[1.5rem] flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#88a0b9]">
          <span>{formatArticleDate(article.publishDate)}</span>
          <span className="h-1 w-1 rounded-full bg-[#47627e]" />
          <span>{article.author || "Editorial Desk"}</span>
        </div>

        <h3 className="mt-4 min-h-[6rem] text-2xl font-semibold leading-tight text-white transition group-hover:text-[#9de2ff]">
          {article.title}
        </h3>
        <p className="mt-4 h-[8.75rem] overflow-hidden text-sm leading-7 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] lg:h-[11rem] lg:[-webkit-line-clamp:6]">
          {article.shortDescription}
        </p>

        <div className="mt-5 min-h-[2.5rem]">
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={`${article.id}-${tag}`}
                  className="rounded-full border border-[#263a55] bg-[#0d1728] px-3 py-1 text-xs text-[#d5dfeb]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-auto border-t border-[#1f2d41] pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#93d8ff]">Read article</span>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff] transition group-hover:border-[#72d5ff] group-hover:text-white">
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
            className="mt-4"
          />
        </div>
      </div>
    </Link>
  );
}
