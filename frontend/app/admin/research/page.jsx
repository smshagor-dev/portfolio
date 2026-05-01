"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl, buildPublicAssetUrl } from "@/lib/public-backend-url";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});

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
    isFeatured: true,
    status: "published",
  };
}

function normalizeDateInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

export default function AdminResearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [publications, setPublications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPublication());
  const [selectedThumbnailName, setSelectedThumbnailName] = useState("");
  const thumbnailInputRef = useRef(null);

  async function adminRequest(pathname, init = {}) {
    const response = await fetch(buildPublicApiUrl(pathname), {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  }

  const loadPublications = useCallback(async (authToken = token) => {
    try {
      setIsLoading(true);
      const response = await fetch(buildPublicApiUrl("/api/admin/research-publications"), {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("portfolio_admin_token");
        localStorage.removeItem("portfolio_admin_user");
        router.replace("/login/admin");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load research publications.");
      }

      setPublications(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load research publications.");
    } finally {
      setIsLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");

    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);
    loadPublications(savedToken);
  }, [loadPublications, router]);

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
      await loadPublications();
      closeEditor();
    } catch (error) {
      toast.error(error.message || "Failed to save research publication.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this research publication?");
    if (!confirmed) {
      return;
    }

    try {
      const result = await adminRequest(`/api/admin/research-publications/${id}`, {
        method: "DELETE",
      });
      toast.success(result.message || "Research publication deleted.");
      await loadPublications();
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setForm((current) => ({
        ...current,
        thumbnailImage: data.path || "",
      }));
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
      description="Research publications can be created, edited, featured, and archived from this fixed-sidebar workspace."
    >
      <div className="min-w-0 lg:h-[calc(100vh-2rem)] lg:overflow-hidden">
      <div className="rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#10192c,#09111d)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#79d4ff]">Admin Research</p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Manage Research Publications
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#b8c7d8]">
              Create, edit, delete, feature, and update publication statuses without touching the rest of the admin dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
            >
              Add New Publication
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-[1.75rem] border border-[#24344d] bg-[#0d1728] p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Publications</h2>
            <p className="mt-2 text-sm text-[#9fb1c7]">
              All Publications ({publications.length})
            </p>
          </div>
          <p className="text-sm text-[#8ea7c2]">
            Review every saved research item from one full-width list.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-[1.5rem] border border-[#24344d] bg-[#111d31]" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
            No research publications saved yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {publications.map((publication) => (
              <article
                key={publication.id}
                className="rounded-[1.5rem] border border-[#24344d] bg-[#111d31] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    {publication.thumbnailImage ? (
                      <div className="relative hidden h-24 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#24344d] bg-[#0b1422] sm:block">
                        <Image
                          src={buildPublicAssetUrl(publication.thumbnailImage)}
                          alt={publication.title || "Research publication thumbnail"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#35516f] bg-[#102236] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#a5e3ff]">
                          {publication.publicationType}
                        </span>
                        <span className="rounded-full border border-[#35516f] bg-[#0e1829] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#d3d8e8]">
                          {publication.status}
                        </span>
                        {publication.isFeatured ? (
                          <span className="rounded-full border border-[#2d6b55] bg-[#10281f] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#89f0c0]">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-white">{publication.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#b8c7d8]">{publication.shortSummary}</p>
                      <p className="mt-3 text-sm text-[#8fa4bb]">
                        {publication.researchArea} | {publication.publisherName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(publication)}
                      className="inline-flex items-center justify-center rounded-full border border-[#35516f] px-4 py-2 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(publication.id)}
                      className="inline-flex items-center justify-center rounded-full border border-[#6d3645] px-4 py-2 text-sm font-medium text-[#ffb9c5] transition hover:border-[#ff7b97] hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative z-[121] max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
            <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Research Form</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {editingId ? "Edit Publication" : "Add New Publication"}
                </h2>
                <p className="mt-2 text-sm text-[#97a9be]">
                  Add publication details, content, links, status, and thumbnail from one focused popup.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  form="research-publication-form"
                  disabled={isSaving}
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : editingId ? "Update Publication" : "Add New Publication"}
                </button>
              </div>
            </div>

            <form
              id="research-publication-form"
              className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_320px]"
              onSubmit={handleSubmit}
            >
              <div className="space-y-5">
                <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">Publication information</h3>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {[
                      ["title", "Title"],
                      ["slug", "Slug"],
                      ["publicationType", "Publication Type"],
                      ["researchArea", "Research Area"],
                      ["publisherName", "Publisher Name"],
                      ["publishedDate", "Published Date"],
                      ["publicationUrl", "Publication URL"],
                      ["citationUrl", "Citation URL"],
                      ["doi", "DOI"],
                      ["myAuthorRole", "My Author Role"],
                    ].map(([key, label]) => (
                      <div key={key} className={key === "publicationUrl" || key === "citationUrl" ? "lg:col-span-2" : ""}>
                        <label className="mb-2 block text-sm text-[#d3d8e8]">{label}</label>
                        <input
                          type={key === "publishedDate" ? "date" : "text"}
                          value={form[key]}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setForm((current) => {
                              if (key === "title") {
                                return {
                                  ...current,
                                  title: nextValue,
                                  slug: slugify(nextValue),
                                };
                              }

                              return {
                                ...current,
                                [key]: key === "slug" ? slugify(nextValue) : nextValue,
                              };
                            });
                          }}
                          readOnly={key === "slug"}
                          className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
                        />
                      </div>
                    ))}

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm text-[#d3d8e8]">Short Summary</label>
                      <textarea
                        rows={4}
                        value={form.shortSummary}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            shortSummary: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <RichTextEditor
                        id="research-content"
                        label="Content"
                        value={form.content}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            content: value,
                          }))
                        }
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm text-[#d3d8e8]">Authors</label>
                      <textarea
                        rows={3}
                        value={form.authors}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            authors: event.target.value,
                          }))
                        }
                        placeholder="Comma separated author names"
                        className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Visibility</p>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-[#d3d8e8]">Status</label>
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white outline-none transition focus:border-[#79d4ff]"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="under_review">Under Review</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3 rounded-2xl border border-[#304561] bg-[#0b1422] px-4 py-3 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            isFeatured: event.target.checked,
                          }))
                        }
                      />
                      Featured Publication
                    </label>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Thumbnail</p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={uploadThumbnail}
                    className="hidden"
                  />
                  <div className="mt-4 rounded-[1.5rem] border border-[#24344d] bg-[#101b2d] p-4">
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8fdcff]">Research Cover</p>
                        <p className="mt-2 truncate text-sm text-[#b8c7d8]">
                          {selectedThumbnailName || form.thumbnailImage || "No image selected yet"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="inline-flex items-center justify-center rounded-full border border-[#36557e] px-4 py-3 text-sm font-medium text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                      >
                        Choose Image
                      </button>
                    </div>
                  </div>

                  {form.thumbnailImage ? (
                    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[#101b2d] p-3">
                      <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8fdcff]">Thumbnail Preview</p>
                      <div className="relative h-52 overflow-hidden rounded-xl border border-[#24344d] bg-[#0b1422]">
                        <Image
                          src={buildPublicAssetUrl(form.thumbnailImage)}
                          alt={form.title || "Research thumbnail preview"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      </div>
    </AdminFixedSidebarShell>
  );
}
