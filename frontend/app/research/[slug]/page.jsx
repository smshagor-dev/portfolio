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
import { resolveResearchPdf } from "@/lib/research-pdf";
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

function ActionLink({ href, children, primary = false }) {
  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      target={href.startsWith("#") ? undefined : "_blank"}
      rel={href.startsWith("#") ? undefined : "noreferrer"}
      className={
        primary
          ? "inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#06101c] transition hover:opacity-90"
          : "inline-flex items-center justify-center gap-2 rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
      }
    >
      {children}
    </Link>
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
  const pdf = await resolveResearchPdf(publication.doi, publication);
  const canonicalUrl = settings?.canonicalUrl
    ? `${String(settings.canonicalUrl).replace(/\/$/, "")}/research/${publication.slug}`
    : `http://localhost:3000/research/${publication.slug}`;
  const doiUrl = buildDoiUrl(publication.doi);
  const authors = normalizeAuthors(publication.authors);
  const relatedPublications = Array.isArray(publicationResponse?.relatedPublications)
    ? publicationResponse.relatedPublications.slice(0, 3)
    : [];
  const sameAs = [doiUrl, publication.publicationUrl, publication.citationUrl, pdf?.url].filter(Boolean);
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

      <section className="relative mt-5 overflow-hidden rounded-[2.2rem] border border-[#22344d] bg-[radial-gradient(circle_at_85%_10%,rgba(112,213,255,0.16),transparent_27%),linear-gradient(160deg,#101c31,#091321_58%,#07101c)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
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

        <h1 className="mt-6 max-w-6xl break-words text-3xl font-semibold leading-[1.12] text-white sm:text-4xl lg:text-5xl">
          {publication.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8199b1]">
          <span>{formatResearchDate(publication.publishedDate)}</span>
          <span className="h-1 w-1 rounded-full bg-[#46637f]" />
          <span>{publication.publisherName}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#29405b] bg-[#091525]/78 p-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#35516f] bg-[#0c1a2c] px-4 py-3 text-sm font-semibold text-[#d7e7f3]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#8edcff]" strokeWidth="1.8" aria-hidden="true">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            {publication.views || 0} views
          </span>

          {doiUrl ? (
            <ActionLink href={doiUrl}>
              DOI
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ActionLink>
          ) : null}

          <ResearchShareButton publicationSlug={publication.slug} canonicalUrl={canonicalUrl} />

          {publication.publicationUrl ? (
            <ActionLink href={publication.publicationUrl} primary>
              View publication
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ActionLink>
          ) : null}

          {pdf?.url ? (
            <>
              <ActionLink href="#research-pdf">Read PDF on this page</ActionLink>
              <ActionLink href={pdf.url}>Open PDF</ActionLink>
            </>
          ) : null}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[#29405b] bg-[#0a1626]/88 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Abstract</p>
            <span className="rounded-full border border-[#28415c] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#7f9bb4]">Synced metadata</span>
          </div>
          <p className="mt-4 text-sm leading-8 text-[#c9d5e2] sm:text-base">
            {publication.shortSummary || "An abstract has not been indexed for this record yet."}
          </p>
        </div>
      </section>

      {pdf?.url ? (
        <section id="research-pdf" className="mt-8 scroll-mt-24 overflow-hidden rounded-[1.8rem] border border-[#243850] bg-[#08121f] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-4 border-b border-[#203049] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Full text PDF</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Read the publication on this page</h2>
              <p className="mt-2 text-xs text-[#8299b0]">PDF discovered from DOI metadata via {pdf.source}.</p>
            </div>
            <ActionLink href={pdf.url}>Open PDF in new tab</ActionLink>
          </div>
          <div className="bg-[#050b13] p-2 sm:p-3">
            <iframe
              src={pdf.url}
              title={`${publication.title} PDF`}
              className="h-[70vh] min-h-[560px] w-full rounded-[1rem] border border-[#1f3148] bg-white"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="px-5 py-4 text-xs leading-6 text-[#7f94aa] sm:px-6">
            If the publisher blocks embedded viewing, use “Open PDF in new tab” above.
          </p>
        </section>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <main>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Full record</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Publication details</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#91a5b9]">
              Complete scholarly metadata and identifiers for this publication.
            </p>
          </div>
          <ResearchContent content={publication.content} excludeSections={["Abstract"]} />
        </main>

        <aside className="space-y-5 xl:sticky xl:top-24">
          {publication.thumbnailImage ? (
            <div className="relative h-48 overflow-hidden rounded-[1.5rem] border border-[#263a54] bg-[#0b1422]">
              <Image src={buildPublicAssetUrl(publication.thumbnailImage)} alt={publication.title || "Research publication image"} fill className="object-cover" sizes="340px" priority />
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-[#243850] bg-[#0b1626] p-5">
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
              {pdf?.url ? <MetadataRow label="PDF source">{pdf.source}</MetadataRow> : null}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#243850] bg-[#0b1626] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Engagement</p>
            <ResearchHeaderMetrics
              publicationSlug={publication.slug}
              views={publication.views || 0}
              impressions={publication.impressionCount || 0}
              discussionCount={(publication.commentCount || 0) + (publication.replyCount || 0)}
              shares={publication.shareCount || 0}
            />
          </div>

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
