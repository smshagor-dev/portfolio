import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCommentsPanel from "@/app/components/article/article-comments-panel";
import ArticleDetailStats from "@/app/components/article/article-detail-stats";
import ArticleHeaderMetrics from "@/app/components/article/article-header-metrics";
import ArticleShareStrip from "@/app/components/article/article-share-strip";
import { getArticleDetailData } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

function formatArticleDate(value) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const data = await getArticleDetailData(resolvedParams.slug).catch(() => null);
  const settings = data?.siteSettings || null;
  const article = data?.article || null;
  const siteTitle = settings?.websiteTitle || "Portfolio Website";
  const canonicalUrl = settings?.canonicalUrl
    ? `${String(settings.canonicalUrl).replace(/\/$/, "")}/artical/${resolvedParams.slug}`
    : `/artical/${resolvedParams.slug}`;
  const keywords = Array.isArray(article?.tags) ? article.tags : [];
  const description = article?.metaDescription || article?.shortDescription || "Article detail page.";
  const title = article?.metaTitle || article?.title || "Article";

  const metadata = buildPageMetadata(settings, {
    title,
    description,
    path: `/artical/${resolvedParams.slug}`,
    image: article?.featuredImage || settings?.seoImage,
  });

  return {
    ...metadata,
    keywords,
    authors: article?.author ? [{ name: article.author }] : undefined,
    creator: article?.author || undefined,
    publisher: siteTitle,
    category: Array.isArray(article?.categories) && article.categories[0]?.name
      ? article.categories[0].name
      : article?.category || undefined,
    robots: {
      index: settings?.robotsIndexingEnabled ?? true,
      follow: settings?.robotsFollowEnabled ?? true,
      googleBot: {
        index: settings?.robotsIndexingEnabled ?? true,
        follow: settings?.robotsFollowEnabled ?? true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article?.publishDate || undefined,
      modifiedTime: article?.updatedAt || undefined,
      authors: article?.author ? [article.author] : undefined,
      tags: keywords,
    },
    twitter: {
      ...metadata.twitter,
      creator: article?.author ? `@${article.author.replace(/\s+/g, "")}` : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ArticalDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getArticleDetailData(resolvedParams.slug).catch(() => null);

  if (!data?.article) {
    notFound();
  }

  const { article, relatedArticles = [] } = data;
  const canonicalUrl = data?.siteSettings?.canonicalUrl
    ? `${String(data.siteSettings.canonicalUrl).replace(/\/$/, "")}/artical/${article.slug}`
    : `http://localhost:3000/artical/${article.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.shortDescription,
    image: article.featuredImage ? [new URL(article.featuredImage, canonicalUrl).toString()] : undefined,
    datePublished: article.publishDate || article.createdAt,
    dateModified: article.updatedAt || article.publishDate || article.createdAt,
    author: {
      "@type": "Person",
      name: article.author || "Editorial Desk",
    },
    publisher: {
      "@type": "Organization",
      name: data?.siteSettings?.websiteTitle || "Portfolio Website",
      logo: data?.siteSettings?.websiteIcon
        ? {
            "@type": "ImageObject",
            url: new URL(data.siteSettings.websiteIcon, canonicalUrl).toString(),
          }
        : undefined,
    },
    mainEntityOfPage: canonicalUrl,
    articleSection:
      Array.isArray(article.categories) && article.categories.length
        ? article.categories.map((item) => item.name)
        : [article.category || "Article"],
    keywords: Array.isArray(article.tags) ? article.tags.join(", ") : "",
  };

  return (
    <div className="py-8 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top_left,rgba(112,213,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,240,183,0.1),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="p-6 md:p-8 xl:p-10">
            <Link
              href="/artical"
              className="inline-flex items-center gap-2 text-sm text-[#79d4ff] transition hover:text-white"
            >
              <span>{"<"}</span>
              Back to articles
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {(Array.isArray(article.categories) && article.categories.length
                ? article.categories
                : [{ id: "fallback", name: article.category || "Article" }]).map((category) => (
                <span
                  key={`${article.id}-${category.id}`}
                  className="inline-flex items-center rounded-full border border-[#2d5074] bg-[#11253a] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]"
                >
                  {category.name}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-[#344760] bg-[#111d31] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                {article.author || "Editorial Desk"}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#344760] bg-[#111d31] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                {formatArticleDate(article.publishDate)}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#bcc8d8] md:text-base">
              {article.shortDescription}
            </p>

            {article.featuredImage ? (
              <div className="relative mt-8 h-[280px] overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[#0b1422] sm:h-[360px]">
                <Image
                  src={article.featuredImage}
                  alt={article.title || "Article image"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}

            <div className="mt-8 border-t border-[#203049] pt-8">
              <p className="text-xs uppercase tracking-[0.32em] text-[#70d5ff]">Article Details</p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Structured for reading, reference, and practical implementation takeaways
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[#9fb1c7] md:text-base">
                This article view follows the same polished long-form layout style as the other detail pages, while keeping the reading area focused and the supporting context easy to scan.
              </p>
              <div
                className="service-content mt-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-8 border-t border-[#1f2d41] pt-6">
                <ArticleHeaderMetrics
                  articleSlug={article.slug}
                  views={article.views || 0}
                  impressions={article.impressionCount || 0}
                  discussionCount={(article.commentCount || 0) + (article.replyCount || 0)}
                  shares={article.shareCount || 0}
                  variant="compact"
                />
              </div>

              <ArticleShareStrip title={article.title} canonicalUrl={canonicalUrl} articleSlug={article.slug} />
            </div>
          </div>

          <aside className="border-t border-[#1d2d42] bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(8,13,23,0.96))] p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Article Snapshot</p>
              <ArticleDetailStats
                author={article.author || "Editorial Desk"}
                publishDate={formatArticleDate(article.publishDate)}
              />
              <div className="mt-5 border-t border-[#1f2d41] pt-5">
                <ArticleHeaderMetrics
                  articleSlug={article.slug}
                  views={article.views || 0}
                  impressions={article.impressionCount || 0}
                  discussionCount={(article.commentCount || 0) + (article.replyCount || 0)}
                  shares={article.shareCount || 0}
                />
              </div>
            </div>

            {Array.isArray(article.tags) && article.tags.length ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Tags</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={`${article.id}-${tag}`}
                      className="rounded-full border border-[#24344d] bg-[#0d1728] px-3 py-1 text-xs text-[#d7dfec]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">More Articles</p>
              <div className="mt-4 space-y-3">
                {relatedArticles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a3b55] bg-[#0e1829] p-4 text-sm text-[#9fb1c7]">
                    No related articles available.
                  </div>
                ) : (
                  relatedArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/artical/${item.slug}`}
                      className="block rounded-[1.25rem] border border-[#24344d] bg-[#0d1728] p-4 transition hover:border-[#3a5678]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.title}</p>
                        <span className="text-xs text-[#8fa4bb]">{formatArticleDate(item.publishDate)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
                        {stripHtml(item.shortDescription).slice(0, 120)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ArticleCommentsPanel
        articleSlug={article.slug}
        comments={article.comments || []}
        commentsEnabled={article.commentsEnabled}
      />
    </div>
  );
}
