"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  FiActivity,
  FiBriefcase,
  FiCheckCircle,
  FiCpu,
  FiEdit3,
  FiEye,
  FiMail,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiSend,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import AdminFixedSidebarShell from "@/app/components/admin/admin-fixed-sidebar-shell";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

const tabs = [
  { id: "overview", label: "Overview", icon: FiActivity },
  { id: "gmail", label: "Gmail Job Alerts", icon: FiMail },
  { id: "sources", label: "Job Sources & Search", icon: FiSearch },
  { id: "profile", label: "Profile Context", icon: FiCheckCircle },
  { id: "jobs", label: "Jobs", icon: FiBriefcase },
  { id: "matches", label: "Matches", icon: FiActivity },
  { id: "drafts", label: "Email Drafts", icon: FiSend },
  { id: "ai", label: "AI Settings", icon: FiCpu },
  { id: "email", label: "Email Settings", icon: FiSettings },
  { id: "events", label: "Tracking / Events", icon: FiEye },
];

const fallbackProviderLabels = {
  DEEPSEEK: "DeepSeek \u2014 Recommended / Cost-effective",
  GEMINI: "Gemini \u2014 Fast fallback",
  OPENAI: "OpenAI \u2014 Premium quality",
};

const fallbackAvailableModels = {
  DEEPSEEK: ["deepseek-chat", "deepseek-reasoner"],
  GEMINI: ["gemini-1.5-flash", "gemini-1.5-pro"],
  OPENAI: ["gpt-4o-mini", "gpt-4o"],
};

const fallbackRecommendedModels = {
  DEEPSEEK: "deepseek-chat",
  GEMINI: "gemini-1.5-flash",
  OPENAI: "gpt-4o-mini",
};

const searchOptions = {
  rolesJson: ["Web Developer", "Frontend Developer", "Full Stack Developer", "Backend Developer", "Drone Software", "UAV Developer", "Robotics", "Cyber Security", "Security Analyst", "IoT Developer", "Embedded Systems"],
  jobTypesJson: ["Internship", "Full-time", "Part-time", "Contract", "Freelance"],
  workModesJson: ["Remote", "On-site", "Hybrid"],
  regionsJson: ["Europe", "United Kingdom", "United States", "Germany", "Netherlands", "Sweden", "Finland", "Denmark", "France", "Ireland"],
  experienceLevelsJson: ["Internship", "Entry level", "Junior", "Mid level"],
  preferredLanguagesJson: ["English", "German optional"],
};

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function statusPill(value) {
  const normalized = String(value || "").toUpperCase();
  if (["SENT", "OPENED", "CLICKED", "READY"].includes(normalized)) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized === "FAILED") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }
  return "border-white/10 bg-white/[0.04] text-[#cfe4f7]";
}

