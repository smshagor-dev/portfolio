"use client";

import { useMemo, useState } from "react";
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

export default function ArticleCatalog({ articles = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") {
      return articles;
    }

    return articles.filter((article) =>
      Array.isArray(article?.categories) &&
      article.categories.some((category) => category.slug === activeCategory),
    );
  }, [activeCategory, articles]);

  function getPrimaryCategory(article) {
    const articleCategories = Array.isArray(article?.categories) ? article.categories : [];
    return (articleCategories.length
      ? articleCategories
      : [{ id: "article", name: article?.category || "Article" }])[0];
  }

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-[1.75rem] border border-[#23354d] bg-[linear-gradient(180deg,rgba(14,24,39,0.96),rgba(9,17,29,0.96))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Category Filter</p>
            <p className="mt-2 text-sm leading-7 text-[#aabacc]">
              Switch the reading grid by topic without leaving the page.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcff]">
              Choose Category
            </label>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="w-full appearance-none rounded-[1.1rem] border border-[#2f4866] bg-[#102033] px-4 py-3 pr-12 text-sm font-medium text-white outline-none transition focus:border-[#74d6ff] focus:bg-[#102033] [&>option]:bg-[#102033] [&>option]:text-white"
              >
                <option value="all" className="bg-[#102033] text-white">
                  All Articles
                </option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug} className="bg-[#102033] text-white">
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8fdcff]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[1.75rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] p-10 text-center">
              <p className="text-lg font-semibold text-white">No articles in this category yet</p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7d8]">
                Select another category or publish more content from the admin panel.
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/artical/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(17,29,46,0.98),rgba(9,17,29,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]"
              >
                <div className="relative h-40 overflow-hidden border-b border-[#213148] bg-[radial-gradient(circle_at_top,rgba(111,212,255,0.18),transparent_45%),#0c1523]">
                  {article.featuredImage ? (
                    <Image
                      src={buildPublicAssetUrl(article.featuredImage)}
                      alt={article.title || "Article cover"}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
                      Published article
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
                      <span className="truncate">{getPrimaryCategory(article).name}</span>
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
                    <h2 className="overflow-hidden text-lg font-semibold leading-6 text-white transition group-hover:text-[#9de2ff] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {article.title}
                    </h2>
                  </div>

                  <div className="mt-3 rounded-[1.1rem] border border-[#1f3048] bg-[#0b1422] px-4 py-3">
                    <p className="h-[4.5rem] overflow-hidden text-sm leading-6 text-[#becddd] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                      {article.shortDescription}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[#1f2d41] pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#93d8ff]">Read article</span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff]">
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
            ))
          )}
      </section>
    </div>
  );
}
