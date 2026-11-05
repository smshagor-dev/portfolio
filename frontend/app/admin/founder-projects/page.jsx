"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiCopy, FiEdit2, FiExternalLink, FiImage, FiPlus, FiSave, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { founderProjects as defaults } from "@/lib/founder-projects";
import { defaultFounderSection } from "@/lib/founder-section";
import { buildPublicApiUrl, buildPublicAssetUrl } from "@/lib/public-backend-url";

const input = "w-full rounded-xl border border-[#354a65] bg-[#0a1423] px-4 py-3 text-sm text-white outline-none placeholder:text-[#70849b] focus:border-[#80d5ff]";
const label = "mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#b0c9dc]";
const panel = "rounded-[1.7rem] border border-[#293d56] bg-[linear-gradient(155deg,#101e32,#0a1524)] p-5 sm:p-7";
const stringArrays = {
  role: "Leadership roles", focus: "Technology focus", context: "Story paragraphs",
  responsibilities: "Responsibilities", stack: "Technology stack",
  delivered: "Implemented work", ongoing: "Ongoing priorities",
};
const blocks = {
  principles: ["title","description"],
  journey: ["step","title","status","lead","details","result"],
  decisions: ["title","situation","approach","tradeoff"],
};
const labels = {
  title: "Title", description: "Description", step: "Stage number",
  status: "Status", lead: "Introduction", details: "Implementation details",
  result: "Result", situation: "Constraint", approach: "Approach", tradeoff: "Trade-off",
};
function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-+$/g, "");
}
function blankProject(order) {
  return {
    slug: "", name: "", eyebrow: "", tagline: "", summary: "", website: "", repository: "",
    image: "", imageAlt: "", imageNote: "", imageWidth: 1200, imageHeight: 645,
    status: true, sortOrder: order, role: [], focus: [], overview: "", context: [],
    responsibilities: [], principles: [], journeyIntro: "", journey: [], decisions: [],
    delivered: [], ongoing: [], stack: [], outcome: "",
  };
}
function normalize(value, index = 0) {
  const result = { ...blankProject(index + 1), ...JSON.parse(JSON.stringify(value)) };
  for (const key of Object.keys(stringArrays)) if (!Array.isArray(result[key])) result[key] = [];
  for (const key of Object.keys(blocks)) if (!Array.isArray(result[key])) result[key] = [];
  return result;
}
function TextField({ title, value, onChange, multiline = false, required = false, type = "text" }) {
  return <label className="block min-w-0"><span className={label}>{title}</span>
    {multiline ? <textarea rows={4} className={input} value={value ?? ""} required={required}
      onChange={(event) => onChange(event.target.value)} />
      : <input className={input} type={type} value={value ?? ""} required={required}
        onChange={(event) => onChange(event.target.value)} />}
  </label>;
}
function Lines({ title, value, onChange }) {
  return <label className="block"><span className={label}>{title} (one per line)</span>
    <textarea className={input} rows={4} value={(value || []).join("\n")}
      onChange={(event) => onChange(event.target.value.split("\n").map((v) => v.trim()).filter(Boolean))} />
  </label>;
}
function BlockEditor({ title, entries, fields, onChange }) {
  function patch(index, key, value) {
    onChange(entries.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
  }
  return <div className="rounded-2xl border border-[#314b68] bg-[#0b1a2c] p-4 sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h4 className="text-lg font-semibold">{title} ({entries.length})</h4>
      <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#4e6d88] px-3 py-2 text-sm"
        onClick={() => onChange([...entries, Object.fromEntries(fields.map((key) => [key, key === "details" ? [] : ""]))])}>
        <FiPlus /> Add
      </button>
    </div>
    {!entries.length && <p className="text-sm text-[#8ba3bc]">No entries yet.</p>}
    <div className="space-y-4">
      {entries.map((entry, index) => <div key={index} className="space-y-3 rounded-xl border border-[#30455e] bg-[#13243a] p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#a3deff]">Entry {index + 1}</span>
          <div className="flex gap-2">
            <button type="button" disabled={index === 0} aria-label="Move item up" className="rounded-md border border-white/10 px-2 py-1 disabled:opacity-30"
              onClick={() => { const next = [...entries]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</button>
            <button type="button" disabled={index === entries.length - 1} aria-label="Move item down" className="rounded-md border border-white/10 px-2 py-1 disabled:opacity-30"
              onClick={() => { const next = [...entries]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>↓</button>
            <button type="button" aria-label="Remove item" className="rounded-md border border-red-500/30 px-2 py-1 text-red-300"
              onClick={() => onChange(entries.filter((_, i) => i !== index))}><FiTrash2 /></button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((key) => <div key={key} className={["description","lead","details","result","situation","approach","tradeoff"].includes(key) ? "md:col-span-2" : ""}>
            {key === "details"
              ? <Lines title={labels[key]} value={entry[key]} onChange={(v) => patch(index, key, v)} />
              : <TextField title={labels[key]} value={entry[key]}
                  multiline={["description","lead","result","situation","approach","tradeoff"].includes(key)}
                  onChange={(v) => patch(index, key, v)} />}
          </div>)}
        </div>
      </div>)}
    </div>
  </div>;
}
export default function AdminFounderProjectsPage() {
  const router = useRouter();
  const fileInput = useRef(null);
  const [token, setToken] = useState("");
  const [section, setSection] = useState(defaultFounderSection);
  const [savingSection, setSavingSection] = useState(false);
  const [projects, setProjects] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState(blankProject(1));
  const [editingSlug, setEditingSlug] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(async (pathname, options = {}, auth = token) => {
    const response = await fetch(buildPublicApiUrl(pathname), {
      cache: "no-store", ...options,
      headers: { Authorization: "Bearer " + auth,
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      localStorage.removeItem("portfolio_admin_token");
      localStorage.removeItem("portfolio_admin_user");
      router.replace("/login/admin");
      throw new Error("Session expired. Sign in again.");
    }
    if (!response.ok) {
      const validation = data.errors && typeof data.errors === "object"
        ? Object.values(data.errors).flat().slice(0, 3).join(" ") : "";
      throw new Error(validation || data.message || "Request failed (" + response.status + ").");
    }
    return data;
  }, [router, token]);

  const reload = useCallback(async (auth = token) => {
    setLoading(true); setError("");
    try {
      const response = await request("/api/admin/founder-projects", {}, auth);
      const configured = response.initialized === true;
      setInitialized(configured);
      setProjects((configured ? response.data : defaults).map(normalize));
      setSection({ ...defaultFounderSection, ...(response.section || {}) });
    } catch (exception) {
      setError(exception.message);
      toast.error(exception.message);
    } finally { setLoading(false); }
  }, [request, token]);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_admin_token");
    if (!saved) { router.replace("/login/admin"); return; }
    setToken(saved);
    reload(saved);
  }, [reload, router]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  function openNew() {
    setEditingSlug(null);
    setForm(blankProject(projects.length + 1));
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openEdit(project) {
    setEditingSlug(project.slug);
    setForm(normalize(project));
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function duplicate(project) {
    setEditingSlug(null);
    setForm({ ...normalize(project), name: project.name + " copy", slug: project.slug + "-copy", sortOrder: projects.length + 1 });
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function persist(next, endpoint, method, body) {
    if (!initialized) {
      // First save imports the two existing, complete engineering case studies.
      return request("/api/admin/founder-projects", { method: "PUT", body: JSON.stringify({ projects: next }) });
    }
    return request(endpoint, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  async function save(event) {
    event.preventDefault();
    const project = normalize(form);
    project.slug = slugify(project.slug);
    if (!project.slug || !project.name.trim() || !project.image.trim()) {
      toast.error("Name, slug and product image are required."); return;
    }
    if (projects.some((p) => p.slug === project.slug && p.slug !== editingSlug)) {
      toast.error("That slug already exists."); return;
    }
    const next = editingSlug
      ? projects.map((p) => p.slug === editingSlug ? project : p)
      : [...projects, project];
    setSaving(true);
    try {
      const url = editingSlug ? "/api/admin/founder-projects/" + encodeURIComponent(editingSlug) : "/api/admin/founder-projects";
      await persist(next, url, editingSlug ? "PUT" : "POST", project);
      toast.success(editingSlug ? "Founder project updated." : "Founder project created.");
      setEditorOpen(false); setEditingSlug(null);
      await reload();
      router.refresh();
    } catch (exception) { toast.error(exception.message); }
    finally { setSaving(false); }
  }
  async function remove(project) {
    if (!window.confirm("Delete " + project.name + " and its case study from the website?")) return;
    setSaving(true);
    try {
      await persist(projects.filter((p) => p.slug !== project.slug),
        "/api/admin/founder-projects/" + encodeURIComponent(project.slug), "DELETE");
      if (editingSlug === project.slug) setEditorOpen(false);
      toast.success("Founder project deleted.");
      await reload();
      router.refresh();
    } catch (exception) { toast.error(exception.message); }
    finally { setSaving(false); }
  }
  async function saveSection(event) {
    event.preventDefault();
    setSavingSection(true);
    try {
      await request("/api/admin/founder-section", {
        method: "PUT", body: JSON.stringify(section),
      });
      toast.success("Founded & Engineered section updated.");
      router.refresh();
    } catch (exception) { toast.error(exception.message); }
    finally { setSavingSection(false); }
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Use JPG, PNG, WebP or GIF up to 5 MB."); event.target.value = ""; return;
    }
    const body = new FormData();
    body.append("image", file);
    setUploading(true);
    try {
      const response = await request("/api/admin/upload-image", { method: "POST", body });
      const path = response.path || response.publicUrl;
      if (!path) throw new Error("Upload returned no image path.");
      update("image", path);
      toast.success("Image uploaded. Save the product to publish.");
    } catch (exception) { toast.error(exception.message); }
    finally { setUploading(false); event.target.value = ""; }
  }

  return <AdminFixedSidebarShell title="Portfolio Admin" description="Manage Founded & Engineered products, images and case studies.">
    <div className="min-w-0 space-y-6 pb-10 text-white lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8fdcff]">Founded & engineered</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Founder product management</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a1bad0]">Add and edit the homepage cards and their full development journeys. Upload product images through the existing protected admin upload endpoint.</p>
            {!initialized && !loading && !error && <p className="mt-3 text-sm text-[#9ddcff]">Existing stories will be imported automatically on your first save.</p>}
          </div>
          <button type="button" onClick={openNew} disabled={loading || saving || Boolean(error)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#98d9ff] px-5 py-3 text-sm font-semibold text-[#07172a] disabled:opacity-50"><FiPlus /> Add product</button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl border border-[#324b66] px-4 py-2">{projects.length} total</span>
          <span className="rounded-xl border border-[#324b66] px-4 py-2">{projects.filter((p) => p.status !== false).length} published</span>
        </div>
      </section>
      {loading && <div className={panel}>Loading founder projects…</div>}
      {!loading && !error && <form onSubmit={saveSection} className={panel + " space-y-5"}>
        <div>
          <h3 className="text-lg font-semibold">Section heading & description</h3>
          <p className="mt-2 text-sm text-[#92aac2]">These settings control the introduction and badge above all product cards.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField required title="Eyebrow label" value={section.eyebrow}
            onChange={(v) => setSection((old) => ({ ...old, eyebrow:v }))} />
          <TextField title="Founder badge" value={section.badge}
            onChange={(v) => setSection((old) => ({ ...old, badge:v }))} />
          <div className="md:col-span-2">
            <TextField required title="Section headline" value={section.title}
              onChange={(v) => setSection((old) => ({ ...old, title:v }))} />
          </div>
          <div className="md:col-span-2">
            <TextField required multiline title="Section description" value={section.description}
              onChange={(v) => setSection((old) => ({ ...old, description:v }))} />
          </div>
          <div className="md:col-span-2">
            <TextField title="Footer note" value={section.footer}
              onChange={(v) => setSection((old) => ({ ...old, footer:v }))} />
          </div>
        </div>
        <button type="submit" disabled={savingSection}
          className="inline-flex items-center gap-2 rounded-xl border border-[#5f8caf] px-5 py-3 text-sm text-[#b5e5ff] disabled:opacity-50">
          <FiSave /> {savingSection ? "Saving…" : "Save section settings"}
        </button>
      </form>}

      {error && <div role="alert" className="rounded-xl border border-red-500/50 p-5 text-red-200">
        <p>{error}</p><button type="button" onClick={() => reload()} className="mt-2 underline">Retry</button>
      </div>}
      {editorOpen && !error && <form onSubmit={save} className={panel + " space-y-7"}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{editingSlug ? "Edit founder product" : "Add founder product"}</h3>
          <button type="button" aria-label="Close editor" onClick={() => setEditorOpen(false)} className="p-2"><FiX size={21} /></button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField required title="Product name" value={form.name} onChange={(v) => setForm((current) =>
            ({ ...current, name: v, slug: editingSlug ? current.slug : slugify(v) }))} />
          <TextField required title="URL slug" value={form.slug} onChange={(v) => update("slug",slugify(v))} />
          {["eyebrow","tagline","website","repository"].map((key) => <TextField key={key}
            title={key === "website" ? "Website (HTTPS)" : key === "repository" ? "GitHub / repository (HTTPS)" : key}
            type={["website","repository"].includes(key) ? "url" : "text"}
            value={form[key]} onChange={(v) => update(key,v)} />)}
          <div className="md:col-span-2"><TextField multiline title="Card summary" value={form.summary} onChange={(v) => update("summary",v)} /></div>
        </div>
        <section className="rounded-xl border border-[#34506c] bg-[#0a192b] p-4 sm:p-6">
          <h4 className="text-lg font-semibold">Product image</h4>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="flex aspect-[1.86] items-center justify-center overflow-hidden rounded-xl border border-[#314b67] bg-[#070f1a]">
              {form.image
                ? <img src={buildPublicAssetUrl(form.image)} alt={form.imageAlt || form.name || "Product preview"} className="h-full w-full object-contain" />
                : <FiImage size={40} className="text-[#7494b1]" />}
            </div>
            <div className="space-y-4">
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={upload} />
              <button type="button" disabled={uploading || saving} onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8bd5ff] px-4 py-3 text-sm font-semibold text-[#061629] disabled:opacity-50">
                <FiUpload /> {uploading ? "Uploading…" : "Upload image"}
              </button>
              <TextField required title="Image path or HTTPS URL" value={form.image} onChange={(v) => update("image",v)} />
              <p className="text-xs text-[#90abc3]">JPG, PNG, WebP or GIF, up to 5 MB. Existing images remain intact until changed.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField title="Image alt text" value={form.imageAlt} onChange={(v) => update("imageAlt",v)} />
            <TextField title="Image caption" value={form.imageNote} onChange={(v) => update("imageNote",v)} />
            <TextField title="Image width" type="number" value={form.imageWidth} onChange={(v) => update("imageWidth",Number(v)||1)} />
            <TextField title="Image height" type="number" value={form.imageHeight} onChange={(v) => update("imageHeight",Number(v)||1)} />
          </div>
        </section>
        <section className="space-y-4">
          <h4 className="text-lg font-semibold">Story and responsibilities</h4>
          <TextField multiline title="Product overview" value={form.overview} onChange={(v) => update("overview",v)} />
          <div className="grid gap-4 md:grid-cols-2">
            {["role","focus","context","responsibilities"].map((key) => <Lines key={key} title={stringArrays[key]} value={form[key]} onChange={(v) => update(key,v)} />)}
          </div>
          <BlockEditor title="Guiding principles" entries={form.principles} fields={blocks.principles} onChange={(v) => update("principles",v)} />
        </section>
        <section className="space-y-4">
          <h4 className="text-lg font-semibold">Development journey</h4>
          <TextField multiline title="Journey introduction" value={form.journeyIntro} onChange={(v) => update("journeyIntro",v)} />
          <BlockEditor title="Development stages" entries={form.journey} fields={blocks.journey} onChange={(v) => update("journey",v)} />
          <BlockEditor title="Engineering decisions" entries={form.decisions} fields={blocks.decisions} onChange={(v) => update("decisions",v)} />
        </section>
        <section className="space-y-4">
          <h4 className="text-lg font-semibold">Delivery and next priorities</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {["stack","delivered","ongoing"].map((key) => <Lines key={key} title={stringArrays[key]} value={form[key]} onChange={(v) => update(key,v)} />)}
          </div>
          <TextField multiline title="Product outcome" value={form.outcome} onChange={(v) => update("outcome",v)} />
        </section>
        <div className="flex flex-wrap items-center gap-5 rounded-xl border border-[#314b66] p-4">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.status !== false} onChange={(event) => update("status",event.target.checked)} className="h-5 w-5 accent-[#88d5ff]" />
            Published on website
          </label>
          <label className="flex items-center gap-3 text-sm">Sort order
            <input type="number" min="0" max="10000" value={form.sortOrder} onChange={(event) => update("sortOrder",Number(event.target.value)||0)} className={input + " w-28"} />
          </label>
        </div>
        <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-3 rounded-xl border border-[#36546e] bg-[#0b1c30]/95 p-3 backdrop-blur-xl">
          <button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-[#3e556e] px-5 py-3 text-sm">Cancel</button>
          <button type="submit" disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#99dbff] px-6 py-3 text-sm font-semibold text-[#071729] disabled:opacity-50">
            <FiSave /> {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>}
      {!loading && !error && <section className={panel}>
        <h3 className="mb-5 text-lg font-semibold">Products</h3>
        {!projects.length && <p className="text-sm text-[#9bb1c8]">No projects yet. Add one to publish it.</p>}
        <div className="grid gap-5 xl:grid-cols-2">
          {[...projects].sort((a,b) => a.sortOrder - b.sortOrder).map((project) => <article key={project.slug}
            className="overflow-hidden rounded-2xl border border-[#314862] bg-[#0b1b2c]">
            <div className="flex aspect-[1.86] items-center justify-center bg-[#070e18]">
              {project.image
                ? <img src={buildPublicAssetUrl(project.image)} alt={project.imageAlt || project.name} className="h-full w-full object-contain" />
                : <FiImage size={40} className="text-[#7c9bb6]" />}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={project.status !== false ? "rounded-full bg-emerald-900/40 px-3 py-1 text-emerald-300" : "rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"}>{project.status !== false ? "Published" : "Hidden"}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Order {project.sortOrder}</span>
              </div>
              <h4 className="mt-3 text-lg font-semibold">{project.name}</h4>
              <p className="mt-1 text-sm text-[#b4cadb]">{project.tagline}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#92a9be]">{project.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(project)} className="inline-flex items-center gap-2 rounded-lg border border-[#4f7390] px-3 py-2 text-sm text-[#b5e7ff]"><FiEdit2 /> Edit</button>
                <button type="button" onClick={() => duplicate(project)} className="inline-flex items-center gap-2 rounded-lg border border-[#364e68] px-3 py-2 text-sm"><FiCopy /> Duplicate</button>
                {project.status !== false && <a href={"/founder/" + project.slug} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#364e68] px-3 py-2 text-sm"><FiExternalLink /> View</a>}
                <button type="button" disabled={saving} onClick={() => remove(project)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 disabled:opacity-50"><FiTrash2 /> Delete</button>
              </div>
            </div>
          </article>)}
        </div>
      </section>}
    </div>
  </AdminFixedSidebarShell>;
}
