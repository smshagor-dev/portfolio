import ResearchList from "@/app/components/research/research-list";
import { getResearchPublications, getSiteSettings } from "@/lib/api";
import { formatResearchDate } from "@/lib/research";
import { buildPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings().catch(() => null);
  return buildPageMetadata(settings, {
    title: "Research Publications",
    description: "Explore research publications, preprints, scholarly metadata, abstracts, DOI records, and research outputs.",
    path: "/research",
  });
}

export default async function ResearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const response = await getResearchPublications({
    search: resolvedSearchParams?.search || "",
    publicationType: resolvedSearchParams?.publicationType || "",
    researchArea: resolvedSearchParams?.researchArea || "",
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
    },
    options: {
      publicationTypes: [],
      researchAreas: [],
    },
  }));

  const publications = Array.isArray(response?.data) ? response.data : [];
  const total = response?.pagination?.total || publications.length;
  const areaCount = response?.options?.researchAreas?.length || 0;
  const typeCount = response?.options?.publicationTypes?.length || 0;
  const latestPublishedDate = publications[0]?.publishedDate || null;

  return (
    <div className="py-8 text-white">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#22344d] bg-[radial-gradient(circle_at_10%_0%,rgba(112,213,255,0.2),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(124,240,183,0.12),transparent_30%),linear-gradient(160deg,#101c31_0%,#0a1322_56%,#07101c_100%)] px-6 py-8 shadow-[0_32px_90px_rgba(0,0,0,0.28)] sm:px-8 lg:px-12 lg:py-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#6cc8ff]/10" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-[#7cf0b7]/10" />

        <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#35506f] bg-[#0d1a2c]/80 px-4 py-2 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#79d4ff] shadow-[0_0_18px_rgba(121,212,255,0.9)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#bfeaff]">
                Synced Research Library
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              Research, abstracts, and scholarly metadata in one searchable library.
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-8 text-[#c4d1df] sm:text-base lg:text-lg">
              Publications are synchronized from ORCID and DOI metadata, enriched through Crossref, OpenAlex, and publisher sources, then presented with abstracts, authorship, citation links, and research-area classification.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["ORCID", "Crossref", "OpenAlex", "Publisher metadata", "12-hour sync"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#2b425e] bg-[#0b1626]/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9eb8cf]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] border border-[#29415e] bg-[#0b1728]/85 p-5 backdrop-blur">
              <p className="text-3xl font-semibold text-white">{total}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#86a4bf]">Publications</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#29415e] bg-[#0b1728]/85 p-5 backdrop-blur">
              <p className="text-3xl font-semibold text-white">{areaCount}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#86a4bf]">Research Areas</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#29415e] bg-[#0b1728]/85 p-5 backdrop-blur">
              <p className="text-3xl font-semibold text-white">{typeCount}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#86a4bf]">Publication Types</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#29415e] bg-[#0b1728]/85 p-5 backdrop-blur">
              <p className="text-base font-semibold leading-7 text-white">
                {latestPublishedDate ? formatResearchDate(latestPublishedDate, { compact: true }) : "—"}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#86a4bf]">Latest Record</p>
            </div>
          </div>
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