function ModuleState({ loading, error, empty, children, emptyText = "No records found." }) {
  if (loading) {
    return <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-[#9fb1c7]">Loading...</div>;
  }
  if (error) {
    return <div className="rounded-[1rem] border border-rose-400/25 bg-rose-400/10 p-5 text-sm text-rose-100">{error}</div>;
  }
  if (empty) {
    return <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-[#9fb1c7]">{emptyText}</div>;
  }
  return children;
}

function StatCard({ label, value, tone = "default" }) {
  const toneClass = tone === "good"
    ? "border-emerald-400/20 bg-emerald-400/10"
    : tone === "bad"
      ? "border-rose-400/20 bg-rose-400/10"
      : "border-white/10 bg-white/[0.04]";
  return (
    <div className={`rounded-[1rem] border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-[#8ea7c2]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function overviewTone(status) {
  const normalized = String(status || "").toUpperCase();
  if (["READY", "CONNECTED", "ACTIVE"].includes(normalized)) return "good";
  if (["CONFIG_REQUIRED", "FAILED", "ERROR"].includes(normalized)) return "bad";
  return "default";
}

function StatusBadge({ status }) {
  const tone = overviewTone(status);
  const className = tone === "good"
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
    : tone === "bad"
      ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
      : "border-white/10 bg-white/[0.05] text-[#cfe4f7]";
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{String(status || "UNKNOWN").replaceAll("_", " ")}</span>;
}

function CheckLine({ label, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
      <span className="text-[#9fb1c7]">{label}</span>
      <span className={ok ? "text-emerald-200" : "text-rose-200"}>{ok ? "Configured" : "Missing"}</span>
    </div>
  );
}

function OverviewStatusCard({ title, status, message, children }) {
  const tone = overviewTone(status);
  const borderClass = tone === "good"
    ? "border-emerald-400/20"
    : tone === "bad"
      ? "border-rose-400/20"
      : "border-white/10";
  return (
    <article className={`rounded-[1.2rem] border ${borderClass} bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">{message || "No status message available."}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </article>
  );
}

function keyStatus(configured) {
  return configured ? "Configured" : "Not configured";
}

function CheckboxGroup({ label, options, values, onChange }) {
  const selected = Array.isArray(values) ? values : [];
  function toggle(option) {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  }
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => toggle(option)} className={`rounded-full border px-3 py-2 text-xs ${selected.includes(option) ? "border-[#6fd8ff]/60 bg-[#16304a] text-white" : "border-white/10 text-[#bfd0e2]"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminJobAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [working, setWorking] = useState("");
  const [state, setState] = useState({
    overview: { loading: true, error: "", data: null },
    gmail: { loading: true, error: "", data: null },
    sources: { loading: true, error: "", data: { preference: null, sources: [], companySources: [] } },
    profile: { loading: true, error: "", data: null },
    jobs: { loading: true, error: "", data: [] },
    matches: { loading: true, error: "", data: [] },
    drafts: { loading: true, error: "", data: [] },
    ai: { loading: true, error: "", data: null },
    email: { loading: true, error: "", data: null },
    events: { loading: true, error: "", data: [] },
  });
  const [cvNotesForm, setCvNotesForm] = useState({ extraNotes: "", targetRoles: "", preferredCountries: "", resumeUrl: "", resumeFileName: "" });
  const [emailForm, setEmailForm] = useState({
    fromName: "",
    fromEmail: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpPort: 465,
    dailySendLimit: 5,
    isEnabled: false,
    openTrackingEnabled: false,
    clickTrackingEnabled: false,
    testToEmail: "",
  });
  const [searchForm, setSearchForm] = useState({
    rolesJson: [],
    customKeywordsJson: "",
    jobTypesJson: [],
    workModesJson: [],
    regionsJson: [],
    experienceLevelsJson: [],
    preferredLanguagesJson: [],
    maxJobsPerSync: 25,
    minimumMatchScoreToDraft: 60,
    autoDraftEnabled: false,
  });
  const [manualImportForm, setManualImportForm] = useState({
    title: "",
    company: "",
    location: "",
    sourceUrl: "",
    jobType: "",
    workMode: "",
    region: "",
    experienceLevel: "",
    recruiterName: "",
    recruiterEmail: "",
    recruiterEmailConfirmed: false,
    description: "",
    sourceName: "Manual Import",
  });
  const [companySourceForm, setCompanySourceForm] = useState({
    companyName: "",
    careersUrl: "",
    region: "Europe",
    notes: "",
    forceSourceType: "AUTO",
    selectorConfigJson: {
      jobCardSelector: "",
      titleSelector: "",
      companySelector: "",
      locationSelector: "",
      linkSelector: "",
      descriptionSelector: "",
    },
  });
  const [showCompanyAdvanced, setShowCompanyAdvanced] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [sourceSyncSummary, setSourceSyncSummary] = useState(null);
  const [aiForm, setAiForm] = useState({
    aiProvider: "DEEPSEEK",
    aiModel: "deepseek-chat",
    deepseekApiKey: "",
    geminiApiKey: "",
    openaiApiKey: "",
    fallbackEnabled: false,
    fallbackProvider: "",
    systemPrompt: "",
    recruiterEmailPrompt: "",
    coverLetterPrompt: "",
    tone: "professional-natural",
    maxEmailWords: 160,
    maxCoverLetterWords: 450,
    requireAdminApproval: true,
    attachCv: true,
    attachCoverLetterPdf: true,
    autoGenerateCoverLetter: true,
  });
  const [showGeneratedPromptPreview, setShowGeneratedPromptPreview] = useState(false);
  const [aiPreview, setAiPreview] = useState({ email: null, coverLetterText: "", promptPreview: null });
  const [draftEditor, setDraftEditor] = useState(null);

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
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  }, [router, token]);

  const setModule = useCallback((key, patch) => {
    setState((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }, []);

  const loadModule = useCallback(async (key, authToken = token) => {
    const endpointMap = {
      overview: "/api/admin/job-agent/overview",
      gmail: "/api/admin/job-agent/gmail/status",
      sources: null,
      profile: "/api/admin/job-agent/profile-context",
      jobs: "/api/admin/job-agent/jobs",
      matches: "/api/admin/job-agent/matches",
      drafts: "/api/admin/job-agent/drafts",
      ai: "/api/admin/job-agent/ai/settings",
      email: "/api/admin/job-agent/email/settings",
      events: "/api/admin/job-agent/email/events",
    };
    try {
      setModule(key, { loading: true, error: "" });
      const data = key === "sources"
        ? {
            preference: (await adminRequest("/api/admin/job-agent/search/preferences", {}, authToken)).preference,
            sources: (await adminRequest("/api/admin/job-agent/sources", {}, authToken)).sources,
            companySources: (await adminRequest("/api/admin/job-agent/company-sources", {}, authToken)).sources,
          }
        : await adminRequest(endpointMap[key], {}, authToken);
      const payload =
        key === "overview" ? data.overview :
        key === "sources" ? data :
        key === "jobs" ? data.jobs :
        key === "matches" ? data.matches :
        key === "drafts" ? data.drafts :
        key === "ai" ? data.setting :
        key === "email" ? data.setting :
        key === "events" ? data.events :
        data;
      setModule(key, { loading: false, error: "", data: payload });
      if (key === "profile") {
        setCvNotesForm({
          extraNotes: payload?.optionalCvProfile?.extraNotes || "",
          targetRoles: Array.isArray(payload?.optionalCvProfile?.targetRoles) ? payload.optionalCvProfile.targetRoles.join("\n") : "",
          preferredCountries: Array.isArray(payload?.optionalCvProfile?.preferredCountries) ? payload.optionalCvProfile.preferredCountries.join("\n") : "",
          resumeUrl: payload?.optionalCvProfile?.resumeUrl || "",
          resumeFileName: payload?.optionalCvProfile?.resumeFileName || "",
        });
      }
      if (key === "email") {
        setEmailForm((current) => ({
          ...current,
          fromName: payload?.fromName || "",
          fromEmail: payload?.fromEmail || "",
          smtpUsername: payload?.smtpUsername || "",
          smtpPassword: "",
          smtpPort: payload?.smtpPort || 465,
          dailySendLimit: payload?.dailySendLimit || 5,
          isEnabled: Boolean(payload?.isEnabled),
          openTrackingEnabled: Boolean(payload?.openTrackingEnabled),
          clickTrackingEnabled: Boolean(payload?.clickTrackingEnabled),
          testToEmail: current.testToEmail || payload?.fromEmail || "",
        }));
      }
      if (key === "sources") {
        setSearchForm({
          rolesJson: payload.preference?.rolesJson || [],
          customKeywordsJson: (payload.preference?.customKeywordsJson || []).join("\n"),
          jobTypesJson: payload.preference?.jobTypesJson || [],
          workModesJson: payload.preference?.workModesJson || [],
          regionsJson: payload.preference?.regionsJson || [],
          experienceLevelsJson: payload.preference?.experienceLevelsJson || [],
          preferredLanguagesJson: payload.preference?.preferredLanguagesJson || [],
          maxJobsPerSync: payload.preference?.maxJobsPerSync || 25,
          minimumMatchScoreToDraft: payload.preference?.minimumMatchScoreToDraft || 60,
          autoDraftEnabled: Boolean(payload.preference?.autoDraftEnabled),
        });
      }
      if (key === "ai") {
        setAiForm((current) => ({
          ...current,
          aiProvider: payload?.aiProvider || "DEEPSEEK",
          aiModel: payload?.aiModel || "",
          deepseekApiKey: "",
          geminiApiKey: "",
          openaiApiKey: "",
          fallbackEnabled: Boolean(payload?.fallbackEnabled),
          fallbackProvider: payload?.fallbackProvider || "",
          systemPrompt: payload?.systemPrompt || "",
          recruiterEmailPrompt: payload?.recruiterEmailPrompt || "",
          coverLetterPrompt: payload?.coverLetterPrompt || "",
          tone: payload?.tone || "professional-natural",
          maxEmailWords: payload?.maxEmailWords || 160,
          maxCoverLetterWords: payload?.maxCoverLetterWords || 450,
          requireAdminApproval: payload?.requireAdminApproval !== false,
          attachCv: payload?.attachCv !== false,
          attachCoverLetterPdf: payload?.attachCoverLetterPdf !== false,
          autoGenerateCoverLetter: payload?.autoGenerateCoverLetter !== false,
        }));
      }
    } catch (error) {
      setModule(key, { loading: false, error: error.message || "Failed to load module." });
    }
  }, [adminRequest, setModule, token]);

  const loadAll = useCallback(async (authToken = token) => {
    await Promise.all(tabs.map((tab) => loadModule(tab.id, authToken)));
  }, [loadModule, token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("portfolio_admin_token");
    if (!savedToken) {
      router.replace("/login/admin");
      return;
    }
    setToken(savedToken);
    loadAll(savedToken);
  }, [loadAll, router]);

  useEffect(() => {
    const status = searchParams.get("gmail");
    if (status === "connected") toast.success("Gmail connected successfully.");
    if (status === "failed") toast.error("Gmail connection failed.");
  }, [searchParams]);

  const overview = state.overview.data || {};
  const gmail = state.gmail.data || {};
  const sourcesData = state.sources.data || { preference: null, sources: [], companySources: [] };
  const profile = state.profile.data || {};
  const jobs = state.jobs.data || [];
  const matches = state.matches.data || [];
  const drafts = state.drafts.data || [];
  const ai = state.ai.data || {};
  const email = state.email.data || {};
  const events = state.events.data || [];
  const providerLabels = ai.providerLabels || fallbackProviderLabels;
  const availableModels = ai.availableModels || fallbackAvailableModels;
  const recommendedModels = ai.recommendedModels || fallbackRecommendedModels;
  const selectedProviderModels = availableModels[aiForm.aiProvider] || [];

  function setAiProvider(provider) {
    setAiForm((current) => ({
      ...current,
      aiProvider: provider,
      aiModel: recommendedModels[provider] || fallbackRecommendedModels[provider] || "",
    }));
  }

  async function doAction(label, fn, refreshKeys = []) {
    try {
      setWorking(label);
      await fn();
      await Promise.all(refreshKeys.map((key) => loadModule(key)));
    } catch (error) {
      toast.error(error.message || "Action failed.");
    } finally {
      setWorking("");
    }
  }

  function connectGmail() {
    doAction("gmail-connect", async () => {
      const data = await adminRequest("/api/admin/job-agent/gmail/connect");
      window.location.href = data.authUrl;
    });
  }

  function disconnectGmail() {
    if (!window.confirm("Disconnect Gmail from the Job Agent?")) return;
    doAction("gmail-disconnect", async () => {
      const data = await adminRequest("/api/admin/job-agent/gmail/disconnect", { method: "POST", body: "{}" });
      toast.success(data.message || "Gmail disconnected.");
    }, ["gmail", "overview"]);
  }

  function syncGmail() {
    doAction("gmail-sync", async () => {
      const data = await adminRequest("/api/admin/job-agent/gmail/sync", { method: "POST", body: "{}" });
      toast.success(data.message || "Gmail synced.");
    }, ["gmail", "overview", "jobs", "matches", "drafts"]);
  }

  function saveSearchPreferences() {
    doAction("search-preferences", async () => {
      const data = await adminRequest("/api/admin/job-agent/search/preferences", {
        method: "PUT",
        body: JSON.stringify({
          ...searchForm,
          customKeywordsJson: searchForm.customKeywordsJson.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean),
          maxJobsPerSync: Number(searchForm.maxJobsPerSync),
          minimumMatchScoreToDraft: Number(searchForm.minimumMatchScoreToDraft),
        }),
      });
      toast.success(data.message || "Search preferences saved.");
    }, ["sources"]);
  }

  function seedDefaultSources() {
    doAction("seed-sources", async () => {
      const data = await adminRequest("/api/admin/job-agent/sources/seed-defaults", { method: "POST", body: "{}" });
      toast.success(data.message || "Default sources seeded.");
    }, ["sources"]);
  }

  function updateSource(source, patch) {
    doAction(`source-${source.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/sources/${source.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...source, ...patch }),
      });
      toast.success(data.message || "Source updated.");
    }, ["sources"]);
  }

  function syncSources() {
    doAction("sources-sync", async () => {
      const data = await adminRequest("/api/admin/job-agent/sources/sync", { method: "POST", body: "{}" });
      setSourceSyncSummary(data);
      toast.success(data.message || "Sources synced.");
    }, ["sources", "jobs", "matches", "drafts", "overview"]);
  }

  function addCompanySource() {
    doAction("company-source-add", async () => {
      const data = await adminRequest("/api/admin/job-agent/company-sources", {
        method: "POST",
        body: JSON.stringify(companySourceForm),
      });
      toast.success(data.message || "Company source added.");
      setCompanySourceForm((current) => ({ ...current, companyName: "", careersUrl: "", notes: "" }));
    }, ["sources"]);
  }

  function testCompanySource(source) {
    doAction(`company-test-${source.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/company-sources/${source.id}/test`, {
        method: "POST",
        body: JSON.stringify({ forceSourceType: companySourceForm.forceSourceType }),
      });
      toast.success(data.message || "Company source tested.");
    }, ["sources"]);
  }

  function importCompanySource(source) {
    doAction(`company-import-${source.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/company-sources/${source.id}/import`, { method: "POST", body: "{}" });
      toast.success(data.message || "Company jobs imported.");
    }, ["sources", "jobs", "matches", "drafts", "overview"]);
  }

  function updateCompanySource(source, patch) {
    doAction(`company-update-${source.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/company-sources/${source.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...source, ...patch }),
      });
      toast.success(data.message || "Company source updated.");
    }, ["sources"]);
  }

  function deleteCompanySource(source) {
    if (!window.confirm(`Delete ${source.companyName || source.sourceName}?`)) return;
    doAction(`company-delete-${source.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/company-sources/${source.id}`, { method: "DELETE" });
      toast.success(data.message || "Company source deleted.");
    }, ["sources"]);
  }

  function manualImport(nextAction = "save") {
    doAction(`manual-import-${nextAction}`, async () => {
      const data = await adminRequest("/api/admin/job-agent/jobs/manual-import", {
        method: "POST",
        body: JSON.stringify({ ...manualImportForm, nextAction }),
      });
      toast.success(data.message || "Manual job imported.");
      setManualImportForm((current) => ({
        ...current,
        title: "",
        company: "",
        location: "",
        sourceUrl: "",
        recruiterName: "",
        recruiterEmail: "",
        recruiterEmailConfirmed: false,
        description: "",
      }));
    }, ["sources", "jobs", "matches", "drafts", "overview"]);
  }

  function saveCvNotes() {
    doAction("profile-notes", async () => {
      const data = await adminRequest("/api/admin/job-agent/profile-context/notes", {
        method: "PUT",
        body: JSON.stringify({
          extraNotes: cvNotesForm.extraNotes,
          targetRoles: cvNotesForm.targetRoles.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          preferredCountries: cvNotesForm.preferredCountries.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          resumeUrl: cvNotesForm.resumeUrl,
          resumeFileName: cvNotesForm.resumeFileName,
        }),
      });
      toast.success(data.message || "Profile notes saved.");
    }, ["profile"]);
  }

  function addDescription(job) {
    const description = window.prompt("Paste the manual job description:", "");
    if (!description) return;
    doAction(`description-${job.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/jobs/${job.id}/description`, {
        method: "PUT",
        body: JSON.stringify({ description }),
      });
      toast.success(data.message || "Description saved.");
    }, ["jobs"]);
  }

  function matchJob(job) {
    doAction(`match-${job.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/jobs/${job.id}/match`, { method: "POST", body: "{}" });
      toast.success(data.message || "Job matched.");
    }, ["jobs", "matches", "drafts", "overview"]);
  }

  function generateDraft(job) {
    doAction(`draft-${job.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/jobs/${job.id}/draft`, { method: "POST", body: "{}" });
      toast.success(data.message || "Draft generated.");
    }, ["jobs", "matches", "drafts", "overview"]);
  }

  function deleteJob(job) {
    if (!window.confirm(`Delete ${job.title}?`)) return;
    doAction(`delete-${job.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/jobs/${job.id}`, { method: "DELETE" });
      toast.success(data.message || "Job deleted.");
    }, ["jobs", "matches", "drafts", "events", "overview"]);
  }

  function saveEmailSettings() {
    doAction("email-settings", async () => {
      const data = await adminRequest("/api/admin/job-agent/email/settings", {
        method: "PUT",
        body: JSON.stringify({
          fromName: emailForm.fromName,
          fromEmail: emailForm.fromEmail,
          smtpUsername: emailForm.smtpUsername,
          smtpPassword: emailForm.smtpPassword,
          smtpPort: Number(emailForm.smtpPort),
          smtpSecure: Number(emailForm.smtpPort) === 465,
          dailySendLimit: Number(emailForm.dailySendLimit),
          isEnabled: Boolean(emailForm.isEnabled),
          openTrackingEnabled: Boolean(emailForm.openTrackingEnabled),
          clickTrackingEnabled: Boolean(emailForm.clickTrackingEnabled),
        }),
      });
      setEmailForm((current) => ({ ...current, smtpPassword: "" }));
      toast.success(data.message || "Email settings saved.");
    }, ["email", "overview"]);
  }

  function sendTestEmail() {
    doAction("email-test", async () => {
      const data = await adminRequest("/api/admin/job-agent/email/test", {
        method: "POST",
        body: JSON.stringify({ toEmail: emailForm.testToEmail, mock: !email.passwordConfigured }),
      });
      toast.success(data.message || "Test email checked.");
    });
  }

  function saveAiSettings() {
    doAction("ai-settings", async () => {
      const promptOverrides = ai.allowPromptOverride
        ? {
            systemPrompt: aiForm.systemPrompt,
            recruiterEmailPrompt: aiForm.recruiterEmailPrompt,
            coverLetterPrompt: aiForm.coverLetterPrompt,
          }
        : {};
      const data = await adminRequest("/api/admin/job-agent/ai/settings", {
        method: "PUT",
        body: JSON.stringify({
          aiProvider: aiForm.aiProvider,
          aiModel: aiForm.aiModel,
          deepseekApiKey: aiForm.deepseekApiKey,
          geminiApiKey: aiForm.geminiApiKey,
          openaiApiKey: aiForm.openaiApiKey,
          fallbackEnabled: Boolean(aiForm.fallbackEnabled),
          fallbackProvider: aiForm.fallbackProvider,
          tone: aiForm.tone,
          maxEmailWords: Number(aiForm.maxEmailWords),
          maxCoverLetterWords: Number(aiForm.maxCoverLetterWords),
          requireAdminApproval: Boolean(aiForm.requireAdminApproval),
          attachCv: Boolean(aiForm.attachCv),
          attachCoverLetterPdf: Boolean(aiForm.attachCoverLetterPdf),
          autoGenerateCoverLetter: Boolean(aiForm.autoGenerateCoverLetter),
          ...promptOverrides,
        }),
      });
      setAiForm((current) => ({ ...current, deepseekApiKey: "", geminiApiKey: "", openaiApiKey: "" }));
      toast.success(data.message || "AI settings saved.");
    }, ["ai", "drafts"]);
  }

  function previewAi(kind) {
    doAction(`ai-preview-${kind}`, async () => {
      const endpoint = kind === "email" ? "/api/admin/job-agent/ai/preview-email" : "/api/admin/job-agent/ai/preview-cover-letter";
      const data = await adminRequest(endpoint, { method: "POST", body: "{}" });
      setAiPreview((current) => ({
        ...current,
        email: data.email || current.email,
        coverLetterText: data.coverLetterText || current.coverLetterText,
        promptPreview: data.promptPreview || current.promptPreview,
      }));
      toast.success(data.message || "Preview generated.");
    });
  }

  function saveDraft() {
    if (!draftEditor) return;
    doAction(`save-draft-${draftEditor.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/drafts/${draftEditor.id}`, {
        method: "PUT",
        body: JSON.stringify({
          toEmail: draftEditor.toEmail || draftEditor.recipientEmail || "",
          recruiterContactId: draftEditor.recruiterContactId || null,
          subject: draftEditor.subject || "",
          body: draftEditor.body || "",
          coverLetterText: draftEditor.coverLetterText || "",
        }),
      });
      toast.success(data.message || "Draft saved.");
      setDraftEditor(null);
    }, ["drafts", "jobs"]);
  }

  function approveDraft(draft) {
    doAction(`approve-${draft.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/drafts/${draft.id}/approve`, { method: "POST", body: "{}" });
      toast.success(data.message || "Draft approved.");
    }, ["drafts"]);
  }

  function rejectDraft(draft) {
    const reason = window.prompt("Rejection reason:", "");
    doAction(`reject-${draft.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/drafts/${draft.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      toast.success(data.message || "Draft rejected.");
    }, ["drafts"]);
  }

  function generateCoverLetterPdf(draft) {
    doAction(`pdf-${draft.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/drafts/${draft.id}/generate-cover-letter-pdf`, {
        method: "POST",
        body: "{}",
      });
      toast.success(data.message || "Cover letter PDF generated.");
    }, ["drafts"]);
  }

  function sendDraft(draft) {
    if (draft.adminApprovalRequired && draft.approvalStatus !== "APPROVED") {
      toast.error("Admin approval required before sending.");
      return;
    }
    if (!window.confirm("Send this draft now?")) return;
    doAction(`send-${draft.id}`, async () => {
      const data = await adminRequest(`/api/admin/job-agent/email/send/${draft.id}`, {
        method: "POST",
        body: JSON.stringify({ toEmail: draft.recipientEmail }),
      });
      toast.success(data.message || "Draft sent.");
    }, ["drafts", "events", "overview"]);
  }

  return (
    <AdminFixedSidebarShell title="Job Agent" description="One workspace for compliant job alerts, matching, drafts, sending, and tracking.">
      <div className="space-y-5">
        <section className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,26,42,0.94),rgba(11,20,34,0.92))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#78d7ff]">Safe Application Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">AI Job Application Agent</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#9fb1c7]">This agent reads job-alert emails only. It does not scrape LinkedIn.</p>
            </div>
            <button onClick={() => loadAll()} className="inline-flex items-center gap-2 rounded-full border border-[#6fd8ff]/30 px-4 py-3 text-sm font-semibold text-[#dff7ff]" type="button">
              <FiRefreshCw size={15} /> Refresh All
            </button>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${activeTab === tab.id ? "border-[#6fd8ff]/60 bg-[#16304a] text-white" : "border-white/10 bg-white/[0.03] text-[#bfd0e2]"}`}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "overview" && (
          <section className="space-y-4">
            <ModuleState loading={state.overview.loading} error={state.overview.error} empty={!overview}>
              <div className="grid gap-3 md:grid-cols-4">
                <StatCard label="Total Jobs" value={overview.totalJobs || 0} />
                <StatCard label="Matched Jobs" value={overview.matchedJobs || 0} />
                <StatCard label="Drafts" value={overview.drafts || 0} />
                <StatCard label="Sent Emails" value={overview.sentEmails || 0} tone="good" />
                <StatCard label="Opened Emails" value={overview.openedEmails || 0} />
                <StatCard label="Clicked Emails" value={overview.clickedEmails || 0} />
                <StatCard label="Failed Emails" value={overview.failedEmails || 0} tone={overview.failedEmails ? "bad" : "default"} />
                <StatCard label="Today Sent / Limit" value={`${overview.sentToday || 0}/${overview.dailySendLimit || 0}`} />
                <StatCard label="Jobs From Job Boards" value={overview.boardJobs || 0} />
                <StatCard label="Manual Imports" value={overview.manualImports || 0} />
                <StatCard label="Needs Description" value={overview.jobsNeedingDescription || 0} tone={overview.jobsNeedingDescription ? "bad" : "default"} />
                <StatCard label="Auto-Drafted Jobs" value={overview.autoDraftedJobs || 0} />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <OverviewStatusCard title="Gmail OAuth Client" status={overview.gmail?.oauthConfigured ? "READY" : "CONFIG_REQUIRED"} message={overview.gmail?.oauthConfigured ? "Google OAuth client is configured for safe Gmail job-alert access." : "Add Google OAuth client ID and secret before connecting Gmail."}>
                  <CheckLine label="Client ID" ok={overview.gmail?.clientIdConfigured} />
                  <CheckLine label="Client Secret" ok={overview.gmail?.clientSecretConfigured} />
                  <CheckLine label="Redirect URI" ok={overview.gmail?.redirectUriConfigured} />
                </OverviewStatusCard>

                <OverviewStatusCard title="Gmail Job-Alert Connection" status={overview.gmail?.status} message={overview.gmail?.message}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CheckLine label="Gmail connected" ok={overview.gmail?.connected} />
                    <CheckLine label="Read-only job alerts" ok={overview.gmail?.connected} />
                  </div>
                  <p className="text-sm text-[#dce8f6]">Account: {overview.gmail?.email || "Not connected"}</p>
                  <p className="text-sm text-[#9fb1c7]">Last sync: {formatDate(overview.gmail?.lastSyncTime)}</p>
                  <p className="text-sm text-[#9fb1c7]">Imported jobs: {gmail.importedJobCount ?? overview.gmail?.importedJobCount ?? 0}</p>
                </OverviewStatusCard>

                <OverviewStatusCard title="AI Provider & Response" status={overview.ai?.status} message={overview.ai?.message}>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <CheckLine label="DeepSeek" ok={overview.ai?.deepseekKeyConfigured} />
                    <CheckLine label="Gemini" ok={overview.ai?.geminiKeyConfigured} />
                    <CheckLine label="OpenAI" ok={overview.ai?.openaiKeyConfigured} />
                  </div>
                  <p className="text-sm text-[#dce8f6]">Active: {overview.ai?.providerLabel || "Not configured"} / {overview.ai?.aiModel || "No model"}</p>
                  <p className="text-sm text-[#9fb1c7]">Fallback: {overview.ai?.fallbackEnabled ? overview.ai?.fallbackProvider || "Enabled" : "Disabled"}</p>
                  <p className="text-sm text-[#9fb1c7]">
                    Last response: {overview.ai?.latestResponse ? `${overview.ai.latestResponse.jobTitle || "Draft"} at ${overview.ai.latestResponse.company || "Unknown company"} (${overview.ai.latestResponse.status})` : "No AI draft generated yet"}
                  </p>
                </OverviewStatusCard>

                <OverviewStatusCard title="SMTP Sending Status" status={overview.smtp?.status} message={overview.smtp?.message}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CheckLine label="Sending enabled" ok={overview.smtp?.isEnabled} />
                    <CheckLine label="App password" ok={overview.smtp?.passwordConfigured} />
                  </div>
                  <p className="text-sm text-[#dce8f6]">Sender: {overview.smtp?.fromEmail || "Not configured"}</p>
                  <p className="text-sm text-[#9fb1c7]">SMTP: {overview.smtp?.smtpHost || "smtp.gmail.com"}:{overview.smtp?.smtpPort || 465} / {overview.smtp?.smtpSecure ? "secure" : "starttls"}</p>
                  <p className="text-sm text-[#9fb1c7]">Daily limit: {overview.sentToday || 0}/{overview.smtp?.dailySendLimit || overview.dailySendLimit || 0}</p>
                </OverviewStatusCard>
              </div>

              <OverviewStatusCard title="Live Tracking Events" status={overview.tracking?.status} message={overview.tracking?.message}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <CheckLine label="Open tracking" ok={overview.tracking?.openTrackingEnabled} />
                  <CheckLine label="Click tracking" ok={overview.tracking?.clickTrackingEnabled} />
                </div>
                <div className="mt-3 overflow-hidden rounded-[0.9rem] border border-white/10">
                  {(overview.tracking?.recentEvents || []).length ? (overview.tracking.recentEvents || []).map((event) => (
                    <div key={event.id} className="grid gap-1 border-b border-white/10 bg-[#07111d]/70 px-3 py-3 text-sm last:border-b-0 md:grid-cols-[140px_minmax(0,1fr)_180px]">
                      <span className="font-semibold text-[#dff7ff]">{event.eventType}</span>
                      <div>
                        <p className="text-white">{event.recipientEmail || "Unknown recipient"}</p>
                        <p className="text-[#9fb1c7]">{event.jobTitle || "No job title"} {event.company ? `- ${event.company}` : ""}</p>
                        {event.url ? <p className="break-all text-[#8fdcff]">{event.url}</p> : null}
                        <p className="text-xs text-[#8ea7c2]">IP stored as hash: {event.ipStoredAsHash ? "Yes" : "No"}</p>
                      </div>
                      <div className="text-[#9fb1c7]">
                        <p>{formatDate(event.createdAt)}</p>
                        <p className="truncate text-xs">{event.userAgent || "No user agent"}</p>
                      </div>
                    </div>
                  )) : <div className="bg-[#07111d]/70 px-3 py-4 text-sm text-[#9fb1c7]">No tracking events recorded yet.</div>}
                </div>
              </OverviewStatusCard>
            </ModuleState>
          </section>
        )}

        {activeTab === "gmail" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.gmail.loading} error={state.gmail.error} empty={!gmail}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Gmail Job Alerts</h2>
                  <p className="mt-2 text-sm text-[#9fb1c7]">Safety notice: reads job-alert emails only, no LinkedIn scraping.</p>
                  <p className="mt-3 text-sm text-[#dce8f6]">Status: {gmail.connected ? `Connected as ${gmail.email}` : "Not connected"}</p>
                  <p className="mt-1 text-sm text-[#9fb1c7]">Last sync: {formatDate(gmail.lastSyncedAt)}</p>
                  <p className="mt-1 text-sm text-[#9fb1c7]">Imported jobs: {overview.gmail?.importedJobCount || 0}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={connectGmail} type="button" className="rounded-full border border-[#6fd8ff]/30 px-4 py-3 text-sm font-semibold text-[#dff7ff]">Connect Gmail</button>
                  <button onClick={disconnectGmail} disabled={!gmail.connected} type="button" className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 disabled:opacity-60">Disconnect Gmail</button>
                  <button onClick={syncGmail} disabled={!gmail.connected || working === "gmail-sync"} type="button" className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d] disabled:opacity-60">Sync Job Alerts</button>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {(gmail.safeQueries || []).map((query) => <code key={query} className="block rounded-lg border border-white/10 bg-[#07111d] px-3 py-2 text-xs text-[#9fdcff]">{query}</code>)}
              </div>
            </ModuleState>
          </section>
        )}

        {activeTab === "sources" && (
          <section className="space-y-5">
            <ModuleState loading={state.sources.loading} error={state.sources.error} empty={!sourcesData}>
              <div className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Search Preferences</h2>
                    <p className="mt-2 text-sm text-[#9fb1c7]">Safe sources only: public APIs, RSS, approved public boards, job-alert emails, and manual imports. LinkedIn remains Gmail job-alert only.</p>
                  </div>
                  <button onClick={saveSearchPreferences} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d]">Save Preferences</button>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <CheckboxGroup label="Target roles / keywords" options={searchOptions.rolesJson} values={searchForm.rolesJson} onChange={(values) => setSearchForm((current) => ({ ...current, rolesJson: values }))} />
                  <CheckboxGroup label="Job type" options={searchOptions.jobTypesJson} values={searchForm.jobTypesJson} onChange={(values) => setSearchForm((current) => ({ ...current, jobTypesJson: values }))} />
                  <CheckboxGroup label="Work mode" options={searchOptions.workModesJson} values={searchForm.workModesJson} onChange={(values) => setSearchForm((current) => ({ ...current, workModesJson: values }))} />
                  <CheckboxGroup label="Regions" options={searchOptions.regionsJson} values={searchForm.regionsJson} onChange={(values) => setSearchForm((current) => ({ ...current, regionsJson: values }))} />
                  <CheckboxGroup label="Experience level" options={searchOptions.experienceLevelsJson} values={searchForm.experienceLevelsJson} onChange={(values) => setSearchForm((current) => ({ ...current, experienceLevelsJson: values }))} />
                  <CheckboxGroup label="Preferred language" options={searchOptions.preferredLanguagesJson} values={searchForm.preferredLanguagesJson} onChange={(values) => setSearchForm((current) => ({ ...current, preferredLanguagesJson: values }))} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <textarea value={searchForm.customKeywordsJson} onChange={(event) => setSearchForm((current) => ({ ...current, customKeywordsJson: event.target.value }))} rows={3} placeholder="Custom keywords, one per line" className="rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <input type="number" value={searchForm.maxJobsPerSync} onChange={(event) => setSearchForm((current) => ({ ...current, maxJobsPerSync: event.target.value }))} placeholder="Max jobs per sync" className="h-12 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                  <input type="number" value={searchForm.minimumMatchScoreToDraft} onChange={(event) => setSearchForm((current) => ({ ...current, minimumMatchScoreToDraft: event.target.value }))} placeholder="Minimum match score to draft" className="h-12 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                  <label className="flex h-12 items-center justify-between rounded-[0.9rem] border border-white/10 px-3 text-sm text-white">Auto draft only, never send<input type="checkbox" checked={searchForm.autoDraftEnabled} onChange={(event) => setSearchForm((current) => ({ ...current, autoDraftEnabled: event.target.checked }))} /></label>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Company Career Site Import</h2>
                    <p className="mt-2 text-sm text-[#9fb1c7]">Add official public career pages only. The agent detects approved public providers and safely fails for protected, login, captcha, or unsupported pages.</p>
                    <p className="mt-2 text-sm text-[#ffc7a8]">Safety: no LinkedIn scraping, no browser automation, and no bot-bypass behavior.</p>
                  </div>
                  <button onClick={addCompanySource} disabled={working === "company-source-add"} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d] disabled:opacity-60">Add Company Source</button>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <input value={companySourceForm.companyName} onChange={(event) => setCompanySourceForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company or website name" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                  <input value={companySourceForm.careersUrl} onChange={(event) => setCompanySourceForm((current) => ({ ...current, careersUrl: event.target.value }))} placeholder="Official careers/jobs URL" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                  <input value={companySourceForm.region} onChange={(event) => setCompanySourceForm((current) => ({ ...current, region: event.target.value }))} placeholder="Region optional" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                  <input value={companySourceForm.notes} onChange={(event) => setCompanySourceForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes optional" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                </div>
                <button type="button" onClick={() => setShowCompanyAdvanced((value) => !value)} className="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                  {showCompanyAdvanced ? "Hide advanced detection" : "Advanced: force type / selectors"}
                </button>
                {showCompanyAdvanced ? (
                  <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <label className="text-sm font-semibold text-white">Force source type</label>
                    <select value={companySourceForm.forceSourceType} onChange={(event) => setCompanySourceForm((current) => ({ ...current, forceSourceType: event.target.value }))} className="mt-2 h-11 w-full rounded-[0.9rem] border border-white/10 bg-[#08111d] px-3 text-sm text-white outline-none">
                      {["AUTO", "GREENHOUSE", "LEVER", "ASHBY", "WORKABLE", "SMARTRECRUITERS", "RSS", "PUBLIC_HTML"].map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {Object.keys(companySourceForm.selectorConfigJson || {}).map((field) => (
                        <input key={field} value={companySourceForm.selectorConfigJson[field] || ""} onChange={(event) => setCompanySourceForm((current) => ({ ...current, selectorConfigJson: { ...(current.selectorConfigJson || {}), [field]: event.target.value } }))} placeholder={field} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-[#8ea7c2]">Selectors are optional and only used for simple public HTML extraction. Unsupported pages remain manual-import only.</p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3">
                  {(sourcesData.companySources || []).length === 0 ? (
                    <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-[#9fb1c7]">No company career sources added yet.</div>
                  ) : (sourcesData.companySources || []).map((source) => (
                    <article key={source.id} className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{source.companyName || source.sourceName}</h3>
                          <a className="mt-1 block break-all text-sm text-[#8fdcff]" href={source.careersUrl || source.baseUrl} target="_blank">{source.careersUrl || source.baseUrl}</a>
                          <p className="mt-2 text-sm text-[#9fb1c7]">{source.region || "Global"} - {source.detectedProvider || "AUTO"} - {source.extractionStatus || source.status}</p>
                          <p className="mt-1 text-sm text-[#cfe4f7]">{source.extractionMessage || source.notes || "Ready for testing."}</p>
                          <p className="mt-1 text-xs text-[#8ea7c2]">Last sync: {formatDate(source.lastSyncAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white">Enabled<input type="checkbox" checked={source.enabled} onChange={(event) => updateCompanySource(source, { enabled: event.target.checked })} /></label>
                          <button onClick={() => testCompanySource(source)} className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-white">Test</button>
                          <button onClick={() => importCompanySource(source)} disabled={!source.enabled} className="rounded-full border border-[#6fd8ff]/30 px-3 py-2 text-sm font-semibold text-[#dff7ff] disabled:opacity-50">Import Jobs</button>
                          <button onClick={() => deleteCompanySource(source)} className="rounded-full border border-rose-300/20 px-3 py-2 text-sm text-rose-100"><FiTrash2 /></button>
                        </div>
                      </div>
                      {source.lastImportStatsJson ? (
                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                          <p className="rounded-lg border border-white/10 px-3 py-2 text-[#dce8f6]">Imported: {source.lastImportStatsJson.importedCount || 0}</p>
                          <p className="rounded-lg border border-white/10 px-3 py-2 text-[#dce8f6]">Duplicates: {source.lastImportStatsJson.duplicateCount || 0}</p>
                          <p className="rounded-lg border border-white/10 px-3 py-2 text-[#dce8f6]">Needs description: {source.lastImportStatsJson.needsDescriptionCount || 0}</p>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Approved Job Sources</h2>
                    <p className="mt-2 text-sm text-[#9fb1c7]">Planned sources are shown for visibility and stay skipped until an approved adapter or manual import is used.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={seedDefaultSources} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">Seed Defaults</button>
                    <button onClick={syncSources} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d]">Sync Enabled Sources</button>
                  </div>
                </div>
                {sourceSyncSummary ? <div className="mt-4 grid gap-3 md:grid-cols-3"><StatCard label="Imported" value={sourceSyncSummary.importedCount || 0} /><StatCard label="Skipped Duplicates" value={sourceSyncSummary.skippedDuplicateCount || 0} /><StatCard label="Needs Description" value={sourceSyncSummary.jobsNeedingDescription || 0} /></div> : null}
                <div className="mt-5 grid gap-3">
                  {(sourcesData.sources || []).map((source) => (
                    <article key={source.id} className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{source.sourceName}</h3>
                          <p className="mt-1 text-sm text-[#9fb1c7]">{source.region} - {source.sourceType} - {source.status}</p>
                          <p className="mt-2 text-sm text-[#cfe4f7]">{source.notes}</p>
                          <p className="mt-1 text-xs text-[#8ea7c2]">Last sync: {formatDate(source.lastSyncAt)}</p>
                        </div>
                        <label className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white">Enabled<input type="checkbox" checked={source.enabled} onChange={(event) => updateSource(source, { enabled: event.target.checked })} /></label>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Manual Fallback</h2>
                    <p className="mt-2 text-sm text-[#9fb1c7]">Use this only when a job description or URL is manually provided by the admin and no compliant public source is available.</p>
                  </div>
                  <button type="button" onClick={() => setShowManualFallback((value) => !value)} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">
                    {showManualFallback ? "Hide Manual Fallback" : "Show Manual Fallback"}
                  </button>
                </div>
                {showManualFallback ? (
                  <div className="mt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {["title", "company", "location", "sourceUrl", "jobType", "workMode", "region", "experienceLevel", "recruiterName", "recruiterEmail", "sourceName"].map((field) => (
                        <input key={field} value={manualImportForm[field] || ""} onChange={(event) => setManualImportForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                      ))}
                    </div>
                    <label className="mt-3 flex w-fit items-center gap-2 rounded-[0.9rem] border border-white/10 px-3 py-2 text-sm text-white"><input type="checkbox" checked={manualImportForm.recruiterEmailConfirmed} onChange={(event) => setManualImportForm((current) => ({ ...current, recruiterEmailConfirmed: event.target.checked }))} />I confirm this recruiter email is official/valid.</label>
                    <textarea value={manualImportForm.description} onChange={(event) => setManualImportForm((current) => ({ ...current, description: event.target.value }))} rows={7} placeholder="Job description" className="mt-3 w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => manualImport("save")} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">Save job</button>
                      <button onClick={() => manualImport("match")} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">Save and match</button>
                      <button onClick={() => manualImport("draft")} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d]">Save, match, and generate draft</button>
                    </div>
                  </div>
                ) : null}
              </div>
            </ModuleState>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.profile.loading} error={state.profile.error} empty={!profile}>
              <div className="grid gap-3 md:grid-cols-4">
                <StatCard label="Skills" value={profile.skills?.length || 0} />
                <StatCard label="Education" value={profile.education?.length || 0} />
                <StatCard label="Projects" value={profile.projects?.length || 0} />
                <StatCard label="Experience" value={profile.experience?.length || 0} />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <h2 className="font-semibold text-white">Portfolio Data Source Preview</h2>
                    <p className="mt-2 text-sm leading-7 text-[#dce8f6]">{profile.summary || "No summary found."}</p>
                    <p className="mt-3 text-sm text-[#9fb1c7]">Source tables: {(profile.sourceTablesUsed || []).join(", ") || "None"}</p>
                    <p className="mt-1 text-sm text-[#ffc7a8]">Missing fields: {(profile.missingFields || []).join(", ") || "None"}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-semibold text-white">Skills Preview</h3>
                    <p className="mt-2 text-sm leading-7 text-[#dff7ff]">{(profile.skills || []).join(", ") || "No skills found."}</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                  <h2 className="font-semibold text-white">Optional CV Notes</h2>
                  <textarea value={cvNotesForm.extraNotes} onChange={(event) => setCvNotesForm((current) => ({ ...current, extraNotes: event.target.value }))} rows={5} placeholder="Optional notes" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <textarea value={cvNotesForm.targetRoles} onChange={(event) => setCvNotesForm((current) => ({ ...current, targetRoles: event.target.value }))} rows={3} placeholder="Target roles, one per line" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <textarea value={cvNotesForm.preferredCountries} onChange={(event) => setCvNotesForm((current) => ({ ...current, preferredCountries: event.target.value }))} rows={3} placeholder="Preferred countries, one per line" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <button onClick={saveCvNotes} type="button" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d]"><FiSave size={15} /> Save Profile Notes</button>
                </div>
              </div>
            </ModuleState>
          </section>
        )}

        {activeTab === "jobs" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.jobs.loading} error={state.jobs.error} empty={jobs.length === 0}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-[#8ea7c2]"><tr><th className="p-3">Job</th><th className="p-3">Source</th><th className="p-3">Description</th><th className="p-3">Score</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr></thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-white/10 text-[#dce8f6]">
                        <td className="p-3"><p className="font-semibold text-white">{job.title}</p><p>{job.company} - {job.location || "Unknown"}</p>{job.sourceUrl ? <a className="text-[#8fdcff]" href={job.sourceUrl} target="_blank">Source URL</a> : null}</td>
                        <td className="p-3">{job.source}</td>
                        <td className="p-3">{job.descriptionStatus}</td>
                        <td className="p-3">{job.matchScore ?? "None"}</td>
                        <td className="p-3">{job.status}</td>
                        <td className="p-3">{formatDate(job.createdAt)}</td>
                        <td className="p-3"><div className="flex flex-wrap gap-2"><button onClick={() => addDescription(job)} className="rounded-full border border-white/10 px-3 py-2">Add description</button><button onClick={() => matchJob(job)} className="rounded-full border border-white/10 px-3 py-2">Match</button><button onClick={() => generateDraft(job)} className="rounded-full border border-white/10 px-3 py-2">Generate draft</button><button onClick={() => deleteJob(job)} className="rounded-full border border-rose-300/20 px-3 py-2 text-rose-100"><FiTrash2 /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleState>
          </section>
        )}

        {activeTab === "matches" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.matches.loading} error={state.matches.error} empty={matches.length === 0}>
              <div className="grid gap-3">
                {matches.map((match) => (
                  <article key={match.id} className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:justify-between"><div><h3 className="font-semibold text-white">{match.job?.title} - {match.job?.company}</h3><p className="mt-1 text-sm text-[#9fb1c7]">Created: {formatDate(match.createdAt)}</p></div><span className={`w-fit rounded-full border px-3 py-1 text-sm ${statusPill(match.score >= 50 ? "SENT" : "DRAFT")}`}>Score {match.score}</span></div>
                    <p className="mt-3 text-sm text-[#dce8f6]">{match.summary}</p>
                    <p className="mt-2 text-sm text-[#9fdcff]">Matched: {(match.matchedSkills || []).join(", ") || "None"}</p>
                    <p className="mt-1 text-sm text-[#ffc7a8]">Missing: {(match.missingSkills || []).join(", ") || "None"}</p>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-[#07111d] p-3 text-xs text-[#9fb1c7]">{JSON.stringify(match.aiReasoning || {}, null, 2)}</pre>
                  </article>
                ))}
              </div>
            </ModuleState>
          </section>
        )}

        {activeTab === "drafts" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.drafts.loading} error={state.drafts.error} empty={drafts.length === 0}>
              <div className="grid gap-3">
                {drafts.map((draft) => (
                  <article key={draft.id} className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:justify-between">
                      <div><h3 className="font-semibold text-white">{draft.subject}</h3><p className="mt-1 text-sm text-[#9fb1c7]">{draft.jobTitle} - {draft.company}</p><p className="mt-1 text-sm text-[#9fb1c7]">Recipient: {draft.recipientEmail || "Not set"}</p></div>
                      <span className={`h-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusPill(draft.status)}`}>{draft.status}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm md:grid-cols-5"><p>Sent: {formatDate(draft.sentAt)}</p><p>Opened: {formatDate(draft.openedAt)}</p><p>Opens: {draft.openCount || 0}</p><p>Clicked: {formatDate(draft.clickedAt)}</p><p>Clicks: {draft.clickCount || 0}</p></div>
                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
                      <p>Approval: {draft.approvalStatus || "PENDING"}</p>
                      <p>CV attached: {draft.cvAttached ? "true" : "false"}</p>
                      <p>Cover letter PDF: {draft.coverLetterPdfAttached ? "true" : "false"}</p>
                      <p>AI: {draft.aiProvider || "Not set"} {draft.aiModel || ""}</p>
                    </div>
                    {draft.adminApprovalRequired && draft.approvalStatus !== "APPROVED" ? <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">Admin approval required before sending</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => setDraftEditor(draft)} className="rounded-full border border-white/10 px-3 py-2"><FiEdit3 /></button>
                      <button onClick={() => window.alert(`${draft.body || "No draft body."}\n\nCover letter:\n${draft.coverLetterText || "No cover letter."}`)} className="rounded-full border border-white/10 px-3 py-2">Preview</button>
                      <button onClick={() => approveDraft(draft)} className="rounded-full border border-emerald-300/20 px-3 py-2 text-emerald-100">Approve</button>
                      <button onClick={() => rejectDraft(draft)} className="rounded-full border border-rose-300/20 px-3 py-2 text-rose-100">Reject</button>
                      <button onClick={() => generateCoverLetterPdf(draft)} className="rounded-full border border-white/10 px-3 py-2">Generate PDF</button>
                      <button onClick={() => sendDraft(draft)} disabled={draft.adminApprovalRequired && draft.approvalStatus !== "APPROVED"} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-3 py-2 font-semibold text-[#07111d] disabled:opacity-50">Send</button>
                    </div>
                  </article>
                ))}
              </div>
              {draftEditor ? (
                <div className="mt-5 rounded-[1rem] border border-[#6fd8ff]/30 bg-[#07111d] p-4">
                  <h3 className="font-semibold text-white">Edit Draft</h3>
                  <input value={draftEditor.recipientEmail || ""} onChange={(event) => setDraftEditor((current) => ({ ...current, recipientEmail: event.target.value, toEmail: event.target.value }))} className="mt-3 h-11 w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" placeholder="Recipient email" />
                  <input value={draftEditor.subject || ""} onChange={(event) => setDraftEditor((current) => ({ ...current, subject: event.target.value }))} className="mt-3 h-11 w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" placeholder="Subject" />
                  <textarea value={draftEditor.body || ""} onChange={(event) => setDraftEditor((current) => ({ ...current, body: event.target.value }))} rows={9} className="mt-3 w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <textarea value={draftEditor.coverLetterText || ""} onChange={(event) => setDraftEditor((current) => ({ ...current, coverLetterText: event.target.value }))} rows={9} className="mt-3 w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" placeholder="Cover letter text" />
                  <div className="mt-3 flex gap-2"><button onClick={saveDraft} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-2 font-semibold text-[#07111d]">Save</button><button onClick={() => setDraftEditor(null)} className="rounded-full border border-white/10 px-4 py-2 text-white">Cancel</button></div>
                </div>
              ) : null}
            </ModuleState>
          </section>
        )}

        {activeTab === "ai" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.ai.loading} error={state.ai.error} empty={!ai}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Settings</h2>
                  <p className="mt-2 text-sm text-[#9fb1c7]">Keys are encrypted server-side and never returned by the API.</p>
                  <p className="mt-2 text-sm text-[#dce8f6]">Select a provider, paste its API key, and the recommended model will be selected automatically.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => previewAi("email")} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">Preview Email</button>
                  <button onClick={() => previewAi("coverLetter")} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">Preview Cover Letter</button>
                  <button onClick={saveAiSettings} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 text-sm font-semibold text-[#07111d]">Save Settings</button>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">DeepSeek</p><p className="mt-1 text-sm text-[#9fb1c7]">Recommended / Cost-effective</p><p className="mt-3 text-sm text-[#dff7ff]">{keyStatus(ai.deepseekKeyConfigured)}</p></div>
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">Gemini</p><p className="mt-1 text-sm text-[#9fb1c7]">Fast fallback</p><p className="mt-3 text-sm text-[#dff7ff]">{keyStatus(ai.geminiKeyConfigured)}</p></div>
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">OpenAI</p><p className="mt-1 text-sm text-[#9fb1c7]">Premium quality</p><p className="mt-3 text-sm text-[#dff7ff]">{keyStatus(ai.openaiKeyConfigured)}</p></div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <select value={aiForm.aiProvider} onChange={(event) => setAiProvider(event.target.value)} className="h-11 rounded-[0.9rem] border border-white/10 bg-[#0b1524] px-3 text-sm text-white outline-none">
                  {Object.entries(providerLabels).map(([provider, label]) => <option key={provider} value={provider}>{label}</option>)}
                </select>
                <select value={aiForm.aiModel || recommendedModels[aiForm.aiProvider] || ""} onChange={(event) => setAiForm((current) => ({ ...current, aiModel: event.target.value }))} className="h-11 rounded-[0.9rem] border border-white/10 bg-[#0b1524] px-3 text-sm text-white outline-none">
                  {selectedProviderModels.map((model) => <option key={model} value={model}>{model}{recommendedModels[aiForm.aiProvider] === model ? " \u2014 recommended" : ""}</option>)}
                </select>
                <input type="password" value={aiForm.deepseekApiKey} onChange={(event) => setAiForm((current) => ({ ...current, deepseekApiKey: event.target.value }))} placeholder={ai.deepseekKeyConfigured ? "DeepSeek key saved. Enter to replace." : "DeepSeek API key"} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input type="password" value={aiForm.geminiApiKey} onChange={(event) => setAiForm((current) => ({ ...current, geminiApiKey: event.target.value }))} placeholder={ai.geminiKeyConfigured ? "Gemini key saved. Enter to replace." : "Gemini API key"} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input type="password" value={aiForm.openaiApiKey} onChange={(event) => setAiForm((current) => ({ ...current, openaiApiKey: event.target.value }))} placeholder={ai.openaiKeyConfigured ? "OpenAI key saved. Enter to replace." : "OpenAI API key"} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input value={aiForm.tone} onChange={(event) => setAiForm((current) => ({ ...current, tone: event.target.value }))} placeholder="Tone" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input type="number" min="40" value={aiForm.maxEmailWords} onChange={(event) => setAiForm((current) => ({ ...current, maxEmailWords: event.target.value }))} placeholder="Max email words" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input type="number" min="120" value={aiForm.maxCoverLetterWords} onChange={(event) => setAiForm((current) => ({ ...current, maxCoverLetterWords: event.target.value }))} placeholder="Max cover letter words" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Fallback enabled<input type="checkbox" checked={aiForm.fallbackEnabled} onChange={(event) => setAiForm((current) => ({ ...current, fallbackEnabled: event.target.checked }))} /></label>
                <select value={aiForm.fallbackProvider} onChange={(event) => setAiForm((current) => ({ ...current, fallbackProvider: event.target.value }))} className="h-12 rounded-[0.9rem] border border-white/10 bg-[#0b1524] px-3 text-sm text-white outline-none">
                  <option value="">No fallback provider</option>
                  {Object.entries(providerLabels).map(([provider, label]) => <option key={provider} value={provider}>{label}</option>)}
                </select>
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Require admin approval<input type="checkbox" checked={aiForm.requireAdminApproval} onChange={(event) => setAiForm((current) => ({ ...current, requireAdminApproval: event.target.checked }))} /></label>
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Attach CV<input type="checkbox" checked={aiForm.attachCv} onChange={(event) => setAiForm((current) => ({ ...current, attachCv: event.target.checked }))} /></label>
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Attach cover letter PDF<input type="checkbox" checked={aiForm.attachCoverLetterPdf} onChange={(event) => setAiForm((current) => ({ ...current, attachCoverLetterPdf: event.target.checked }))} /></label>
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Auto-generate cover letter<input type="checkbox" checked={aiForm.autoGenerateCoverLetter} onChange={(event) => setAiForm((current) => ({ ...current, autoGenerateCoverLetter: event.target.checked }))} /></label>
                <label className="flex justify-between gap-3 rounded-[0.9rem] border border-white/10 p-3 text-white">Show generated prompt preview<input type="checkbox" checked={showGeneratedPromptPreview} onChange={(event) => setShowGeneratedPromptPreview(event.target.checked)} /></label>
              </div>
              {ai.allowPromptOverride ? (
                <div className="mt-4 grid gap-4 rounded-[1rem] border border-amber-300/20 bg-amber-300/10 p-4">
                  <p className="text-sm text-amber-100">Prompt override is enabled by environment configuration. Leave these blank to use the dynamic prompt engine.</p>
                  <textarea value={aiForm.systemPrompt} onChange={(event) => setAiForm((current) => ({ ...current, systemPrompt: event.target.value }))} rows={5} placeholder="Optional system prompt override" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <textarea value={aiForm.recruiterEmailPrompt} onChange={(event) => setAiForm((current) => ({ ...current, recruiterEmailPrompt: event.target.value }))} rows={5} placeholder="Optional recruiter email prompt override" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                  <textarea value={aiForm.coverLetterPrompt} onChange={(event) => setAiForm((current) => ({ ...current, coverLetterPrompt: event.target.value }))} rows={5} placeholder="Optional cover letter prompt override" className="w-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none" />
                </div>
              ) : null}
              {showGeneratedPromptPreview ? (
                <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Generated Prompt Preview</h3>
                      <p className="mt-1 text-sm text-[#9fb1c7]">Read-only preview from the dynamic prompt engine. Use Preview Email or Preview Cover Letter to refresh it.</p>
                    </div>
                    <button onClick={() => previewAi("email")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">Refresh Preview</button>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-[#07111d] p-3 text-xs text-[#cfe4f7]">{aiPreview.promptPreview?.systemPrompt || "No system prompt preview yet."}</pre>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-[#07111d] p-3 text-xs text-[#cfe4f7]">{aiPreview.promptPreview?.emailPrompt || aiPreview.promptPreview?.coverLetterPrompt || "No generated task prompt preview yet."}</pre>
                  </div>
                </div>
              ) : null}
              {(aiPreview.email || aiPreview.coverLetterText) ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"><h3 className="font-semibold text-white">Email Preview</h3><p className="mt-2 text-sm font-semibold text-[#dff7ff]">{aiPreview.email?.subject || "No subject"}</p><pre className="mt-3 whitespace-pre-wrap text-sm text-[#cfe4f7]">{aiPreview.email?.body || "No email preview yet."}</pre></div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"><h3 className="font-semibold text-white">Cover Letter Preview</h3><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-sm text-[#cfe4f7]">{aiPreview.coverLetterText || "No cover letter preview yet."}</pre></div>
                </div>
              ) : null}
            </ModuleState>
          </section>
        )}

        {activeTab === "email" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.email.loading} error={state.email.error} empty={!email}>
              <h2 className="text-xl font-semibold text-white">Email Settings</h2>
              <p className="mt-2 text-sm text-[#9fb1c7]">Gmail app password required, normal password will not work. Open tracking can be blocked by email clients and should be used responsibly.</p>
              <p className="mt-2 text-sm text-[#dce8f6]">Password configured: {email.passwordConfigured ? "true" : "false"}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input value={emailForm.fromName} onChange={(event) => setEmailForm((current) => ({ ...current, fromName: event.target.value }))} placeholder="From name" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input value={emailForm.fromEmail} onChange={(event) => setEmailForm((current) => ({ ...current, fromEmail: event.target.value }))} placeholder="Gmail email" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input value={emailForm.smtpUsername} onChange={(event) => setEmailForm((current) => ({ ...current, smtpUsername: event.target.value }))} placeholder="Gmail SMTP username" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <input type="password" value={emailForm.smtpPassword} onChange={(event) => setEmailForm((current) => ({ ...current, smtpPassword: event.target.value }))} placeholder={email.passwordConfigured ? "App password saved. Enter to replace." : "Gmail app password"} className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
                <select value={emailForm.smtpPort} onChange={(event) => setEmailForm((current) => ({ ...current, smtpPort: Number(event.target.value) }))} className="h-11 rounded-[0.9rem] border border-white/10 bg-[#0b1524] px-3 text-sm text-white outline-none"><option value={465}>465 / secure true</option><option value={587}>587 / secure false</option></select>
                <input type="number" min="1" value={emailForm.dailySendLimit} onChange={(event) => setEmailForm((current) => ({ ...current, dailySendLimit: event.target.value }))} placeholder="Daily limit" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3"><label className="flex justify-between rounded-[0.9rem] border border-white/10 p-3 text-white">Enabled<input type="checkbox" checked={emailForm.isEnabled} onChange={(event) => setEmailForm((current) => ({ ...current, isEnabled: event.target.checked }))} /></label><label className="flex justify-between rounded-[0.9rem] border border-white/10 p-3 text-white">Open tracking<input type="checkbox" checked={emailForm.openTrackingEnabled} onChange={(event) => setEmailForm((current) => ({ ...current, openTrackingEnabled: event.target.checked }))} /></label><label className="flex justify-between rounded-[0.9rem] border border-white/10 p-3 text-white">Click tracking<input type="checkbox" checked={emailForm.clickTrackingEnabled} onChange={(event) => setEmailForm((current) => ({ ...current, clickTrackingEnabled: event.target.checked }))} /></label></div>
              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"><input value={emailForm.testToEmail} onChange={(event) => setEmailForm((current) => ({ ...current, testToEmail: event.target.value }))} placeholder="Test email recipient" className="h-11 rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none" /><button onClick={saveEmailSettings} className="rounded-full border border-[#6fd8ff]/30 px-4 py-3 font-semibold text-[#dff7ff]">Save Email Settings</button><button onClick={sendTestEmail} className="rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-4 py-3 font-semibold text-[#07111d]">Send Test Email</button></div>
            </ModuleState>
          </section>
        )}

        {activeTab === "events" && (
          <section className="rounded-[1.4rem] border border-white/10 bg-[#08111d]/80 p-5">
            <ModuleState loading={state.events.loading} error={state.events.error} empty={events.length === 0}>
              <p className="mb-4 text-sm text-[#9fb1c7]">Raw IP addresses are never shown. IP stored as hash.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-[#8ea7c2]"><tr><th className="p-3">Event</th><th className="p-3">Recipient</th><th className="p-3">Job</th><th className="p-3">Date/time</th><th className="p-3">Clicked URL</th><th className="p-3">User agent</th><th className="p-3">IP</th></tr></thead>
                  <tbody>{events.map((event) => <tr key={event.id} className="border-t border-white/10 text-[#dce8f6]"><td className="p-3">{event.eventType}</td><td className="p-3">{event.recipientEmail}</td><td className="p-3">{event.job?.title || "Unknown"} - {event.job?.company || ""}</td><td className="p-3">{formatDate(event.createdAt)}</td><td className="p-3">{event.url || "None"}</td><td className="p-3">{event.userAgentSummary || "Unknown"}</td><td className="p-3">{event.ipStoredAsHash ? "IP stored as hash" : "Not stored"}</td></tr>)}</tbody>
                </table>
              </div>
            </ModuleState>
          </section>
        )}
      </div>
    </AdminFixedSidebarShell>
  );
}
