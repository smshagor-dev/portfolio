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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                activeCategory === "all"
                  ? "border-[#74d6ff] bg-[#12304c] text-white"
                  : "border-[#29405d] bg-[#0d1728] text-[#a9bdd2] hover:border-[#4b678b] hover:text-white"
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                  activeCategory === category.slug
                    ? "border-[#74d6ff] bg-[#12304c] text-white"
                    : "border-[#29405d] bg-[#0d1728] text-[#a9bdd2] hover:border-[#4b678b] hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredArticles.length === 0 ? (
            <div className="md:col-span-2 rounded-[1.75rem] border border-dashed border-[#2d415d] bg-[linear-gradient(180deg,rgba(13,23,40,0.94),rgba(9,17,29,0.94))] p-10 text-center">
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
                className="group overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(16,25,43,0.98),rgba(9,17,29,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#4d7298]"
              >
                <div className="relative h-56 overflow-hidden border-b border-[#203049] bg-[#0c1523]">
                  {article.featuredImage ? (
                    <Image
                      src={buildPublicAssetUrl(article.featuredImage)}
                      alt={article.title || "Article cover"}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.28em] text-[#7fcfff]">
                      Published article
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(7,13,24,0.95))]" />
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#88a0b9]">
                    <span>{formatArticleDate(article.publishDate)}</span>
                    <span className="h-1 w-1 rounded-full bg-[#47627e]" />
                    <span>{article.author || "Editorial Desk"}</span>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold leading-tight text-white transition group-hover:text-[#9de2ff]">
                    {article.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#c3cfdd]">{article.shortDescription}</p>

                  {Array.isArray(article.categories) && article.categories.length ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {article.categories.map((category) => (
                        <span
                          key={`${article.id}-${category.id}`}
                          className="rounded-full border border-[#2f4866] bg-[#112033] px-3 py-1 text-xs text-[#bcd0e4]"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6 border-t border-[#1f2d41] pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#93d8ff]">Open details</span>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#35506f] bg-[#11253a] text-[#bfe9ff]">
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
            ))
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-[#263753] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Library Snapshot</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                <span className="text-sm text-[#9fb1c7]">Published</span>
                <span className="text-sm font-medium text-white">{articles.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                <span className="text-sm text-[#9fb1c7]">Categories</span>
                <span className="text-sm font-medium text-white">{categories.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-[1rem] border border-[#24344d] bg-[#0d1728] px-4 py-3">
                <span className="text-sm text-[#9fb1c7]">Showing</span>
                <span className="text-sm font-medium text-white">{filteredArticles.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#263753] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Popular Topics</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-sm text-[#9fb1c7]">Add article categories from the admin panel.</span>
              ) : (
                categories.map((category) => (
                  <button
                    key={`aside-${category.slug}`}
                    type="button"
                    onClick={() => setActiveCategory(category.slug)}
                    className="rounded-full border border-[#29405d] bg-[#0d1728] px-3 py-2 text-xs text-[#c6d5e5] transition hover:border-[#4b678b] hover:text-white"
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
