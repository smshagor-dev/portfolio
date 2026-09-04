"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl, buildPublicAssetUrl } from "@/lib/public-backend-url";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});

const inputClass = "w-full rounded-2xl border border-[#2d425d] bg-[#0a1423] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#60758b] focus:border-[#72d5ff] focus:ring-2 focus:ring-[#72d5ff]/10";
const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8ca5bd]";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyPublication() {
  return {
    title: "",
    slug: "",
    shortSummary: "",
    content: "",
    publicationType: "",
    researchArea: "",
    publisherName: "",
    publishedDate: "",
    doi: "",
    publicationUrl: "",
    citationUrl: "",
    authors: "",
    myAuthorRole: "",
    thumbnailImage: "",
    isFeatured: false,
    status: "published",
  };
}

function normalizeDateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClasses(status) {
  if (status === "published") {
    return "border-[#2f6955] bg-[#0c251c] text-[#8eebbc]";
  }
  if (status === "archived") {
    return "border-[#4b4f61] bg-[#171923] text-[#b9bfcc]";
  }
  if (status === "under_review") {
    return "border-[#705d32] bg-[#261f0d] text-[#f3d387]";
  }
  return "border-[#425b79] bg-[#101d30] text-[#a8c9e8]";
}

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-[1.4rem] border border-[#263b56] bg-[linear-gradient(180deg,#0f1c30,#0a1423)] p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8ca6be]">{label}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[#6f879e]">{detail}</p> : null}
    </div>
  );
}

