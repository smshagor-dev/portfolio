"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl, buildPublicAssetUrl } from "@/lib/public-backend-url";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});

const ARTICLE_AI_AUTHOR = "Md Shahanur Islam Shagor";

function adminFetch(input, init = {}) {
  return fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  });
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const pad = (item) => String(item).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getGenerateErrorMessage(message) {
  const normalized = String(message || "").trim();

  if (!normalized) {
    return "Failed to generate article. Please retry.";
  }

  if (normalized === "No active AI provider configured.") {
    return normalized;
  }

  if (normalized.includes("too short")) {
    return "AI response was too short. Please try again.";
  }

  if (normalized.includes("invalid JSON")) {
    return "AI provider returned invalid JSON.";
  }

  return "Failed to generate article. Please retry.";
}

function emptyArticleForm() {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    categoryIds: [],
    tags: "",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    author: "",
    status: "draft",
    publishDate: "",
    commentsEnabled: true,
    isFeatured: false,
  };
}

export default function ArticleEditorPage({ articleId = null }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(articleId));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyArticleForm());
  const [generatorTopic, setGeneratorTopic] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState(null);

  const isEditing = useMemo(() => Boolean(articleId), [articleId]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);

    async function loadCategories() {
      const response = await adminFetch(buildPublicApiUrl("/api/admin/article-categories"), {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load article categories.");
      }

      setCategories(Array.isArray(data.categories) ? data.categories : []);
    }

    async function loadArticle() {
      try {
        setIsLoading(true);
        await loadCategories();

        if (!articleId) {
          return;
        }

        const response = await adminFetch(buildPublicApiUrl(`/api/admin/articles/${articleId}`), {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load article.");
        }

        setForm({
          title: data.article?.title || "",
          slug: slugify(data.article?.title || data.article?.slug || ""),
          shortDescription: data.article?.shortDescription || "",
          content: data.article?.content || "",
          categoryIds: Array.isArray(data.article?.categoryIds) ? data.article.categoryIds : [],
          tags: Array.isArray(data.article?.tags) ? data.article.tags.join(", ") : "",
          featuredImage: data.article?.featuredImage || "",
          metaTitle: data.article?.metaTitle || "",
          metaDescription: data.article?.metaDescription || "",
          author: data.article?.author || "",
          status: data.article?.status || "draft",
          publishDate: formatDateTimeLocal(data.article?.publishDate),
          commentsEnabled:
            typeof data.article?.commentsEnabled === "boolean" ? data.article.commentsEnabled : true,
          isFeatured: Boolean(data.article?.isFeatured),
        });
      } catch (error) {
        toast.error(error.message || "Failed to load article.");
        router.push("/admin/artical");
      } finally {
        setIsLoading(false);
      }
    }

    loadArticle();
  }, [articleId, router]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateGeneratedPreviewField(key, value) {
    setGeneratedPreview((current) => {
      if (!current) {
        return current;
      }

      return { ...current, [key]: value };
    });
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugify(value),
    }));
  }

  function toggleCategory(categoryId) {
    setForm((current) => {
      const exists = current.categoryIds.includes(categoryId);
      return {
        ...current,
        categoryIds: exists
          ? current.categoryIds.filter((item) => item !== categoryId)
          : [...current.categoryIds, categoryId],
      };
    });
  }

  async function handleGenerateArticle() {
    if (!token || !generatorTopic.trim()) {
      toast.error("Topic is required for AI generation.");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await adminFetch(buildPublicApiUrl("/api/admin/articles/generate"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: generatorTopic.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getGenerateErrorMessage(data.message));
      }

      setGeneratedPreview({
        title: data.title || "",
        shortDescription: data.shortDescription || "",
        content: data.content || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: ARTICLE_AI_AUTHOR,
      });
    } catch (error) {
      toast.error(getGenerateErrorMessage(error.message));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleInsertGeneratedIntoForm() {
    if (!generatedPreview) {
      return;
    }

    handleTitleChange(generatedPreview.title || "");
    setForm((current) => ({
      ...current,
      shortDescription: generatedPreview.shortDescription || "",
      content: generatedPreview.content || "",
      metaTitle: generatedPreview.metaTitle || "",
      metaDescription: generatedPreview.metaDescription || "",
      tags: Array.isArray(generatedPreview.tags) ? generatedPreview.tags.join(", ") : "",
      author: ARTICLE_AI_AUTHOR,
    }));
    setGeneratedPreview(null);
    toast.success("Generated content inserted into the form.");
  }

  function handleCancelGeneratedPreview() {
    setGeneratedPreview(null);
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !token) {
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await adminFetch(buildPublicApiUrl("/api/admin/upload-image"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      setForm((current) => ({
        ...current,
        featuredImage: data.path || "",
      }));
      toast.success("Featured image uploaded.");
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !token ||
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.shortDescription.trim() ||
      !form.content.trim() ||
      !form.categoryIds.length ||
      !form.author.trim()
    ) {
      toast.error("Title, slug, short description, content, at least one category, and author are required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        shortDescription: form.shortDescription.trim(),
        content: form.content,
        categoryIds: form.categoryIds,
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        featuredImage: form.featuredImage.trim(),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        author: form.author.trim(),
        status: form.status,
        publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : null,
        commentsEnabled: Boolean(form.commentsEnabled),
        isFeatured: Boolean(form.isFeatured),
      };

      const response = await adminFetch(
        buildPublicApiUrl(`/api/admin/articles${isEditing ? `/${articleId}` : ""}`),
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "create"} article.`);
      }

      toast.success(isEditing ? "Article updated successfully." : "Article created successfully.");
      router.push("/admin/artical");
      router.refresh();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} article.`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
        Loading article editor...
      </div>
    );
  }

  return (
    <AdminFixedSidebarShell
      title="Portfolio Admin"
      description="Article editor pages now keep the left admin navigation fixed while you work through long forms."
    >
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Article Editor</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {isEditing ? "Update Article" : "Add New Article"}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
            Fill in article metadata, write the content, and publish when ready.
          </p>
        </div>
        <Link
          href="/admin/artical"
          className="inline-flex items-center justify-center rounded-full border border-[#36557e] px-5 py-3 text-sm font-semibold text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
        >
          Back To Articles
        </Link>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">AI Generator</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Draft article content from a topic</h2>
              <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                Generate a first draft, review it here, then choose whether to insert it into the form.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Topic</label>
              <input
                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                placeholder="Example: Why clean API design matters in modern web apps"
                value={generatorTopic}
                onChange={(event) => setGeneratorTopic(event.target.value)}
                disabled={isGenerating}
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateArticle}
              disabled={isGenerating}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          {generatedPreview ? (
            <div className="mt-6 rounded-[1.6rem] border border-[#2c3852] bg-[#0d1728] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[#7fdcff]">Preview</p>
                  <p className="mt-1 text-sm text-[#9fb1c7]">
                    Review and edit the generated draft before inserting it into the main article form.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Title</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={generatedPreview.title}
                    onChange={(event) => updateGeneratedPreviewField("title", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Short Description</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={generatedPreview.shortDescription}
                    onChange={(event) => updateGeneratedPreviewField("shortDescription", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Content</label>
                  <textarea
                    className="min-h-[320px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={generatedPreview.content}
                    onChange={(event) => updateGeneratedPreviewField("content", event.target.value)}
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Meta Title</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={generatedPreview.metaTitle}
                      onChange={(event) => updateGeneratedPreviewField("metaTitle", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Author</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#0c1626] px-4 py-3 text-[#9fb1c7] outline-none"
                      value={ARTICLE_AI_AUTHOR}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Meta Description</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={generatedPreview.metaDescription}
                    onChange={(event) => updateGeneratedPreviewField("metaDescription", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Tags</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={generatedPreview.tags.join(", ")}
                    onChange={(event) =>
                      updateGeneratedPreviewField(
                        "tags",
                        event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleInsertGeneratedIntoForm}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
                >
                  Insert into Form
                </button>
                <button
                  type="button"
                  onClick={handleCancelGeneratedPreview}
                  className="inline-flex items-center justify-center rounded-full border border-[#36557e] px-5 py-3 text-sm font-semibold text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Content</p>
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Title</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Slug</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.slug}
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Short Description</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.shortDescription}
                    onChange={(event) => updateField("shortDescription", event.target.value)}
                  />
                </div>
                <RichTextEditor
                  id="article-content"
                  label="Content"
                  value={form.content}
                  onChange={(value) => updateField("content", value)}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">SEO</p>
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Meta Title</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.metaTitle}
                    onChange={(event) => updateField("metaTitle", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Meta Description</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.metaDescription}
                    onChange={(event) => updateField("metaDescription", event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Details</p>
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Categories</label>
                  <div className="rounded-[1.4rem] border border-[#2c3852] bg-[#101b2d] p-4">
                    {form.categoryIds.length ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {categories
                          .filter((category) => form.categoryIds.includes(category.id))
                          .map((category) => (
                            <button
                              key={`selected-${category.id}`}
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-[#4dc4ff]/25 bg-[#16314c] px-3 py-1.5 text-xs font-semibold text-[#9fdcff] transition hover:border-[#70d5ff] hover:text-white"
                            >
                              {category.name}
                              <span className="text-[10px] text-[#d9f6ff]">x</span>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <p className="mb-4 text-sm text-[#8ea7c2]">No category selected yet.</p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {categories.map((category) => {
                        const isSelected = form.categoryIds.includes(category.id);

                        return (
                          <label
                            key={category.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                              isSelected
                                ? "border-[#4dc4ff]/45 bg-[#11263d] text-white"
                                : "border-[#2c3852] bg-[#0d1728] text-[#c7d4e3] hover:border-[#3d5879]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCategory(category.id)}
                              className="h-4 w-4 rounded border-[#36557e] bg-transparent"
                            />
                            <span className="font-medium">{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <Link
                    href="/admin/artical-categories"
                    className="mt-3 inline-flex rounded-full border border-[#36557e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                  >
                    Manage Categories
                  </Link>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Tags</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    placeholder="nextjs, prisma, portfolio"
                    value={form.tags}
                    onChange={(event) => updateField("tags", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Author</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.author}
                    onChange={(event) => updateField("author", event.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Status</label>
                    <select
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.status}
                      onChange={(event) => updateField("status", event.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Publish Date</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.publishDate}
                      onChange={(event) => updateField("publishDate", event.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                  <input
                    type="checkbox"
                    checked={form.commentsEnabled}
                    onChange={(event) => updateField("commentsEnabled", event.target.checked)}
                  />
                  Comments toggle
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => updateField("isFeatured", event.target.checked)}
                  />
                  Featured toggle
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Featured Image</p>
              <div className="mt-6 space-y-4">
                <input
                  className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                  value={form.featuredImage}
                  onChange={(event) => updateField("featuredImage", event.target.value)}
                  placeholder="/uploads/article-cover.png"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#36557e] px-4 py-3 text-sm font-medium text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white">
                  {isUploading ? "Uploading..." : "Upload Featured Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {form.featuredImage ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-[#24344d] bg-[#101b2d] p-3">
                    <Image
                      src={buildPublicAssetUrl(form.featuredImage)}
                      alt="Featured article"
                      width={1200}
                      height={720}
                      className="h-52 w-full rounded-xl object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Article" : "Create Article"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
    </AdminFixedSidebarShell>
  );
}
