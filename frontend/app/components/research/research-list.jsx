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

  return (
    <>
      <ResearchFilterBar filters={filters} options={options} />

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {publications.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-[1.75rem] border border-dashed border-[#263753] bg-[#0e1829] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">No research publications found</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#b8c7d8]">
              Try adjusting the search or filters to explore a different slice of the research catalog.
            </p>
          </div>
        ) : (
          publications.map((publication) => (
            <ResearchCard key={publication.id} publication={publication} />
          ))
        )}
      </section>

      {pagination.totalPages > 1 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#22324a] bg-[#0d1728] px-5 py-4">
          <p className="text-sm text-[#9fb1c7]">
            Page {pagination.page} of {pagination.totalPages} with {pagination.total} publication{pagination.total === 1 ? "" : "s"}.
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
        </div>
      ) : null}
    </>
  );
}
