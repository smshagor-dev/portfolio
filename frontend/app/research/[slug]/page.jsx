import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResearchCard from "@/app/components/research/research-card";
import ResearchCommentsPanel from "@/app/components/research/research-comments-panel";
import ResearchHeaderMetrics from "@/app/components/research/research-header-metrics";
import ResearchShareButton from "@/app/components/research/research-share-button";
import { getFeaturedResearchPublications, getResearchPublicationDetail, getSiteSettings } from "@/lib/api";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { buildDoiUrl, formatAuthors, formatResearchDate, normalizeAuthors, toTitleCase } from "@/lib/research";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

async function loadResearchPublication(slug) {
  try {
    return await getResearchPublicationDetail(slug);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("404") || message.includes("not found")) {
      return null;
    }

    throw error;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const [publicationResponse, settings] = await Promise.all([
    loadResearchPublication(resolvedParams.slug),
    getSiteSettings().catch(() => null),
  ]);

  const publication = publicationResponse?.data || null;
  const metadata = buildPageMetadata(settings, {
    title: publication?.title || "Research Publication",
    description: publication?.shortSummary || "Research publication details.",
    path: `/research/${resolvedParams.slug}`,
    image: publication?.thumbnailImage || settings?.seoImage,
  });
  const canonicalUrl = settings?.canonicalUrl
    ? `${String(settings.canonicalUrl).replace(/\/$/, "")}/research/${resolvedParams.slug}`
    : `/research/${resolvedParams.slug}`;

  return {
    ...metadata,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      title: publication?.title || metadata.title,
      description: publication?.shortSummary || metadata.description,
    },
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      title: publication?.title || metadata.title,
      description: publication?.shortSummary || metadata.description,
    },
  };
}

export default async function ResearchDetailPage({ params }) {
  const resolvedParams = await params;
  const [publicationResponse, featuredResponse, settings] = await Promise.all([
    loadResearchPublication(resolvedParams.slug),
    getFeaturedResearchPublications().catch(() => ({ data: [] })),
    getSiteSettings().catch(() => null),
  ]);

  if (!publicationResponse?.data) {
    notFound();
  }

  const publication = publicationResponse.data;
  const canonicalUrl = settings?.canonicalUrl
    ? `${String(settings.canonicalUrl).replace(/\/$/, "")}/research/${publication.slug}`
    : `http://localhost:3000/research/${publication.slug}`;
  const doiUrl = buildDoiUrl(publication.doi);
  const authors = normalizeAuthors(publication.authors);
  const relatedPublications = (featuredResponse?.data || [])
    .filter((item) => item.slug !== publication.slug)
    .slice(0, 3);
  const sameAs = [doiUrl, publication.publicationUrl, publication.citationUrl].filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    description: publication.shortSummary,
    author: authors.length
      ? authors.map((author) => ({
          "@type": "Person",
          name: author,
        }))
      : undefined,
    datePublished: publication.publishedDate,
    publisher: {
      "@type": "Organization",
      name: publication.publisherName,
    },
    url: canonicalUrl,
    sameAs,
    image: publication.thumbnailImage ? [buildPublicAssetUrl(publication.thumbnailImage)] : undefined,
  };

  return (
    <div className="py-8 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.16),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="p-6 md:p-8 xl:p-10">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm text-[#79d4ff] transition hover:text-white"
            >
              <span>{"<"}</span>
              Back to research
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[#2d5074] bg-[#11253a] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                {publication.publicationType}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#344760] bg-[#111d31] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                {publication.researchArea}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#344760] bg-[#111d31] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#b5c5d6]">
                {toTitleCase(publication.status)}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {publication.title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#bcc8d8] md:text-base">
              {publication.shortSummary}
            </p>

            {publication.thumbnailImage ? (
              <div className="relative mt-8 h-[280px] overflow-hidden rounded-[1.75rem] border border-[#24344d] bg-[#0b1422] sm:h-[360px]">
                <Image
                  src={buildPublicAssetUrl(publication.thumbnailImage)}
                  alt={publication.title || "Research publication image"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}

            <div className="mt-8 border-t border-[#203049] pt-8">
              <p className="text-xs uppercase tracking-[0.32em] text-[#70d5ff]">Publication Overview</p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Publication links, citation access, authorship, and scholarly metadata in one place
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[#9fb1c7] md:text-base">
                This detail page is server-rendered for search visibility and includes structured data so each publication can stand on its own as a fully indexable portfolio entry.
              </p>

              {publication.content ? (
                <div
                  className="service-content mt-8"
                  dangerouslySetInnerHTML={{ __html: publication.content }}
                />
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={publication.publicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
                >
                  View Publication
                </Link>
                {publication.citationUrl ? (
                  <Link
                    href={publication.citationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
                  >
                    Citation
                  </Link>
                ) : null}
                {doiUrl ? (
                  <Link
                    href={doiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
                  >
                    DOI
                  </Link>
                ) : null}
                <ResearchShareButton
                  publicationSlug={publication.slug}
                  canonicalUrl={canonicalUrl}
                />
              </div>

              <div className="mt-8 border-t border-[#1f2d41] pt-6">
                <ResearchHeaderMetrics
                  publicationSlug={publication.slug}
                  views={publication.views || 0}
                  impressions={publication.impressionCount || 0}
                  discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
                  shares={publication.shareCount || 0}
                  variant="compact"
                />
              </div>
            </div>
          </div>

          <aside className="border-t border-[#1d2d42] bg-[linear-gradient(180deg,rgba(10,18,31,0.82),rgba(8,13,23,0.96))] p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Research Snapshot</p>
              <div className="mt-5 space-y-4 text-sm text-[#d7dfec]">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#86a0ba]">Publisher</p>
                  <p className="mt-1">{publication.publisherName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#86a0ba]">Published</p>
                  <p className="mt-1">{formatResearchDate(publication.publishedDate)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#86a0ba]">Authors</p>
                  <p className="mt-1">{formatAuthors(publication.authors)}</p>
                </div>
                {publication.myAuthorRole ? (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#86a0ba]">My Role</p>
                    <p className="mt-1">{publication.myAuthorRole}</p>
                  </div>
                ) : null}
                {publication.doi ? (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#86a0ba]">DOI</p>
                    <p className="mt-1 break-all">{publication.doi}</p>
                  </div>
                ) : null}
              </div>
              <div className="mt-5 border-t border-[#1f2d41] pt-5">
                <ResearchHeaderMetrics
                  publicationSlug={publication.slug}
                  views={publication.views || 0}
                  impressions={publication.impressionCount || 0}
                  discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
                  shares={publication.shareCount || 0}
                />
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#263753] bg-[#0c1523] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">More Research</p>
              <div className="mt-4 space-y-4">
                {relatedPublications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2a3b55] bg-[#0e1829] p-4 text-sm text-[#9fb1c7]">
                    No related featured publications available.
                  </div>
                ) : (
                  relatedPublications.map((item) => (
                    <ResearchCard key={item.id} publication={item} compact />
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ResearchCommentsPanel
        publicationSlug={publication.slug}
        comments={publication.comments || []}
      />
    </div>
  );
}
