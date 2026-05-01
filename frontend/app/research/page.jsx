import ResearchList from "@/app/components/research/research-list";
import { getResearchPublications, getSiteSettings } from "@/lib/api";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Research Publications",
    description: "Explore research publications, papers, journal articles, and scholarly contributions.",
    path: "/research",
  });
}

export default async function ResearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const response = await getResearchPublications({
    search: resolvedSearchParams?.search || "",
    publicationType: resolvedSearchParams?.publicationType || "",
    researchArea: resolvedSearchParams?.researchArea || "",
    status: resolvedSearchParams?.status || "published",
    page: resolvedSearchParams?.page || "1",
    limit: "9",
  }).catch((error) => ({
    success: false,
    message: error.message || "Failed to load research publications.",
    data: [],
    pagination: { page: 1, totalPages: 1, total: 0, limit: 9 },
    filters: {
      search: resolvedSearchParams?.search || "",
      publicationType: resolvedSearchParams?.publicationType || "",
      researchArea: resolvedSearchParams?.researchArea || "",
      status: resolvedSearchParams?.status || "published",
    },
    options: {
      publicationTypes: [],
      researchAreas: [],
      statuses: ["published"],
    },
  }));

  return (
    <div className="py-8 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-[#22324a] bg-[radial-gradient(circle_at_top_left,rgba(112,213,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,240,183,0.12),transparent_28%),linear-gradient(180deg,#10192c,#09111d)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.24)] lg:p-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#35506f] bg-[linear-gradient(180deg,rgba(18,37,58,0.92),rgba(11,22,37,0.92))] px-5 py-2 shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#79d4ff] shadow-[0_0_18px_rgba(121,212,255,0.9)]" />
            <p className="text-sm uppercase tracking-[0.35em] text-[#bde9ff]">Research Library</p>
          </div>
          <h1 className="mt-6 bg-[linear-gradient(135deg,#f4fbff_0%,#9edfff_45%,#7cf0b7_100%)] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl lg:text-6xl">
            Research Publications
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#d3d8e8] lg:text-lg">
            Browse scholarly publications with server-rendered SEO, structured detail pages, and filters for research area, publication type, and publication status.
          </p>
        </div>
      </section>

      {!response.success ? (
        <section className="mt-8 rounded-[1.75rem] border border-[#5c2f3c] bg-[#1b0f15] p-6">
          <p className="text-lg font-semibold text-white">Research publications could not be loaded</p>
          <p className="mt-3 text-sm leading-7 text-[#e0b9c4]">{response.message}</p>
        </section>
      ) : (
        <ResearchList response={response} />
      )}
    </div>
  );
}