export default function AdminResearchPage() {
  const router = useRouter();
  const thumbnailInputRef = useRef(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [publications, setPublications] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPublication());
  const [selectedThumbnailName, setSelectedThumbnailName] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const adminRequest = useCallback(async (pathname, init = {}, authToken = token) => {
    const response = await fetch(buildPublicApiUrl(pathname), {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...(init.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem("portfolio_admin_token");
      localStorage.removeItem("portfolio_admin_user");
      router.replace("/login/admin");
      throw new Error("Admin session expired.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }, [router, token]);

  const loadWorkspace = useCallback(async (authToken = token) => {
    try {
      setIsLoading(true);
      const [publicationResponse, syncResponse] = await Promise.all([
        adminRequest("/api/admin/research-publications", {}, authToken),
        adminRequest("/api/admin/research-publications/sync-status", {}, authToken).catch(() => null),
      ]);

      setPublications(Array.isArray(publicationResponse?.data) ? publicationResponse.data : []);
      setSyncStatus(syncResponse?.data || null);
    } catch (error) {
      toast.error(error.message || "Failed to load research workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [adminRequest, token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);
    loadWorkspace(savedToken);
  }, [loadWorkspace, router]);

  const publicationTypes = Array.from(new Set(publications.map((item) => item.publicationType).filter(Boolean))).sort();
  const filteredPublications = publications.filter((publication) => {
    const haystack = `${publication.title || ""} ${publication.shortSummary || ""} ${publication.researchArea || ""} ${publication.publisherName || ""} ${publication.doi || ""}`.toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesStatus = !statusFilter || publication.status === statusFilter;
    const matchesType = !typeFilter || publication.publicationType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const publishedCount = publications.filter((item) => item.status === "published").length;
  const featuredCount = publications.filter((item) => item.isFeatured).length;
  const draftCount = publications.filter((item) => item.status === "draft" || item.status === "under_review").length;

  function startCreate() {
    setEditingId(null);
    setForm(emptyPublication());
    setSelectedThumbnailName("");
    setIsEditorOpen(true);
  }

  function startEdit(publication) {
    setEditingId(publication.id);
    setForm({
      title: publication.title || "",
      slug: publication.slug || slugify(publication.title || ""),
      shortSummary: publication.shortSummary || "",
      content: publication.content || "",
      publicationType: publication.publicationType || "",
      researchArea: publication.researchArea || "",
      publisherName: publication.publisherName || "",
      publishedDate: normalizeDateInput(publication.publishedDate),
      doi: publication.doi || "",
      publicationUrl: publication.publicationUrl || "",
      citationUrl: publication.citationUrl || "",
      authors: Array.isArray(publication.authors) ? publication.authors.join(", ") : "",
      myAuthorRole: publication.myAuthorRole || "",
      thumbnailImage: publication.thumbnailImage || "",
      isFeatured: Boolean(publication.isFeatured),
      status: publication.status || "published",
    });
    setSelectedThumbnailName("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingId(null);
    setForm(emptyPublication());
    setSelectedThumbnailName("");
  }

  async function handleSync() {
    try {
      setIsSyncing(true);
      const result = await adminRequest("/api/admin/research-publications/sync", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setSyncStatus(result?.sync || syncStatus);
      toast.success(result.message || "Research publications synchronized.");
      await loadWorkspace();
    } catch (error) {
      toast.error(error.message || "Research synchronization failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      const payload = {
        ...form,
        slug: slugify(form.slug || form.title),
        authors: form.authors,
      };
      const endpoint = editingId
        ? `/api/admin/research-publications/${editingId}`
        : "/api/admin/research-publications";
      const method = editingId ? "PUT" : "POST";
      const result = await adminRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(result.message || "Research publication saved.");
      await loadWorkspace();
      closeEditor();
    } catch (error) {
      toast.error(error.message || "Failed to save research publication.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this research publication? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await adminRequest(`/api/admin/research-publications/${id}`, {
        method: "DELETE",
      });
      toast.success(result.message || "Research publication deleted.");
      await loadWorkspace();
      if (editingId === id) {
        closeEditor();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete research publication.");
    }
  }

  async function uploadThumbnail(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedThumbnailName(file.name || "");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(buildPublicApiUrl("/api/admin/upload-image"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setForm((current) => ({ ...current, thumbnailImage: data.path || "" }));
      toast.success("Thumbnail uploaded successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <AdminFixedSidebarShell
      title="Portfolio Admin"
      description="Research metadata, auto-sync, manual overrides, and publication management."
    >
      <div className="min-w-0 space-y-6 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#243a55] bg-[radial-gradient(circle_at_90%_10%,rgba(112,213,255,0.14),transparent_25%),linear-gradient(155deg,#101d31,#091321_62%,#07101c)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#35516f] bg-[#0b1728]/80 px-3 py-2">
                <span className={`h-2 w-2 rounded-full ${syncStatus?.enabled !== false ? "bg-[#7cf0b7] shadow-[0_0_14px_rgba(124,240,183,0.8)]" : "bg-[#708095]"}`} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9cce6]">Research Sync Workspace</span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-white md:text-4xl">Manage synced research publications</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#aebed0]">
                ORCID, Crossref, OpenAlex, and publisher metadata continue to sync automatically. Any publication you edit manually is protected from later auto-sync overwrites.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing || syncStatus?.running}
                className="inline-flex items-center gap-2 rounded-full border border-[#3b6388] bg-[#10243a] px-5 py-3 text-sm font-semibold text-[#a8e5ff] transition hover:border-[#71d4ff] hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current ${isSyncing ? "animate-spin" : ""}`} strokeWidth="1.8">
                  <path d="M20 6v5h-5M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.2 8A7 7 0 0 1 19 11M5 13a7 7 0 0 0 11.8 3" strokeLinecap="round" />
                </svg>
                {isSyncing ? "Syncing research..." : "Sync now"}
              </button>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#06101c] transition hover:opacity-90"
              >
                <span className="text-lg leading-none">+</span>
                Add publication
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="All records" value={publications.length} detail="Admin-visible publication records" />
          <StatCard label="Published" value={publishedCount} detail="Visible in the public research library" />
          <StatCard label="Featured" value={featuredCount} detail="Highlighted across portfolio surfaces" />
          <StatCard label="Draft / review" value={draftCount} detail="Not yet part of the public catalog" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="rounded-[1.6rem] border border-[#243850] bg-[#0c1727] p-5 md:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#79d4ff]">Synchronization</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Automatic metadata pipeline</h2>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${syncStatus?.due ? "border-[#705d32] bg-[#261f0d] text-[#f2d38b]" : "border-[#2f6955] bg-[#0c251c] text-[#8eebbc]"}`}>
                {syncStatus?.due ? "Sync due" : "Up to date"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#21344d] bg-[#091321] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#718aa2]">Last successful sync</p>
                <p className="mt-2 text-sm font-medium text-white">{formatDateTime(syncStatus?.persistedLastSuccessAt || syncStatus?.lastSuccessAt)}</p>
              </div>
              <div className="rounded-2xl border border-[#21344d] bg-[#091321] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#718aa2]">Next scheduled sync</p>
                <p className="mt-2 text-sm font-medium text-white">{formatDateTime(syncStatus?.nextSyncAt)}</p>
              </div>
              <div className="rounded-2xl border border-[#21344d] bg-[#091321] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#718aa2]">Interval</p>
                <p className="mt-2 text-sm font-medium text-white">Every {syncStatus?.intervalHours || 12} hours</p>
              </div>
              <div className="rounded-2xl border border-[#21344d] bg-[#091321] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#718aa2]">Schema</p>
                <p className="mt-2 truncate text-sm font-medium text-white" title={syncStatus?.syncSchemaVersion || ""}>{syncStatus?.syncSchemaCurrent === false ? "Upgrade pending" : "Current"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[#28415d] bg-[linear-gradient(180deg,#102035,#0b1625)] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7cf0b7]">Manual override protection</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Your edits stay yours.</h2>
            <p className="mt-3 text-sm leading-7 text-[#aabbd0]">
              Editing an existing synced publication marks it as a protected manual record. Future metadata and abstract sync jobs will not overwrite the fields you changed.
            </p>
            <div className="mt-5 rounded-2xl border border-[#2a435f] bg-[#081322] p-4 text-xs leading-6 text-[#839bb2]">
              New ORCID works still import automatically. Existing protected records remain editable through this workspace.
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#243850] bg-[#0c1727] p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#79d4ff]">Publication manager</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Research records</h2>
              <p className="mt-2 text-sm text-[#8fa5ba]">Showing {filteredPublications.length} of {publications.length} records</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[720px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, DOI, area..."
                className={inputClass}
              />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under review</option>
                <option value="archived">Archived</option>
              </select>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={inputClass}>
                <option value="">All types</option>
                {publicationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-[1.4rem] border border-[#21344d] bg-[#101d30]" />)}
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-[#2b405a] bg-[#091321] px-5 py-12 text-center text-sm text-[#8ca1b6]">
              No research records match the current filters.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredPublications.map((publication) => (
                <article key={publication.id} className="overflow-hidden rounded-[1.45rem] border border-[#243850] bg-[#0a1524] transition hover:border-[#355472]">
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start">
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[1.15rem] border border-[#243850] bg-[#0b1422] sm:h-32 lg:w-44">
                      {publication.thumbnailImage ? (
                        <Image src={buildPublicAssetUrl(publication.thumbnailImage)} alt={publication.title || "Research publication thumbnail"} fill className="object-cover" sizes="176px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#66849f]">Research</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#35516f] bg-[#102236] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a5e3ff]">{publication.publicationType}</span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses(publication.status)}`}>{String(publication.status || "").replace(/_/g, " ")}</span>
                        {publication.isFeatured ? <span className="rounded-full border border-[#2d6b55] bg-[#10281f] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89f0c0]">Featured</span> : null}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold leading-7 text-white sm:text-xl">{publication.title}</h3>
                      <p className="mt-2 overflow-hidden text-sm leading-7 text-[#aebed0] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{publication.shortSummary}</p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#7f96ad]">
                        <span>{publication.researchArea}</span>
                        <span>{publication.publisherName}</span>
                        {publication.doi ? <span className="max-w-full truncate">DOI: {publication.doi}</span> : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                      <button type="button" onClick={() => startEdit(publication)} className="rounded-full border border-[#3b5a79] px-4 py-2 text-sm font-semibold text-[#b8e7ff] transition hover:border-[#72d5ff] hover:text-white">Edit</button>
                      <button type="button" onClick={() => handleDelete(publication.id)} className="rounded-full border border-[#6b3847] px-4 py-2 text-sm font-semibold text-[#ffb6c2] transition hover:border-[#ff7f98] hover:text-white">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#020817]/88 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#29425f] bg-[linear-gradient(180deg,#101b2f,#08111e)] shadow-[0_34px_100px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#203049] bg-[#0d1829]/95 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between md:px-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#79d4ff]">{editingId ? "Manual override editor" : "New publication"}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{editingId ? "Edit research publication" : "Create research publication"}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={closeEditor} className="rounded-full border border-[#354b66] px-5 py-2.5 text-sm font-semibold text-[#c1cfde] transition hover:border-[#5b7696]">Cancel</button>
                  <button type="submit" disabled={isSaving} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-2.5 text-sm font-semibold text-[#06101c] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving..." : "Save publication"}</button>
                </div>
              </div>

              <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                  {editingId ? (
                    <div className="rounded-2xl border border-[#2c5a4a] bg-[#0d211a] px-4 py-3 text-sm leading-6 text-[#9edfc0]">
                      Saving this record keeps it protected from future automatic metadata overwrites.
                    </div>
                  ) : null}

                  <div>
                    <label className={labelClass}>Title</label>
                    <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) }))} className={inputClass} placeholder="Publication title" />
                  </div>

                  <div>
                    <label className={labelClass}>Slug</label>
                    <input required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className={inputClass} placeholder="publication-slug" />
                  </div>

                  <div>
                    <label className={labelClass}>Abstract / short summary</label>
                    <textarea required rows={7} value={form.shortSummary} onChange={(event) => setForm((current) => ({ ...current, shortSummary: event.target.value }))} className={`${inputClass} resize-y leading-7`} placeholder="Abstract or concise research summary" />
                  </div>

                  <RichTextEditor
                    id={`research-content-${editingId || "new"}`}
                    label="Full publication content"
                    value={form.content}
                    onChange={(content) => setForm((current) => ({ ...current, content }))}
                    uploadToken={token}
                  />
                </div>

                <aside className="space-y-5">
                  <div className="rounded-[1.4rem] border border-[#263b55] bg-[#0a1524] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#79d4ff]">Publication metadata</p>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className={labelClass}>Publication type</label>
                        <input required value={form.publicationType} onChange={(event) => setForm((current) => ({ ...current, publicationType: event.target.value }))} className={inputClass} placeholder="Preprint, Journal Article..." />
                      </div>
                      <div>
                        <label className={labelClass}>Research area</label>
                        <input required value={form.researchArea} onChange={(event) => setForm((current) => ({ ...current, researchArea: event.target.value }))} className={inputClass} placeholder="Research area" />
                      </div>
                      <div>
                        <label className={labelClass}>Publisher</label>
                        <input required value={form.publisherName} onChange={(event) => setForm((current) => ({ ...current, publisherName: event.target.value }))} className={inputClass} placeholder="Publisher name" />
                      </div>
                      <div>
                        <label className={labelClass}>Published date</label>
                        <input required type="date" value={form.publishedDate} onChange={(event) => setForm((current) => ({ ...current, publishedDate: event.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}>
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="under_review">Under review</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#2d425d] bg-[#0a1423] px-4 py-3">
                        <span>
                          <span className="block text-sm font-medium text-white">Featured publication</span>
                          <span className="mt-1 block text-xs text-[#718aa2]">Highlight this record in featured research surfaces.</span>
                        </span>
                        <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} className="h-5 w-5 accent-[#79d4ff]" />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-[#263b55] bg-[#0a1524] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#79d4ff]">Scholarly links</p>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className={labelClass}>DOI</label>
                        <input value={form.doi} onChange={(event) => setForm((current) => ({ ...current, doi: event.target.value }))} className={inputClass} placeholder="10.xxxx/..." />
                      </div>
                      <div>
                        <label className={labelClass}>Publication URL</label>
                        <input required type="url" value={form.publicationUrl} onChange={(event) => setForm((current) => ({ ...current, publicationUrl: event.target.value }))} className={inputClass} placeholder="https://..." />
                      </div>
                      <div>
                        <label className={labelClass}>Citation URL</label>
                        <input type="url" value={form.citationUrl} onChange={(event) => setForm((current) => ({ ...current, citationUrl: event.target.value }))} className={inputClass} placeholder="https://..." />
                      </div>
                      <div>
                        <label className={labelClass}>Authors</label>
                        <textarea rows={3} value={form.authors} onChange={(event) => setForm((current) => ({ ...current, authors: event.target.value }))} className={`${inputClass} resize-y`} placeholder="Author One, Author Two" />
                      </div>
                      <div>
                        <label className={labelClass}>My author role</label>
                        <input value={form.myAuthorRole} onChange={(event) => setForm((current) => ({ ...current, myAuthorRole: event.target.value }))} className={inputClass} placeholder="First Author" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-[#263b55] bg-[#0a1524] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#79d4ff]">Thumbnail</p>
                    <div className="relative mt-4 h-40 overflow-hidden rounded-2xl border border-[#2b405a] bg-[#081321]">
                      {form.thumbnailImage ? (
                        <Image src={buildPublicAssetUrl(form.thumbnailImage)} alt="Publication thumbnail preview" fill className="object-cover" sizes="300px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#607c97]">No thumbnail</div>
                      )}
                    </div>
                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={uploadThumbnail} className="hidden" />
                    <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="mt-4 w-full rounded-2xl border border-[#365471] px-4 py-3 text-sm font-semibold text-[#b9e7ff] transition hover:border-[#72d5ff] hover:text-white">Upload thumbnail</button>
                    {selectedThumbnailName ? <p className="mt-2 truncate text-xs text-[#718aa2]">{selectedThumbnailName}</p> : null}
                    {form.thumbnailImage ? (
                      <button type="button" onClick={() => setForm((current) => ({ ...current, thumbnailImage: "" }))} className="mt-2 w-full rounded-2xl border border-[#5e3542] px-4 py-2.5 text-xs font-semibold text-[#ffb1bf] transition hover:border-[#ff7e96]">Remove thumbnail</button>
                    ) : null}
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminFixedSidebarShell>
  );
}
