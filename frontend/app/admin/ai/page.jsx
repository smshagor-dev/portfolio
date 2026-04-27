"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineSparkles, HiOutlineUsers, HiOutlineViewGrid } from "react-icons/hi";
import { FiBarChart2, FiBookOpen, FiBriefcase, FiCheckCircle, FiCode, FiCpu, FiDollarSign, FiEye, FiEyeOff, FiFolder, FiHelpCircle, FiKey, FiLogOut, FiMail, FiMessageSquare, FiPhone, FiPlus, FiSave, FiSettings, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

const providerLabels = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  gemini: "Google Gemini",
};

const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: FiBarChart2, href: "/admin/dashboard" },
  { id: "hero", label: "Hero", icon: HiOutlineSparkles, href: "/admin/hero" },
  { id: "services", label: "Services", icon: HiOutlineViewGrid, href: "/admin/services" },
  { id: "artical", label: "Artical", icon: FiBookOpen, href: "/admin/artical" },
  { id: "artical-categories", label: "Artical Categories", icon: FiBookOpen, href: "/admin/artical-categories" },
  { id: "projects", label: "Projects", icon: FiFolder, href: "/admin/projects" },
  { id: "pricing", label: "Pricing", icon: FiDollarSign, href: "/admin/pricing" },
  { id: "faq", label: "FAQ", icon: FiHelpCircle, href: "/admin/faq" },
  { id: "ai", label: "AI Settings", icon: FiSettings, href: "/admin/ai" },
  { id: "testimonials", label: "Testimonials", icon: FiMessageSquare, href: "/admin/testimonials" },
  { id: "skills", label: "Skills", icon: FiCode, href: "/admin/skills" },
  { id: "experience", label: "Experience", icon: FiBriefcase, href: "/admin/experience" },
  { id: "education", label: "Education", icon: FiBookOpen, href: "/admin/education" },
  { id: "achievement", label: "Achievements", icon: HiOutlineUsers, href: "/admin/achievement" },
  { id: "counter", label: "Counters", icon: FiBarChart2, href: "/admin/counters" },
  { id: "social", label: "Social", icon: HiOutlineUsers, href: "/admin/social" },
  { id: "contact", label: "Contact", icon: FiPhone, href: "/admin/contact" },
  { id: "messages", label: "Messages", icon: FiMail, href: "/admin/messages" },
  { id: "settings", label: "Settings", icon: FiSettings, href: "/admin/settings" },
];

function adminFetch(input, init = {}) {
  return fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  });
}

function emptyProviderForm(name) {
  return {
    name,
    apiKey: "",
    baseUrl: "",
    isActive: false,
    hasApiKey: false,
    createdAt: "",
  };
}

function emptyTrainingForm() {
  return {
    question: "",
    answer: "",
    isActive: true,
  };
}

function normalizeProviderCollection(providers = []) {
  const baseProviders = ["openai", "deepseek", "gemini"].reduce((accumulator, name) => {
    accumulator[name] = emptyProviderForm(name);
    return accumulator;
  }, {});

  for (const provider of providers) {
    if (!provider?.name || !baseProviders[provider.name]) {
      continue;
    }

    baseProviders[provider.name] = {
      ...baseProviders[provider.name],
      baseUrl: provider.baseUrl || "",
      isActive: Boolean(provider.isActive),
      hasApiKey: Boolean(provider.hasApiKey),
      createdAt: provider.createdAt || "",
    };
  }

  return baseProviders;
}

