"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildInitialState(filters = {}) {
  return {
    search: filters.search || "",
    publicationType: filters.publicationType || "",
    researchArea: filters.researchArea || "",
  };
}

export default function ResearchFilterBar({ filters, options }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(buildInitialState(filters));

  useEffect(() => {
    setDraft(buildInitialState(filters));
  }, [filters]);

  function navigate(nextDraft) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextDraft).forEach(([key, value]) => {
      const normalized = String(value || "").trim();
      if (!normalized) {
        params.delete(key);
      } else {
        params.set(key, normalized);
      }
    });

    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    });
  }

  function updateSelect(key, value) {
    const nextDraft = { ...draft, [key]: value };
    setDraft(nextDraft);
    navigate(nextDraft);
  }

  function submitSearch(event) {
    event.preventDefault();
    navigate(draft);
  }

  function resetFilters() {
    const nextDraft = buildInitialState();
    setDraft(nextDraft);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const hasActiveFilters = Boolean(
    draft.search || draft.publicationType || draft.researchArea,
  );

  return (
    <section className="mt-8 rounded-[1.75rem] border border-[#22344a] bg-[linear-gradient(180deg,#0f192b,#0a1321)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-6">
      <div className="flex flex-col gap-2 border-b border-[#1f3048] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79d4ff]">Explore the library</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Search by publication metadata</h2>
        </div>
        <p className="text-sm text-[#8fa6bd]">
          Search title, abstract, research area, publisher, or DOI.
        </p>
      </div>

      <form onSubmit={submitSearch} className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(210px,0.6fr)_minmax(240px,0.75fr)_auto] xl:items-end">
        <div>
          <label htmlFor="research-search" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8da9c3]">
            Search
          </label>
          <div className="relative">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#67839d]" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <input
              id="research-search"
              value={draft.search}
              onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search papers, abstracts, DOI..."
              className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#60758b] focus:border-[#79d4ff] focus:ring-2 focus:ring-[#79d4ff]/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="research-type" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8da9c3]">
            Publication Type
          </label>
          <select
            id="research-type"
            value={draft.publicationType}
            onChange={(event) => updateSelect("publicationType", event.target.value)}
            className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
          >
            <option value="">All types</option>
            {(options?.publicationTypes || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="research-area" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8da9c3]">
            Research Area
          </label>
          <select
            id="research-area"
            value={draft.researchArea}
            onChange={(event) => updateSelect("researchArea", event.target.value)}
            className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
          >
            <option value="">All areas</option>
            {(options?.researchAreas || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 text-sm font-semibold text-[#06101c] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Updating..." : "Search"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-6 text-[#7890a8]">
          Public results are limited to published research records from the backend.
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-full border border-[#35516f] px-4 py-2 text-xs font-semibold text-[#cfe0ee] transition hover:border-[#70d5ff] hover:text-white"
          >
            Clear filters
            <span aria-hidden>×</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
