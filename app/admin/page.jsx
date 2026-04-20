"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  getSocialIconOption,
  searchSocialIcons,
} from "@/utils/social-icons";
import { getStatsIconOption, statsIconOptions } from "@/utils/stats-icons";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function emptyHeroSkill() {
  return { name: "", image: "" };
}

function emptySocialLink() {
  return { icon: "facebook", label: "", image: "", link: "" };
}

function emptyCounterItem() {
  return { label: "", highlight: "", count: "", icon: "projects" };
}

function normalizeHeroSkills(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const name = item.trim();
          return name ? { name, image: "" } : null;
        }

        const name = item?.name?.trim?.() || "";
        const image = item?.image?.trim?.() || "";
        return name || image ? { name, image } : null;
      })
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return (value.items || [])
      .map((item) => {
        const name = item?.name?.trim?.() || "";
        const image = item?.image?.trim?.() || "";
        return name || image ? { name, image } : null;
      })
      .filter(Boolean);
  }

  return [];
}

function buildHeroPayload(sourceForm) {
  return {
    profile: {
      name: sourceForm.name,
      profile: sourceForm.profile,
      designation: sourceForm.designation,
      description: sourceForm.description,
      resume: sourceForm.resume,
      heroSkills: {
        title: sourceForm.heroSkillsTitle,
        items: sourceForm.heroSkills
          .map((item) => ({
            name: item.name.trim(),
            image: item.image.trim(),
          }))
          .filter((item) => item.name),
      },
    },
  };
}

function buildSocialPayload(sourceForm) {
  return {
    profile: {
      socialLinks: sourceForm.socialLinks
        .map((item) => ({
          icon: item.icon,
          label: item.label.trim(),
          image: "",
          link: item.link.trim(),
        }))
        .filter((item) => item.link && item.icon),
    },
  };
}

