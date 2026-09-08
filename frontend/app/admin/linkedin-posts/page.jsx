"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

const inputClass =
  "w-full rounded-2xl border border-[#2d425d] bg-[#0a1423] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#60758b] focus:border-[#72d5ff] focus:ring-2 focus:ring-[#72d5ff]/10";
const labelClass =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8ca5bd]";

function emptyForm() {
  return {
    title: "",
    embedInput: "",
    sortOrder: 1,
    status: true,
  };
}

function getPreviewEmbedUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const iframeMatch = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = String(iframeMatch?.[1] || raw).replace(/&amp;/gi, "&").trim();

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    if (!["linkedin.com", "www.linkedin.com"].includes(hostname)) {
      return "";
    }

    if (!/^\/embed\/feed\/update\/urn:li:(?:share|activity|ugcpost):\d+\/?$/i.test(url.pathname)) {
      return "";
    }

    url.protocol = "https:";
    url.hostname = "www.linkedin.com";
    return url.toString();
  } catch (_error) {
    return "";
  }
}

export default function AdminLinkedInPostsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const adminRequest = useCallback(
    async (pathname, init = {}, authToken = token) => {
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
    },
    [router, token],
  );

  const loadPosts = useCallback(
    async (authToken = token) => {
      try {
        setIsLoading(true);
        const result = await adminRequest("/api/admin/linkedin-posts", {}, authToken);
        setPosts(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load LinkedIn posts.");
      } finally {
        setIsLoading(false);
      }
    },
    [adminRequest, token],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);
    loadPosts(savedToken);
  }, [loadPosts, router]);

  const previewUrl = useMemo(() => getPreviewEmbedUrl(form.embedInput), [form.embedInput]);
  const activeCount = posts.filter((post) => post.status !== false).length;

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      embedInput: post.embedUrl || "",
      sortOrder: post.sortOrder || 1,
      status: post.status !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!previewUrl) {
      toast.error("Paste a valid LinkedIn embed iframe or embed URL.");
      return;
    }

    try {
      setIsSaving(true);
      const endpoint = editingId
        ? `/api/admin/linkedin-posts/${encodeURIComponent(editingId)}`
        : "/api/admin/linkedin-posts";
      const result = await adminRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          title: form.title,
          embedInput: form.embedInput,
          sortOrder: Number(form.sortOrder) || 1,
          status: Boolean(form.status),
        }),
      });

      toast.success(result.message || "LinkedIn post saved.");
      resetForm();
      await loadPosts();
    } catch (error) {
      toast.error(error.message || "Failed to save LinkedIn post.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(post) {
    if (!window.confirm(`Delete “${post.title || "LinkedIn Post"}”?`)) {
      return;
    }

    try {
      const result = await adminRequest(
        `/api/admin/linkedin-posts/${encodeURIComponent(post.id)}`,
        { method: "DELETE" },
      );
      toast.success(result.message || "LinkedIn post deleted.");
      if (editingId === post.id) {
        resetForm();
      }
      await loadPosts();
    } catch (error) {
      toast.error(error.message || "Failed to delete LinkedIn post.");
    }
  }

  return (
    <AdminFixedSidebarShell
      title="Portfolio Admin"
      description="Manage the LinkedIn posts embedded on the public homepage."
    >
      <div className="min-w-0 space-y-6 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
        <section className="overflow-hidden rounded-[2rem] border border-[#243a55] bg-[radial-gradient(circle_at_90%_10%,rgba(65,140,255,0.16),transparent_26%),linear-gradient(155deg,#101d31,#091321_62%,#07101c)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#35516f] bg-[#0b1728]/80 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#70d5ff] shadow-[0_0_14px_rgba(112,213,255,0.8)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9cce6]">
                  LinkedIn Feed
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
                Homepage LinkedIn posts
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#aebed0]">
                Paste LinkedIn’s embed iframe code or the embed URL. Only verified linkedin.com embed URLs are stored and rendered.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#29415d] bg-[#0b1728] px-5 py-4 text-center">
                <p className="text-2xl font-semibold text-white">{posts.length}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#809ab3]">Saved</p>
              </div>
              <div className="rounded-2xl border border-[#29415d] bg-[#0b1728] px-5 py-4 text-center">
                <p className="text-2xl font-semibold text-[#8ee8bd]">{activeCount}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#809ab3]">Active</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 2xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
          <section className="rounded-[1.7rem] border border-[#243850] bg-[#0c1727] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#79d4ff]">
                  {editingId ? "Edit post" : "Add post"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {editingId ? "Update LinkedIn embed" : "Publish a LinkedIn embed"}
                </h2>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#3b506b] px-4 py-2 text-xs font-semibold text-[#b8c8da] transition hover:border-[#70d5ff] hover:text-white"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className={labelClass} htmlFor="linkedin-title">Display title</label>
                <input
                  id="linkedin-title"
                  className={inputClass}
                  value={form.title}
                  maxLength={140}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Featured LinkedIn Post"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="linkedin-embed">Iframe code or embed URL</label>
                <textarea
                  id="linkedin-embed"
                  className={`${inputClass} min-h-40 resize-y font-mono text-xs leading-6`}
                  value={form.embedInput}
                  onChange={(event) => setForm((current) => ({ ...current, embedInput: event.target.value }))}
                  placeholder={'<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:..." ...></iframe>'}
                  required
                />
                <p className={`mt-2 text-xs ${form.embedInput && !previewUrl ? "text-[#ff9c9c]" : "text-[#6f879e]"}`}>
                  {form.embedInput && !previewUrl
                    ? "This is not a valid LinkedIn embed URL."
                    : "The iframe HTML itself is not stored; the backend extracts and validates only its LinkedIn embed URL."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="linkedin-sort">Sort order</label>
                  <input
                    id="linkedin-sort"
                    type="number"
                    min="1"
                    className={inputClass}
                    value={form.sortOrder}
                    onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  />
                </div>
                <label className="flex min-h-[74px] cursor-pointer items-center gap-3 rounded-2xl border border-[#2d425d] bg-[#0a1423] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked }))}
                    className="h-4 w-4 accent-[#70d5ff]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">Active</span>
                    <span className="mt-1 block text-xs text-[#71889f]">Show on homepage</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving || !previewUrl}
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#06101c] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingId ? "Update LinkedIn Post" : "Add LinkedIn Post"}
              </button>
            </form>

            {previewUrl ? (
              <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-[#2a405c] bg-white">
                <div className="border-b border-[#243850] bg-[#0c1727] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8fdcff]">
                  Live preview
                </div>
                <iframe
                  src={previewUrl}
                  title="LinkedIn embed preview"
                  className="h-[520px] w-full border-0"
                  allowFullScreen
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.7rem] border border-[#243850] bg-[#0c1727] p-5 md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#79d4ff]">Saved posts</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Homepage display order</h2>
              <p className="mt-2 text-sm leading-6 text-[#8096ac]">Active posts are shown after the promotion banner and before Contact.</p>
            </div>

            {isLoading ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#32445b] p-8 text-center text-sm text-[#8fa5bb]">
                Loading LinkedIn posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#32445b] p-8 text-center text-sm text-[#8fa5bb]">
                No posts saved yet.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {posts.map((post) => (
                  <article key={post.id} className="overflow-hidden rounded-[1.5rem] border border-[#263b56] bg-[#091422]">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${post.status !== false ? "border-[#2f6955] bg-[#0c251c] text-[#8eebbc]" : "border-[#4b4f61] bg-[#171923] text-[#b9bfcc]"}`}>
                            {post.status !== false ? "Active" : "Hidden"}
                          </span>
                          <span className="rounded-full border border-[#344760] bg-[#111d31] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#9eb1c5]">
                            Order {post.sortOrder || 1}
                          </span>
                        </div>
                        <h3 className="mt-3 truncate text-base font-semibold text-white">{post.title || "LinkedIn Post"}</h3>
                        <p className="mt-2 break-all text-xs leading-5 text-[#71889f]">{post.embedUrl}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          className="rounded-full border border-[#355577] bg-[#10243a] px-4 py-2 text-xs font-semibold text-[#9edfff] transition hover:border-[#70d5ff] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          className="rounded-full border border-[#66404a] bg-[#27131a] px-4 py-2 text-xs font-semibold text-[#ffadb8] transition hover:border-[#d65a73] hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {post.embedUrl ? (
                      <div className="bg-white">
                        <iframe
                          src={post.embedUrl}
                          title={post.title || "Saved LinkedIn post"}
                          className="h-[480px] w-full border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminFixedSidebarShell>
  );
}
