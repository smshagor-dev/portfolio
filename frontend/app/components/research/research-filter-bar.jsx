"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildInitialState(filters = {}) {
  return {
    search: filters.search || "",
    publicationType: filters.publicationType || "",
    researchArea: filters.researchArea || "",
    status: filters.status || "published",
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

  function applyFilters(nextDraft) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextDraft).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    });
  }

  function updateField(key, value) {
    const nextDraft = {
      ...draft,
      [key]: value,
    };

    setDraft(nextDraft);
    applyFilters(nextDraft);
  }

  function resetFilters() {
    const nextDraft = buildInitialState({
      search: "",
      publicationType: "",
      researchArea: "",
      status: "published",
    });

    setDraft(nextDraft);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <section className="mt-8 rounded-[1.75rem] border border-[#22324a] bg-[linear-gradient(180deg,#0f192b,#0a1321)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-[#79d4ff]">
            Search
          </label>
          <input
            value={draft.search}
            onChange={(event) => updateField("search", event.target.value)}
            placeholder="Search title, summary, research area, publisher"
            className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
          />
        </div>

        <div className="grid flex-[1.15] gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-[#79d4ff]">
              Type
            </label>
            <select
              value={draft.publicationType}
              onChange={(event) => updateField("publicationType", event.target.value)}
              className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
            >
              <option value="">All types</option>
              {(options?.publicationTypes || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-[#79d4ff]">
              Area
            </label>
            <select
              value={draft.researchArea}
              onChange={(event) => updateField("researchArea", event.target.value)}
              className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
            >
              <option value="">All areas</option>
              {(options?.researchAreas || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-[#79d4ff]">
              Status
            </label>
            <select
              value={draft.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
            >
              <option value="published">Published</option>
              {(options?.statuses || [])
                .filter((item) => item !== "published")
                .map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, " ")}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#9fb1c7]">
          {isPending ? "Updating research results..." : "Filters update the research catalog instantly."}
        </p>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-4 py-2 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
}
