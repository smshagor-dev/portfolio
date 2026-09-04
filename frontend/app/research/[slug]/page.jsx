import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResearchCard from "@/app/components/research/research-card";
import ResearchCommentsPanel from "@/app/components/research/research-comments-panel";
import ResearchContent from "@/app/components/research/research-content";
import ResearchHeaderMetrics from "@/app/components/research/research-header-metrics";
import ResearchShareButton from "@/app/components/research/research-share-button";
import { getResearchPublicationDetail, getSiteSettings } from "@/lib/api";
import { buildPublicAssetUrl } from "@/lib/public-backend-url";
import { buildDoiUrl, formatAuthors, formatResearchDate, normalizeAuthors } from "@/lib/research";
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
    alternates: { canonical: canonicalUrl },
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

function MetadataRow({ label, children }) {
  if (!children) {
    return null;
  }

  return (
    <div className="border-b border-[#1d2d42] pb-4 last:border-0 last:pb-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7893ad]">{label}</p>
      <div className="mt-2 break-words text-sm leading-6 text-[#d2dce8]">{children}</div>
    </div>
  );
}

export default async function ResearchDetailPage({ params }) {
  const resolvedParams = await params;
  const [publicationResponse, settings] = await Promise.all([
    loadResearchPublication(resolvedParams.slug),
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
  const relatedPublications = Array.isArray(publicationResponse?.relatedPublications)
    ? publicationResponse.relatedPublications.slice(0, 3)
    : [];
  const sameAs = [doiUrl, publication.publicationUrl, publication.citationUrl].filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    description: publication.shortSummary,
    author: authors.length
      ? authors.map((author) => ({ "@type": "Person", name: author }))
      : undefined,
    datePublished: publication.publishedDate,
    publisher: { "@type": "Organization", name: publication.publisherName },
    url: canonicalUrl,
    sameAs,
    image: publication.thumbnailImage ? [buildPublicAssetUrl(publication.thumbnailImage)] : undefined,
  };

  return (
    <div className="py-8 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/research" className="inline-flex items-center gap-2 text-sm font-medium text-[#8edcff] transition hover:text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Research library
      </Link>

      <section className="relative mt-5 overflow-hidden rounded-[2.2rem] border border-[#22344d] bg-[radial-gradient(circle_at_85%_10%,rgba(112,213,255,0.16),transparent_27%),linear-gradient(160deg,#101c31,#091321_58%,#07101c)] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#3a6187] bg-[#102238] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ee2ff]">
                {publication.publicationType}
              </span>
              <span className="max-w-full rounded-full border border-[#30465f] bg-[#0d192a] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b7c8d9]">
                {publication.researchArea}
              </span>
              {publication.isFeatured ? (
                <span className="rounded-full border border-[#2d6b55] bg-[#0d241c] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#91ebbe]">
                  Featured
                </span>
              ) : null}
            </div>

            <h1 className="mt-6 max-w-5xl text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              {publication.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8199b1]">
              <span>{formatResearchDate(publication.publishedDate)}</span>
              <span className="h-1 w-1 rounded-full bg-[#46637f]" />
              <span>{publication.publisherName}</span>
              {publication.doi ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#46637f]" />
                  <span>DOI indexed</span>
                </>
              ) : null}
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-[#29405b] bg-[#0a1626]/88 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Abstract</p>
                <span className="rounded-full border border-[#28415c] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#7f9bb4]">Synced metadata</span>
              </div>
              <p className="mt-4 text-sm leading-8 text-[#c9d5e2] sm:text-base">
                {publication.shortSummary || "An abstract has not been indexed for this record yet."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {publication.publicationUrl ? (
                <Link href={publication.publicationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#06101c] transition hover:opacity-90">
                  View publication
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                    <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : null}
              {doiUrl ? (
                <Link href={doiUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]">
                  Open DOI
                </Link>
              ) : null}
              {publication.citationUrl && publication.citationUrl !== doiUrl ? (
                <Link href={publication.citationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]">
                  Citation source
                </Link>
              ) : null}
              <ResearchShareButton publicationSlug={publication.slug} canonicalUrl={canonicalUrl} />
            </div>
          </div>

          <aside className="border-t border-[#1d2d42] bg-[#08111f]/72 p-6 sm:p-8 xl:border-l xl:border-t-0">
            {publication.thumbnailImage ? (
              <div className="relative h-48 overflow-hidden rounded-[1.5rem] border border-[#263a54] bg-[#0b1422]">
                <Image src={buildPublicAssetUrl(publication.thumbnailImage)} alt={publication.title || "Research publication image"} fill className="object-cover" sizes="390px" priority />
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.5rem] border border-[#243850] bg-[#0b1626] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Research metadata</p>
              <div className="mt-5 space-y-4">
                <MetadataRow label="Authors">{formatAuthors(publication.authors)}</MetadataRow>
                <MetadataRow label="Author role">{publication.myAuthorRole}</MetadataRow>
                <MetadataRow label="Publisher">{publication.publisherName}</MetadataRow>
                <MetadataRow label="Published">{formatResearchDate(publication.publishedDate)}</MetadataRow>
                <MetadataRow label="DOI">
                  {doiUrl ? (
                    <Link href={doiUrl} target="_blank" rel="noreferrer" className="break-all text-[#8edcff] transition hover:text-white">{publication.doi}</Link>
                  ) : publication.doi}
                </MetadataRow>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[#243850] bg-[#0b1626] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Engagement</p>
              <ResearchHeaderMetrics
                publicationSlug={publication.slug}
                views={publication.views || 0}
                impressions={publication.impressionCount || 0}
                discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
                shares={publication.shareCount || 0}
              />
            </div>
          </aside>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <main>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Full record</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Publication details</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#91a5b9]">
              Synced scholarly metadata and manually curated content are rendered from the backend record without losing either format.
            </p>
          </div>
          <ResearchContent content={publication.content} />
        </main>

        <aside className="xl:sticky xl:top-24">
          <div className="rounded-[1.6rem] border border-[#243850] bg-[#0b1626] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Related research</p>
            <div className="mt-4 space-y-4">
              {relatedPublications.length ? relatedPublications.map((item) => (
                <ResearchCard key={item.id} publication={item} compact />
              )) : (
                <p className="rounded-xl border border-dashed border-[#2a3b55] p-4 text-sm leading-7 text-[#8fa4b9]">No related publications are available yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ResearchCommentsPanel publicationSlug={publication.slug} comments={publication.comments || []} />
    </div>
  );
}