export default function AdminAiSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProvider, setIsSavingProvider] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingTraining, setIsSavingTraining] = useState(false);
  const [deletingTrainingId, setDeletingTrainingId] = useState(0);
  const [visibleApiKeys, setVisibleApiKeys] = useState({});
  const [providerForms, setProviderForms] = useState(() => normalizeProviderCollection());
  const [trainingEntries, setTrainingEntries] = useState([]);
  const [trainingForm, setTrainingForm] = useState(() => emptyTrainingForm());
  const [settingsForm, setSettingsForm] = useState({
    activeProvider: "openai",
    modelName: "",
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    const savedAdmin = localStorage.getItem("portfolio_admin_user");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }

    setToken(savedToken);
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (_error) {
        setAdmin(null);
      }
    }

    async function loadAiSettings() {
      try {
        setIsLoading(true);
        const [providersResponse, settingsResponse, trainingResponse] = await Promise.all([
          adminFetch(buildPublicApiUrl("/api/admin/ai/providers"), {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }),
          adminFetch(buildPublicApiUrl("/api/admin/ai/settings"), {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }),
          adminFetch(buildPublicApiUrl("/api/admin/ai/training"), {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }),
        ]);

        const providersData = await providersResponse.json();
        const settingsData = await settingsResponse.json();
        const trainingData = await trainingResponse.json();

        if (!providersResponse.ok) {
          throw new Error(providersData.message || "Failed to load AI providers.");
        }

        if (!settingsResponse.ok) {
          throw new Error(settingsData.message || "Failed to load AI settings.");
        }

        if (!trainingResponse.ok) {
          throw new Error(trainingData.message || "Failed to load AI training entries.");
        }

        setProviderForms(normalizeProviderCollection(providersData.providers));
        setSettingsForm({
          activeProvider: settingsData.settings?.activeProvider || "openai",
          modelName: settingsData.settings?.modelName || "",
        });
        setTrainingEntries(Array.isArray(trainingData.entries) ? trainingData.entries : []);
      } catch (error) {
        toast.error(error.message || "Failed to load AI settings.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAiSettings();
  }, [router]);

  function updateProviderField(name, key, value) {
    setProviderForms((current) => ({
      ...current,
      [name]: {
        ...current[name],
        [key]: value,
      },
    }));
  }

  function toggleApiKeyVisibility(name) {
    setVisibleApiKeys((current) => ({
      ...current,
      [name]: !current[name],
    }));
  }

  function logout() {
    localStorage.removeItem("portfolio_admin_token");
    localStorage.removeItem("portfolio_admin_user");
    router.replace("/login/admin");
  }

  function updateTrainingForm(key, value) {
    setTrainingForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleProviderSave(name) {
    if (!token) {
      return;
    }

    const provider = providerForms[name];

    try {
      setIsSavingProvider(name);
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/ai/providers/${name}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
          isActive: provider.isActive,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save AI provider.");
      }

      setProviderForms((current) => ({
        ...current,
        [name]: {
          ...current[name],
          apiKey: "",
          baseUrl: data.provider?.baseUrl || "",
          isActive: Boolean(data.provider?.isActive),
          hasApiKey: Boolean(data.provider?.hasApiKey),
          createdAt: data.provider?.createdAt || "",
        },
      }));
      toast.success(`${providerLabels[name]} saved successfully.`);
    } catch (error) {
      toast.error(error.message || "Failed to save AI provider.");
    } finally {
      setIsSavingProvider("");
    }
  }

  async function handleSettingsSave() {
    if (!token) {
      return;
    }

    if (!settingsForm.activeProvider || !settingsForm.modelName.trim()) {
      toast.error("Active provider and model name are required.");
      return;
    }

    try {
      setIsSavingSettings(true);
      const response = await adminFetch(buildPublicApiUrl("/api/admin/ai/settings"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activeProvider: settingsForm.activeProvider,
          modelName: settingsForm.modelName.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save AI settings.");
      }

      setSettingsForm({
        activeProvider: data.settings?.activeProvider || settingsForm.activeProvider,
        modelName: data.settings?.modelName || settingsForm.modelName,
      });
      setProviderForms((current) => {
        const nextProviders = { ...current };
        for (const providerName of Object.keys(nextProviders)) {
          nextProviders[providerName] = {
            ...nextProviders[providerName],
            isActive: providerName === (data.settings?.activeProvider || settingsForm.activeProvider),
          };
        }
        return nextProviders;
      });
      toast.success("AI assistant settings updated.");
    } catch (error) {
      toast.error(error.message || "Failed to save AI settings.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleTrainingSave() {
    if (!token) {
      return;
    }

    if (!trainingForm.question.trim() || !trainingForm.answer.trim()) {
      toast.error("Training question and answer are required.");
      return;
    }

    try {
      setIsSavingTraining(true);
      const response = await adminFetch(buildPublicApiUrl("/api/admin/ai/training"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trainingForm.question.trim(),
          answer: trainingForm.answer.trim(),
          isActive: Boolean(trainingForm.isActive),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save AI training entry.");
      }

      setTrainingEntries((current) => [data.entry, ...current].filter(Boolean));
      setTrainingForm(emptyTrainingForm());
      toast.success("AI training entry saved.");
    } catch (error) {
      toast.error(error.message || "Failed to save AI training entry.");
    } finally {
      setIsSavingTraining(false);
    }
  }

  async function handleTrainingDelete(id) {
    if (!token || !id) {
      return;
    }

    try {
      setDeletingTrainingId(id);
      const response = await adminFetch(buildPublicApiUrl(`/api/admin/ai/training/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete AI training entry.");
      }

      setTrainingEntries((current) => current.filter((entry) => entry.id !== id));
      toast.success("AI training entry deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete AI training entry.");
    } finally {
      setDeletingTrainingId(0);
    }
  }

  return (
    <div suppressHydrationWarning className="w-full">
      <div className="mx-auto grid w-full max-w-7xl gap-5 py-4 sm:py-6 2xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.88),rgba(7,12,23,0.82))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl 2xl:sticky 2xl:top-6 2xl:h-[calc(100vh-3rem)] 2xl:overflow-y-auto">
          <div className="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_52%),rgba(255,255,255,0.03)] p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Control Center</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Portfolio Admin</h1>
            <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
              A focused workspace for your portfolio content, analytics, and site settings.
            </p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === "ai";

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-300 ${
                    isActive
                      ? "border-[#4dc4ff]/60 bg-[linear-gradient(135deg,rgba(32,77,121,0.45),rgba(17,34,59,0.82))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.2)]"
                      : "border-white/8 bg-white/[0.03] text-[#bfd0e2] hover:border-[#36557e] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <Icon size={18} />
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8b98a5]">Signed In</p>
            <p className="mt-3 font-medium text-white">{admin?.name || "Admin"}</p>
            <p className="mt-1 text-sm text-[#a7b7ca]">{admin?.email || "support@smshagor.com"}</p>
            <button
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#324966] bg-[#132339] px-4 py-3 text-sm font-medium text-white transition hover:border-[#4dc4ff]"
              onClick={logout}
              type="button"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(110,231,183,0.12),transparent_24%),linear-gradient(180deg,rgba(15,26,42,0.94),rgba(11,20,34,0.92))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#6bd4ff]">Admin Workspace</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">AI Assistant Settings</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#a8b8ca]">
                  Configure provider keys and choose the active model used by your portfolio assistant.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[#dce8f6] backdrop-blur-xl">
                <FiCpu size={15} />
                AI Control Room
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#9fb1c7]">Status</p>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <FiCheckCircle size={18} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">{isLoading ? "Loading..." : "Ready"}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#9fb1c7]">Provider</p>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <FiSettings size={18} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {providerLabels[settingsForm.activeProvider] || "Not set"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#9fb1c7]">Model</p>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <FiCpu size={18} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">{settingsForm.modelName || "Not configured"}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#9fb1c7]">Providers</p>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                    <FiKey size={18} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {Object.values(providerForms).filter((provider) => provider.hasApiKey).length}
                </p>
              </div>
            </div>
          </section>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7">
              <div className="rounded-[1.7rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#78d7ff]">Assistant Engine</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Active model routing</h2>
                    <p className="mt-2 max-w-2xl text-sm text-[#8ea7c2]">
                      Select the provider and model used by `/api/assistant`. The provider must already have a saved API key.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                    <FiSettings size={13} />
                    Runtime
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Active Provider</span>
                    <select
                      value={settingsForm.activeProvider}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          activeProvider: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-[#70d5ff]"
                    >
                      {Object.entries(providerLabels).map(([value, label]) => (
                        <option key={value} value={value} className="bg-[#08111d]">
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Model Name</span>
                    <input
                      value={settingsForm.modelName}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          modelName: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                      placeholder="gpt-4.1-mini, deepseek-chat, gemini-2.5-flash"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSettingsSave}
                    disabled={isSavingSettings || isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSave size={15} />
                    {isSavingSettings ? "Saving..." : "Save Assistant Settings"}
                  </button>
                  <p className="text-sm text-[#7f98b5]">
                    Current provider: <span className="font-semibold text-[#dff7ff]">{providerLabels[settingsForm.activeProvider] || "Not set"}</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                {Object.keys(providerLabels).map((name) => {
                  const provider = providerForms[name];
                  const isSavingThisProvider = isSavingProvider === name;
                  const isApiKeyVisible = Boolean(visibleApiKeys[name]);

                  return (
                    <article
                      key={name}
                      className="rounded-[1.7rem] border border-white/10 bg-[#08111d]/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#78d7ff]">Provider</p>
                          <h2 className="mt-2 text-xl font-semibold text-white">{providerLabels[name]}</h2>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
                            provider.hasApiKey
                              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                              : "border border-amber-400/20 bg-amber-400/10 text-amber-200"
                          }`}
                        >
                          <FiCheckCircle size={13} />
                          {provider.hasApiKey ? "Key saved" : "Key missing"}
                        </span>
                      </div>

                      <div className="mt-5 space-y-4">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">API Key</span>
                          <div className="relative">
                            <FiKey className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#78d7ff]" size={15} />
                            <input
                              type={isApiKeyVisible ? "text" : "password"}
                              value={provider.apiKey}
                              onChange={(event) => updateProviderField(name, "apiKey", event.target.value)}
                              className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] pl-11 pr-14 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                              placeholder={provider.hasApiKey ? "Saved already. Enter only to replace." : "Paste API key"}
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility(name)}
                              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8fdcff] transition hover:bg-white/10 hover:text-white"
                              aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
                            >
                              {isApiKeyVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Base URL</span>
                          <input
                            value={provider.baseUrl}
                            onChange={(event) => updateProviderField(name, "baseUrl", event.target.value)}
                            className="h-12 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                            placeholder={name === "gemini" ? "Optional custom base URL" : "Optional OpenAI-compatible base URL"}
                          />
                        </label>

                        <label className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Allow this provider</p>
                            <p className="text-xs text-[#8ea7c2]">Keeps the provider available for activation.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={provider.isActive}
                            onChange={(event) => updateProviderField(name, "isActive", event.target.checked)}
                            className="h-5 w-5 rounded border-white/20 bg-[#08111d] text-[#6cc8ff] focus:ring-[#70d5ff]"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleProviderSave(name)}
                          disabled={isSavingThisProvider || isLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#6fd8ff]/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiSave size={15} />
                          {isSavingThisProvider ? "Saving..." : `Save ${providerLabels[name]}`}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#78d7ff]">Assistant Training</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Add custom Q and A knowledge</h2>
                    <p className="mt-2 max-w-2xl text-sm text-[#8ea7c2]">
                      Save extra sample questions and ideal answers so the assistant can respond better to messages outside the normal portfolio fields.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#b8deff]">
                    <FiMessageSquare size={13} />
                    Training
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Question / user message</span>
                    <textarea
                      value={trainingForm.question}
                      onChange={(event) => updateTrainingForm("question", event.target.value)}
                      rows={3}
                      className="min-h-[90px] w-full resize-none rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                      placeholder="Example: Do you offer monthly maintenance for websites?"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">Ideal answer</span>
                    <textarea
                      value={trainingForm.answer}
                      onChange={(event) => updateTrainingForm("answer", event.target.value)}
                      rows={5}
                      className="min-h-[140px] w-full resize-none rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6f879f] focus:border-[#70d5ff]"
                      placeholder="Write the preferred assistant answer here..."
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Use this training entry</p>
                      <p className="text-xs text-[#8ea7c2]">Only active entries will be considered by the assistant.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={trainingForm.isActive}
                      onChange={(event) => updateTrainingForm("isActive", event.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-[#08111d] text-[#6cc8ff] focus:ring-[#70d5ff]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTrainingSave}
                      disabled={isSavingTraining || isLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiPlus size={15} />
                      {isSavingTraining ? "Saving..." : "Add Training Entry"}
                    </button>
                    <p className="text-sm text-[#7f98b5]">
                      Total entries: <span className="font-semibold text-[#dff7ff]">{trainingEntries.length}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {trainingEntries.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#93a9c3]">
                      No AI training entries saved yet.
                    </div>
                  ) : (
                    trainingEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                entry.isActive
                                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                  : "border border-amber-400/20 bg-amber-400/10 text-amber-200"
                              }`}>
                                {entry.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-[11px] text-[#7f98b5]">
                                {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                              </span>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-white">{entry.question}</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#9fb1c7]">{entry.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTrainingDelete(entry.id)}
                            disabled={deletingTrainingId === entry.id}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3b516d] bg-white/[0.03] text-[#ffb4b4] transition hover:border-[#ff8f8f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete training entry"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