function buildCounterPayload(sourceForm) {
  return {
    statsCounters: sourceForm.statsCounters
      .map((item) => ({
        label: item.label.trim(),
        highlight: item.highlight.trim(),
        count: item.count.trim(),
        icon: item.icon,
      }))
      .filter((item) => item.label && item.count),
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "counter", label: "Stats Counter" },
    { id: "social", label: "Social Link" },
    { id: "messages", label: "Messages" },
  ];

  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("hero");
  const [socialSearch, setSocialSearch] = useState({});
  const [form, setForm] = useState({
    name: "",
    profile: "",
    designation: "",
    description: "",
    resume: "",
    statsCounters: [emptyCounterItem()],
    socialLinks: [emptySocialLink()],
    heroSkillsTitle: "",
    heroSkills: [emptyHeroSkill()],
  });

  const loadDashboard = useCallback(async (authToken) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard.");
      }

      const heroSkills = normalizeHeroSkills(data.profile?.heroSkills);

      setMessages(data.messages || []);
      setForm({
        name: data.profile?.name || "",
        profile: data.profile?.profile || "",
        designation: data.profile?.designation || "",
        description: data.profile?.description || "",
        resume: data.profile?.resume || "",
        statsCounters:
          Array.isArray(data.statsCounters) && data.statsCounters.length
            ? data.statsCounters.map((item) => ({
                label: item?.label || "",
                highlight: item?.highlight || "",
                count: item?.count || "",
                icon: item?.icon || "projects",
              }))
            : [emptyCounterItem()],
        socialLinks:
          Array.isArray(data.profile?.socialLinks) && data.profile.socialLinks.length
            ? data.profile.socialLinks.map((item) => ({
                icon: item?.icon || "facebook",
                label: item?.label || "",
                image: "",
                link: item?.link || "",
              }))
            : [emptySocialLink()],
        heroSkillsTitle:
          (data.profile?.heroSkills &&
            typeof data.profile.heroSkills === "object" &&
            !Array.isArray(data.profile.heroSkills) &&
            data.profile.heroSkills?.title) ||
          "",
        heroSkills: heroSkills.length ? heroSkills : [emptyHeroSkill()],
      });
    } catch (error) {
      toast.error(error.message || "Failed to load dashboard.");
      localStorage.removeItem("portfolio_admin_token");
      localStorage.removeItem("portfolio_admin_user");
      router.replace("/login/admin");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    const savedAdmin = localStorage.getItem("portfolio_admin_user");

    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);

    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }

    loadDashboard(savedToken);
  }, [loadDashboard, router]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateHeroSkill(index, key, value) {
    setForm((current) => ({
      ...current,
      heroSkills: current.heroSkills.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateSocialLink(index, key, value) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateCounterItem(index, key, value) {
    setForm((current) => ({
      ...current,
      statsCounters: current.statsCounters.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function addSocialLink() {
    setForm((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, emptySocialLink()],
    }));
  }

  function removeSocialLink(index) {
    setSocialSearch((current) => {
      const next = { ...current };
      delete next[index];
      return next;
    });
    setForm((current) => {
      const nextLinks = current.socialLinks.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        socialLinks: nextLinks.length ? nextLinks : [emptySocialLink()],
      };
    });
  }

  function addCounterItem() {
    setForm((current) => ({
      ...current,
      statsCounters: [...current.statsCounters, emptyCounterItem()],
    }));
  }

  function removeCounterItem(index) {
    setForm((current) => {
      const nextCounters = current.statsCounters.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        statsCounters: nextCounters.length ? nextCounters : [emptyCounterItem()],
      };
    });
  }

  function addHeroSkill() {
    setForm((current) => ({
      ...current,
      heroSkills: [...current.heroSkills, emptyHeroSkill()],
    }));
  }

  function removeHeroSkill(index) {
    setForm((current) => {
      const nextSkills = current.heroSkills.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        heroSkills: nextSkills.length ? nextSkills : [emptyHeroSkill()],
      };
    });
  }

  async function persistContent(payload, successMessage) {
    try {
      setIsSaving(true);
      const response = await fetch(`${backendUrl}/api/admin/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save changes.");
      }

      setMessages(data.data?.messages || []);
      if (successMessage) {
        toast.success(successMessage);
      }
      await loadDashboard(token);
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to save changes.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildHeroPayload(form), "Hero section updated.");
    } catch {}
  }

  async function handleSocialSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildSocialPayload(form), "Social links updated.");
    } catch {}
  }

  async function handleCounterSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildCounterPayload(form), "Counter section updated.");
    } catch {}
  }

  async function handleImageUpload(event, options = {}) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${backendUrl}/api/admin/upload-image`, {
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

      let nextForm = form;
      if (options.type === "skill") {
        nextForm = {
          ...form,
          heroSkills: form.heroSkills.map((item, itemIndex) =>
            itemIndex === options.index ? { ...item, image: data.path } : item
          ),
        };
      } else {
        nextForm = {
          ...form,
          profile: data.path,
        };
      }

      setForm(nextForm);

      await persistContent(buildHeroPayload(nextForm), "Image uploaded and saved.");
    } catch {
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleResumeUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingResume(true);
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${backendUrl}/api/admin/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "PDF upload failed.");
      }

      const nextForm = {
        ...form,
        resume: data.path,
      };

      setForm(nextForm);
      await persistContent(buildHeroPayload(nextForm), "CV uploaded and saved.");
    } catch {
    } finally {
      setIsUploadingResume(false);
      event.target.value = "";
    }
  }

  function logout() {
    localStorage.removeItem("portfolio_admin_token");
    localStorage.removeItem("portfolio_admin_user");
    router.push("/login/admin");
  }

  if (isLoading) {
    return <div className="py-20 text-center text-white">Loading admin dashboard...</div>;
  }

  return (
    <div className="py-10 text-white">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#16f2b3]">Admin Dashboard</p>
          <h1 className="text-3xl font-bold">Hero Content Control</h1>
          <p className="mt-2 text-sm text-[#d3d8e8]">
            Logged in as {admin?.email || "support@smshagor.com"}
          </p>
        </div>
        <button
          className="rounded-lg border border-[#3a4160] px-4 py-2 text-sm font-medium transition hover:border-[#16f2b3] hover:text-[#16f2b3]"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-4 lg:sticky lg:top-6">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#16f2b3]">
            Content Sections
          </p>
          <div className="space-y-2">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-[#16f2b3] bg-[#0b1120] text-white"
                      : "border-[#353a52] bg-transparent text-[#d3d8e8] hover:border-[#16f2b3] hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-xs text-[#8b98a5]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          {activeTab === "hero" && (
            <form className="space-y-6" onSubmit={handleSave}>
              <section className="rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Hero Section</h2>

                <div className="mb-6 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-start">
                  <div className="overflow-hidden rounded-2xl border border-[#353a52] bg-[#0b1120]">
                    <Image
                      src={form.profile || "/profile.png"}
                      alt="Profile preview"
                      width={180}
                      height={180}
                      className="h-[180px] w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="rounded-2xl border border-dashed border-[#3d4566] bg-[#0b1120] p-4">
                    <label className="mb-3 block text-sm text-[#d3d8e8]">
                      Upload profile photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event)}
                      disabled={isUploadingImage}
                      className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#7658ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#8a63ff]"
                    />
                    <p className="mt-3 text-xs text-[#8b98a5]">
                      {isUploadingImage
                        ? "Uploading image..."
                        : "Upload hero profile image and save when ready."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["name", "Name"],
                    ["designation", "Designation"],
                    ["resume", "CV PDF Path"],
                    ["heroSkillsTitle", "Skills Section Text"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm text-[#d3d8e8]">{label}</label>
                      <input
                        className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                        value={form[key]}
                        onChange={(event) => updateField(key, event.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-[#3d4566] bg-[#0b1120] p-4">
                  <label className="mb-3 block text-sm text-[#d3d8e8]">Upload CV PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    disabled={isUploadingResume}
                    className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#16f2b3] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#04111f] hover:file:bg-[#44f6c4]"
                  />
                  <p className="mt-3 text-xs text-[#8b98a5]">
                    {isUploadingResume
                      ? "Uploading CV..."
                      : "Only PDF file allowed. Uploaded file path will be added automatically."}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm text-[#d3d8e8]">Description</label>
                  <textarea
                    className="min-h-[140px] w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Hero Skills</h3>
                    <button
                      type="button"
                      onClick={addHeroSkill}
                      className="rounded-lg border border-[#16f2b3] px-4 py-2 text-sm text-[#16f2b3] transition hover:bg-[#16f2b3] hover:text-[#04111f]"
                    >
                      Add Skill
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.heroSkills.map((skill, index) => (
                      <div
                        key={`hero-skill-${index}`}
                        className="rounded-2xl border border-[#353a52] bg-[#0b1120] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-medium text-[#d3d8e8]">
                            Skill {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeHeroSkill(index)}
                            className="text-sm text-[#ff8c8c] transition hover:text-[#ffb3b3]"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[88px_1fr]">
                          <div className="overflow-hidden rounded-xl border border-[#353a52] bg-white">
                            <Image
                              src={skill.image || "/profile.png"}
                              alt={skill.name || `Skill ${index + 1}`}
                              width={88}
                              height={88}
                              className="h-[88px] w-full object-contain p-2"
                              unoptimized
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm text-[#d3d8e8]">Skill Name</label>
                            <input
                              className="w-full rounded-lg border border-[#353a52] bg-[#11172b] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                              value={skill.name}
                              onChange={(event) =>
                                updateHeroSkill(index, "name", event.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm text-[#d3d8e8]">
                            Upload skill image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleImageUpload(event, { type: "skill", index })
                            }
                            disabled={isUploadingImage}
                            className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#7658ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#8a63ff]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Hero Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "social" && (
            <form className="space-y-6" onSubmit={handleSocialSave}>
              <section className="rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Social Links</h2>

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Header Social Items</h3>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="rounded-lg border border-[#16f2b3] px-4 py-2 text-sm text-[#16f2b3] transition hover:bg-[#16f2b3] hover:text-[#04111f]"
                  >
                    Add New
                  </button>
                </div>

                <div className="space-y-4">
                  {form.socialLinks.map((item, index) => (
                    <div
                      key={`social-link-${index}`}
                      className="rounded-2xl border border-[#353a52] bg-[#0b1120] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">
                          Social Link {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="text-sm text-[#ff8c8c] transition hover:text-[#ffb3b3]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Select Icon</label>
                          <div className="rounded-lg border border-[#353a52] bg-[#0b1120] p-3">
                            <input
                              className="mb-3 w-full rounded-lg border border-[#353a52] bg-[#11172b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#16f2b3]"
                              placeholder="Search icon like github, instagram, website..."
                              value={socialSearch[index] || ""}
                              onChange={(event) =>
                                setSocialSearch((current) => ({
                                  ...current,
                                  [index]: event.target.value,
                                }))
                              }
                            />

                            <div className="grid max-h-[15rem] grid-cols-3 gap-2 overflow-y-auto pr-1">
                            {searchSocialIcons(socialSearch[index]).map((option) => {
                              const Icon = option.icon;
                              const isActive = item.icon === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => updateSocialLink(index, "icon", option.value)}
                                  className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-xs transition ${
                                    isActive
                                      ? "border-[#16f2b3] bg-[#11172b] text-white"
                                      : "border-[#353a52] bg-[#11172b] text-[#d3d8e8] hover:border-[#16f2b3]"
                                  }`}
                                >
                                  <Icon size={18} />
                                  <span className="mt-2 text-center leading-4">{option.label}</span>
                                </button>
                              );
                            })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Platform Name</label>
                          <input
                            className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                            placeholder={getSocialIconOption(item.icon)?.label || "Platform name"}
                            value={item.label}
                            onChange={(event) =>
                              updateSocialLink(index, "label", event.target.value)
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Link</label>
                          <input
                            className="w-full rounded-lg border border-[#353a52] bg-[#0b1120] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                            placeholder="https://..."
                            value={item.link}
                            onChange={(event) =>
                              updateSocialLink(index, "link", event.target.value)
                            }
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Social Links"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "counter" && (
            <form className="space-y-6" onSubmit={handleCounterSave}>
              <section className="rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Stats Counter</h2>
                    <p className="mt-2 text-sm text-[#8b98a5]">
                      Hero section-এর নিচে এই counter cards show হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCounterItem}
                    className="rounded-lg border border-[#16f2b3] px-4 py-2 text-sm text-[#16f2b3] transition hover:bg-[#16f2b3] hover:text-[#04111f]"
                  >
                    Add New
                  </button>
                </div>

                <div className="space-y-4">
                  {form.statsCounters.map((item, index) => (
                    <div
                      key={`counter-item-${index}`}
                      className="rounded-2xl border border-[#353a52] bg-[#0b1120] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">
                          Counter Item {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeCounterItem(index)}
                          className="text-sm text-[#ff8c8c] transition hover:text-[#ffb3b3]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Label</label>
                          <input
                            className="w-full rounded-lg border border-[#353a52] bg-[#11172b] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                            value={item.label}
                            onChange={(event) =>
                              updateCounterItem(index, "label", event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Highlight</label>
                          <input
                            className="w-full rounded-lg border border-[#353a52] bg-[#11172b] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                            value={item.highlight}
                            onChange={(event) =>
                              updateCounterItem(index, "highlight", event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Count</label>
                          <input
                            className="w-full rounded-lg border border-[#353a52] bg-[#11172b] px-4 py-3 text-white outline-none transition focus:border-[#16f2b3]"
                            value={item.count}
                            onChange={(event) =>
                              updateCounterItem(index, "count", event.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-[#d3d8e8]">Icon</label>
                          <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#353a52] bg-[#11172b] p-3">
                            {statsIconOptions.map((option) => {
                              const Icon = option.icon;
                              const isActive = item.icon === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => updateCounterItem(index, "icon", option.value)}
                                  className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-xs transition ${
                                    isActive
                                      ? "border-[#16f2b3] bg-[#18203b] text-white"
                                      : "border-[#353a52] bg-[#11172b] text-[#d3d8e8] hover:border-[#16f2b3]"
                                  }`}
                                >
                                  <Icon size={18} />
                                  <span className="mt-2 text-center leading-4">{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-[#273056] bg-[#11172b] p-4">
                        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#8b98a5]">
                          Preview
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#ec4899)] text-white">
                            {(() => {
                              const Icon = getStatsIconOption(item.icon)?.icon;
                              return <Icon size={18} />;
                            })()}
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-[#f0d7a1]">
                              {item.highlight || "Highlight"}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-white">
                              {item.count || "0"}
                            </p>
                            <p className="mt-1 text-sm text-[#c9cfde]">
                              {item.label || "Counter label"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Counter Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "messages" && (
            <section className="rounded-2xl border border-[#2a2e5a] bg-[#10172d] p-6">
              <h2 className="mb-4 text-2xl font-semibold">Recent Contact Messages</h2>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <p className="text-sm text-[#8b98a5]">No messages found yet.</p>
                )}
                {messages.map((message) => (
                  <div
                    className="rounded-xl border border-[#2f3552] bg-[#0b1120] p-4"
                    key={message.id}
                  >
                    <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-white">{message.name}</p>
                      <p className="text-xs text-[#8b98a5]">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mb-2 text-sm text-[#16f2b3]">{message.email}</p>
                    <p className="text-sm text-[#d3d8e8]">{message.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
