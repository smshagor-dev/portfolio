import Link from "next/link";
import ResearchCard from "./research-card";
import ResearchFilterBar from "./research-filter-bar";

function buildPageHref(page, filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/research${params.toString() ? `?${params.toString()}` : ""}`;
}

export default function ResearchList({ response }) {
  const publications = Array.isArray(response?.data) ? response.data : [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: publications.length, limit: 9 };
  const filters = response?.filters || {};
  const options = response?.options || {};
  const start = publications.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = publications.length ? start + publications.length - 1 : 0;

  return (
    <>
      <ResearchFilterBar filters={filters} options={options} />

      <div className="mt-8 flex flex-col gap-3 border-b border-[#1d2d42] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Publication Catalog</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Research records</h2>
        </div>
        <p className="text-sm text-[#8fa6bd]">
          {pagination.total > 0 ? `Showing ${start}–${end} of ${pagination.total}` : "No matching publications"}
        </p>
      </div>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {publications.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-[1.75rem] border border-dashed border-[#2a3b55] bg-[#0d1728] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2c4564] bg-[#102036] text-[#79d4ff]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.7">
                <path d="M5 4h10l4 4v12H5z" strokeLinejoin="round" />
                <path d="M15 4v5h4M8 13h8M8 17h6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-5 text-lg font-semibold text-white">No research publications found</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#9fb1c7]">
              Try a broader title, abstract keyword, publication type, or research area.
            </p>
          </div>
        ) : (
          publications.map((publication) => (
            <ResearchCard key={publication.id} publication={publication} titleOnly />
          ))
        )}
      </section>

      {pagination.totalPages > 1 ? (
        <nav className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#22324a] bg-[#0d1728] px-5 py-4" aria-label="Research pagination">
          <p className="text-sm text-[#9fb1c7]">
            Page <span className="font-semibold text-white">{pagination.page}</span> of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={buildPageHref(Math.max(1, pagination.page - 1), filters)}
              aria-disabled={pagination.page <= 1}
              className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                pagination.page <= 1
                  ? "pointer-events-none border-[#233244] text-[#5c7188]"
                  : "border-[#35516f] text-white hover:border-[#70d5ff] hover:text-[#70d5ff]"
              }`}
            >
              Previous
            </Link>
            <Link
              href={buildPageHref(Math.min(pagination.totalPages, pagination.page + 1), filters)}
              aria-disabled={pagination.page >= pagination.totalPages}
              className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                pagination.page >= pagination.totalPages
                  ? "pointer-events-none border-[#233244] text-[#5c7188]"
                  : "border-[#35516f] text-white hover:border-[#70d5ff] hover:text-[#70d5ff]"
              }`}
            >
              Next
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  );
}
