"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { showChatMessageNotification } from "@/lib/browser-notifications";
import { buildPublicApiUrl, buildPublicAssetUrl, getPublicBackendUrl, getSocketServerUrl } from "@/lib/public-backend-url";
import { HiOutlineSparkles, HiOutlineUsers, HiOutlineViewGrid } from "react-icons/hi";
import { FiBarChart2, FiBookOpen, FiBriefcase, FiCode, FiDollarSign, FiEye, FiFolder, FiHelpCircle, FiImage, FiLogOut, FiMail, FiMessageSquare, FiPaperclip, FiPhone, FiSend, FiSettings, FiUpload } from "react-icons/fi";
import { getSocialIconOption, searchSocialIcons, socialIconOptions } from "@/utils/social-icons";
import { getServiceIconOption, serviceIconOptions } from "@/utils/service-icons";
import { getStatsIconOption, statsIconOptions } from "@/utils/stats-icons";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});
  const AdminAnalyticsCharts = dynamic(() => import("@/app/components/admin/admin-analytics-charts"), {
    ssr: false,
    loading: () => (
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
          className="h-[420px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]"
        />
      ))}
    </div>
  ),
});

const backendUrl = getPublicBackendUrl();
const socketServerUrl = getSocketServerUrl();

function adminFetch(input, init = {}) {
  return fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  });
}

function emptyHeroSkill() {
  return { name: "", image: "" };
}

function emptySkillItem() {
  return { name: "", image: "", percentage: 80 };
}

function emptyExperienceItem() {
  return { title: "", company: "", location: "", duration: "", description: "" };
}

function emptyEducationItem() {
  return { title: "", institution: "", department: "", duration: "", achievement: "" };
}

function emptySocialLink() {
  return { icon: "facebook", label: "", image: "", link: "" };
}

function emptyCounterItem() {
  return { label: "", highlight: "", count: "", icon: "projects" };
}

function emptyEmergencyContactItem() {
  return { label: "", name: "", icon: "whatsapp", link: "" };
}

function emptyAchievementItem() {
  return { title: "", issuer: "", date: "", type: "", image: "" };
}

function emptyPricingItem() {
  return {
    slug: "",
    name: "",
    description: "",
    price: "",
    duration: "Monthly",
    content: "",
    features: [""],
    status: true,
    isPopular: false,
  };
}

function emptyFaqItem() {
  return {
    question: "",
    answer: "",
    status: true,
  };
}

function emptyProjectButton() {
  return { text: "", link: "" };
}

function emptyProjectItem() {
  return {
    id: "",
    slug: "",
    name: "",
    description: "",
    content: "",
    role: "",
    image: "",
    tools: [""],
    code: "",
    demo: "",
    views: 0,
    impressionCount: 0,
    buttons: [emptyProjectButton()],
  };
}

function emptyServiceItem() {
  return {
    slug: "",
    name: "",
    impression: "",
    impressionCount: 0,
    description: "",
    content: "",
    isFeatured: false,
    icon: "briefcase",
    status: true,
    views: 0,
    comments: [emptyServiceComment()],
  };
}

function emptyServiceComment() {
  return {
    photo: "/profile.png",
    comment: "",
    impression: "",
    replies: [emptyServiceReply()],
  };
}

function emptyServiceReply() {
  return {
    reply: "",
    impression: "",
  };
}

function emptyTestimonialItem() {
  return {
    name: "",
    content: "",
    image: "/profile.png",
    company: "",
    position: "",
    stars: 5,
    status: true,
  };
}

function emptySiteSettings() {
  return {
    websiteTitle: "",
    websiteDescription: "",
    navTitle: "",
    navSubtitle: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoImage: "",
    websiteIcon: "",
    contactEmail: "",
    mobileNumber: "",
    footerText: "",
    canonicalUrl: "",
    googleSiteVerification: "",
    googleVerificationFilePath: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    adsenseHeadCode: "",
    adsensePageTopCode: "",
    adsenseBetweenSectionsCode: "",
    adsensePageBottomCode: "",
    robotsIndexingEnabled: true,
    robotsFollowEnabled: true,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    smtpSecure: false,
    smtpFromEmail: "",
    smtpFromName: "",
    smtpReplyToEmail: "",
    smtpToEmail: "",
  };
}

function emptyAnalytics() {
  return {
    source: "simulated",
    connected: false,
    propertyId: "",
    measurementId: "",
    activeUsers: 0,
    todayUsers: 0,
    last7DaysUsers: 0,
    last30DaysUsers: 0,
    growth: [],
    weekly: [],
    visitors: [],
    fetchedAt: "",
    note: "Analytics are loading.",
  };
}

function formatMetricValue(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatVisitorLastSeen(value) {
  if (!value) {
    return "Unknown";
  }

  const lastSeenTime = new Date(value).getTime();
  if (!Number.isFinite(lastSeenTime)) {
    return "Unknown";
  }

  const elapsedSeconds = Math.max(0, Math.round((Date.now() - lastSeenTime) / 1000));
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds || 1}s ago`;
  }

  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  return new Date(value).toLocaleString();
}

function formatThreadTimestamp(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
}

function sortMessagesByLatest(items) {
  function getPriority(item) {
    if (item?.status === "solved") {
      return 2;
    }

    return item?.isNew ? 0 : 1;
  }

  return [...(items || [])].sort((a, b) => {
    const priorityDifference = getPriority(a) - getPriority(b);
    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return (
      new Date(b?.lastMessageAt || b?.createdAt || 0).getTime() -
      new Date(a?.lastMessageAt || a?.createdAt || 0).getTime()
    );
  });
}

function emptyDashboardSummary() {
  return {
    configuredPercentage: 0,
    workspace: {
      title: "Portfolio command center",
      description: "Dashboard data is loading from your portfolio content.",
      badge: "Portfolio Admin",
    },
    quickActions: [],
    statusCards: [],
    collectionHealth: [],
    snapshot: [],
    recentMessages: [],
  };
}

function emptyTwoFactorSetup() {
  return {
    qrCodeDataUrl: "",
    manualEntryKey: "",
  };
}

function cloneServiceItem(service) {
  return JSON.parse(JSON.stringify(service));
}

function cloneProjectItem(project) {
  return JSON.parse(JSON.stringify(project));
}

function hasCommentContent(comment) {
  return Boolean(comment?.id || String(comment?.comment || "").trim());
}

function hasReplyContent(reply) {
  return Boolean(reply?.id || String(reply?.reply || "").trim());
}

function mergeLiveServiceComment(services, serviceSlug, nextComment) {
  return services.map((service) => {
    if (service.slug !== serviceSlug) {
      return service;
    }

    const currentComments = (service.comments || []).filter(hasCommentContent);
    if (currentComments.some((item) => item.id === nextComment.id)) {
      return service;
    }

    return {
      ...service,
      comments: [
        ...currentComments,
        {
          ...nextComment,
          replies: (nextComment.replies || []).filter(hasReplyContent),
        },
      ],
    };
  });
}

function mergeLiveServiceReply(services, serviceSlug, commentId, nextReply) {
  return services.map((service) => {
    if (service.slug !== serviceSlug) {
      return service;
    }

    return {
      ...service,
      comments: (service.comments || []).map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        const currentReplies = (comment.replies || []).filter(hasReplyContent);
        if (currentReplies.some((item) => item.id === nextReply.id)) {
          return comment;
        }

        return {
          ...comment,
          replies: [...currentReplies, nextReply],
        };
      }),
    };
  });
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

function buildPricingPayload(sourceForm) {
  return {
    pricings: sourceForm.pricings
      .map((item) => ({
        slug: slugify(item.slug || item.name),
        name: item.name.trim(),
        description: item.description.trim(),
        price: Number(item.price) || 0,
        duration: item.duration.trim(),
        content: item.content,
        features: (item.features || []).map((feature) => feature.trim()).filter(Boolean),
        status: Boolean(item.status),
        isPopular: Boolean(item.isPopular),
      }))
      .filter(
        (item) => item.slug && item.name && item.description && item.duration && item.content && item.price > 0,
      ),
  };
}

function buildFaqPayload(sourceForm) {
  return {
    faqs: sourceForm.faqs
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer,
        status: Boolean(item.status),
      }))
      .filter((item) => item.question && item.answer),
  };
}

function buildSkillsPayload(sourceForm) {
  return {
    skills: sourceForm.skills
      .map((item) => ({
        name: item.name.trim(),
        image: item.image.trim(),
        percentage: Math.max(0, Math.min(100, Number(item.percentage) || 0)),
      }))
      .filter((item) => item.name),
  };
}

function buildExperiencesPayload(sourceForm) {
  return {
    experiences: sourceForm.experiences
      .map((item) => ({
        title: item.title.trim(),
        company: item.company.trim(),
        location: item.location.trim(),
        duration: item.duration.trim(),
        description: item.description,
      }))
      .filter((item) => item.title && item.company && item.duration),
  };
}

function buildEducationsPayload(sourceForm) {
  return {
    educations: sourceForm.educations
      .map((item) => ({
        title: item.title.trim(),
        institution: item.institution.trim(),
        department: item.department.trim(),
        duration: item.duration.trim(),
        achievement: item.achievement,
      }))
      .filter((item) => item.title && item.institution && item.duration),
  };
}

function buildProjectsPayload(sourceForm) {
  return {
    projects: sourceForm.projects
      .map((item) => ({
        id: item.id,
        slug: slugify(item.name),
        name: item.name.trim(),
        description: item.description.trim(),
        content: item.content,
        role: item.role.trim(),
        image: item.image.trim(),
        tools: (item.tools || []).map((tool) => tool.trim()).filter(Boolean),
        code: item.code.trim(),
        demo: item.demo.trim(),
        views: Number(item.views) || 0,
        impressionCount: Number(item.impressionCount) || 0,
        buttons: (item.buttons || [])
          .map((button) => ({
            text: button.text.trim(),
            link: button.link.trim(),
          }))
          .filter((button) => button.text && button.link),
      }))
      .filter((item) => item.name && item.description),
  };
}

function buildServicePayload(sourceForm) {
  return {
    serviceSection: {
      title: sourceForm.serviceSectionTitle.trim(),
      subtitle: sourceForm.serviceSectionSubtitle.trim(),
    },
    services: sourceForm.services
      .map((item) => ({
        slug: slugify(item.slug || item.name),
        name: item.name.trim(),
        impression: item.impression.trim(),
        impressionCount: Number(item.impressionCount) || 0,
        description: item.description.trim(),
        content: item.content,
        isFeatured: Boolean(item.isFeatured),
        icon: item.icon.trim(),
        status: Boolean(item.status),
        views: Number(item.views) || 0,
        comments: (item.comments || [])
          .map((comment) => ({
            photo: comment.photo.trim() || "/profile.png",
            comment: comment.comment.trim(),
            impression: comment.impression.trim(),
            replies: (comment.replies || [])
              .map((reply) => ({
                reply: reply.reply.trim(),
                impression: reply.impression.trim(),
              }))
              .filter((reply) => reply.reply),
          }))
          .filter((comment) => comment.comment),
      }))
      .filter((item) => item.name && item.slug && item.description),
  };
}

function buildTestimonialsPayload(sourceForm) {
  return {
    testimonials: sourceForm.testimonials
      .map((item) => ({
        name: item.name.trim(),
        content: item.content,
        image: item.image.trim(),
        company: item.company.trim(),
        position: item.position.trim(),
        stars: Math.max(1, Math.min(5, Number(item.stars) || 5)),
        status: Boolean(item.status),
      }))
      .filter((item) => item.name && item.content && item.company),
  };
}

function buildAchievementsPayload(sourceForm) {
  return {
    achievements: sourceForm.achievements
      .map((item) => ({
        title: item.title.trim(),
        issuer: item.issuer.trim(),
        date: item.date.trim(),
        type: item.type.trim(),
        image: item.image.trim(),
      }))
      .filter((item) => item.title && item.issuer && item.date && item.type),
  };
}

function buildSiteSettingsPayload(sourceForm) {
  return {
    siteSettings: {
      websiteTitle: sourceForm.siteSettings.websiteTitle.trim(),
      websiteDescription: sourceForm.siteSettings.websiteDescription.trim(),
      navTitle: sourceForm.siteSettings.navTitle.trim(),
      navSubtitle: sourceForm.siteSettings.navSubtitle.trim(),
      seoTitle: sourceForm.siteSettings.seoTitle.trim(),
      seoDescription: sourceForm.siteSettings.seoDescription.trim(),
      seoKeywords: sourceForm.siteSettings.seoKeywords.trim(),
      seoImage: sourceForm.siteSettings.seoImage.trim(),
      websiteIcon: sourceForm.siteSettings.websiteIcon.trim(),
      contactEmail: sourceForm.siteSettings.contactEmail.trim(),
      mobileNumber: sourceForm.siteSettings.mobileNumber.trim(),
      footerText: sourceForm.siteSettings.footerText.trim(),
      canonicalUrl: sourceForm.siteSettings.canonicalUrl.trim(),
      googleSiteVerification: sourceForm.siteSettings.googleSiteVerification.trim(),
      googleVerificationFilePath: sourceForm.siteSettings.googleVerificationFilePath.trim(),
      googleAnalyticsId: sourceForm.siteSettings.googleAnalyticsId.trim(),
      googleTagManagerId: sourceForm.siteSettings.googleTagManagerId.trim(),
      adsenseHeadCode: sourceForm.siteSettings.adsenseHeadCode.trim(),
      adsensePageTopCode: sourceForm.siteSettings.adsensePageTopCode.trim(),
      adsenseBetweenSectionsCode: sourceForm.siteSettings.adsenseBetweenSectionsCode.trim(),
      adsensePageBottomCode: sourceForm.siteSettings.adsensePageBottomCode.trim(),
      robotsIndexingEnabled: Boolean(sourceForm.siteSettings.robotsIndexingEnabled),
      robotsFollowEnabled: Boolean(sourceForm.siteSettings.robotsFollowEnabled),
      smtpHost: sourceForm.siteSettings.smtpHost.trim(),
      smtpPort: Number(sourceForm.siteSettings.smtpPort) || 587,
      smtpUser: sourceForm.siteSettings.smtpUser.trim(),
      smtpPass: sourceForm.siteSettings.smtpPass,
      smtpSecure: Boolean(sourceForm.siteSettings.smtpSecure),
      smtpFromEmail: sourceForm.siteSettings.smtpFromEmail.trim(),
      smtpFromName: sourceForm.siteSettings.smtpFromName.trim(),
      smtpReplyToEmail: sourceForm.siteSettings.smtpReplyToEmail.trim(),
      smtpToEmail: sourceForm.siteSettings.smtpToEmail.trim(),
    },
  };
}

const tabs = [
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

export function AdminSectionPage({ section = "dashboard" }) {
  const analyticsVisitorsPerPage = 10;
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [isTwoFactorSubmitting, setIsTwoFactorSubmitting] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(emptyTwoFactorSetup());
  const [twoFactorEnableCode, setTwoFactorEnableCode] = useState("");
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [articleCategories, setArticleCategories] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newArticleCategory, setNewArticleCategory] = useState("");
  const [editingArticleCategoryId, setEditingArticleCategoryId] = useState(null);
  const [articleCategoryDraft, setArticleCategoryDraft] = useState("");
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);
  const [isSavingArticleCategory, setIsSavingArticleCategory] = useState(false);
  const [deletingArticleCategoryId, setDeletingArticleCategoryId] = useState(null);
  const [isEmergencyContactsLoading, setIsEmergencyContactsLoading] = useState(false);
  const [isEmergencyContactModalOpen, setIsEmergencyContactModalOpen] = useState(false);
  const [isSavingEmergencyContact, setIsSavingEmergencyContact] = useState(false);
  const [editingEmergencyContactId, setEditingEmergencyContactId] = useState(null);
  const [emergencyContactDraft, setEmergencyContactDraft] = useState(emptyEmergencyContactItem());
  const [emergencyContactSearch, setEmergencyContactSearch] = useState("");
  const [emergencyContactActionId, setEmergencyContactActionId] = useState(null);
  const [analytics, setAnalytics] = useState(emptyAnalytics());
  const [dashboardSummary, setDashboardSummary] = useState(emptyDashboardSummary());
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [selectedAnalyticsVisitor, setSelectedAnalyticsVisitor] = useState(null);
  const [analyticsVisitorsPage, setAnalyticsVisitorsPage] = useState(1);
  const [selectedMessageThread, setSelectedMessageThread] = useState(null);
  const [messageReplyDraft, setMessageReplyDraft] = useState("");
  const [messageReplyAttachments, setMessageReplyAttachments] = useState({ photo: null, file: null });
  const [isMessageThreadLoading, setIsMessageThreadLoading] = useState(false);
  const [isSendingMessageReply, setIsSendingMessageReply] = useState(false);
  const messageReplyPhotoInputRef = useRef(null);
  const messageReplyFileInputRef = useRef(null);
  const messagesRef = useRef([]);
  const [messageActionId, setMessageActionId] = useState(null);
  const [socialSearch, setSocialSearch] = useState({});
  const [openCounterIconIndex, setOpenCounterIconIndex] = useState(null);
  const [isServiceIconDropdownOpen, setIsServiceIconDropdownOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(-1);
  const [serviceDraft, setServiceDraft] = useState(emptyServiceItem());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricingIndex, setEditingPricingIndex] = useState(-1);
  const [pricingDraft, setPricingDraft] = useState(emptyPricingItem());
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState(-1);
  const [faqDraft, setFaqDraft] = useState(emptyFaqItem());

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState(-1);
  const [testimonialDraft, setTestimonialDraft] = useState(emptyTestimonialItem());
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(-1);
  const [projectDraft, setProjectDraft] = useState(emptyProjectItem());
  const [form, setForm] = useState({
    name: "",
    profile: "",
    designation: "",
    description: "",
    resume: "",
    statsCounters: [emptyCounterItem()],
    achievements: [emptyAchievementItem()],
    skills: [emptySkillItem()],
    experiences: [emptyExperienceItem()],
    educations: [emptyEducationItem()],
    pricings: [],
    faqs: [],
    testimonials: [],
    projects: [],
    socialLinks: [emptySocialLink()],
    heroSkillsTitle: "",
    heroSkills: [emptyHeroSkill()],
    serviceSectionTitle: "",
    serviceSectionSubtitle: "",
    services: [emptyServiceItem()],
    siteSettings: emptySiteSettings(),
  });
  const activeTab = section;
  const serviceSocketSlugs = form.services
    .map((service) => String(service?.slug || "").trim().toLowerCase())
    .filter(Boolean);
  const serviceSocketKey = serviceSocketSlugs.join("|");
  const analyticsVisitors = analytics.visitors || [];
  const analyticsVisitorsTotalPages = Math.max(1, Math.ceil(analyticsVisitors.length / analyticsVisitorsPerPage));
  const analyticsVisitorsStartIndex = (analyticsVisitorsPage - 1) * analyticsVisitorsPerPage;
  const paginatedAnalyticsVisitors = analyticsVisitors.slice(
    analyticsVisitorsStartIndex,
    analyticsVisitorsStartIndex + analyticsVisitorsPerPage,
  );

  const updateAdminSession = useCallback((nextAdmin) => {
    setAdmin(nextAdmin);
    localStorage.setItem("portfolio_admin_user", JSON.stringify(nextAdmin));
  }, []);

  useEffect(() => {
    setAnalyticsVisitorsPage((current) => Math.min(current, analyticsVisitorsTotalPages));
  }, [analyticsVisitorsTotalPages]);

  const loadAdminProfile = useCallback(async (authToken) => {
    const response = await adminFetch(`${backendUrl}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load admin.");
    }

    updateAdminSession(data);
    return data;
  }, [updateAdminSession]);

  const startTwoFactorSetup = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsTwoFactorLoading(true);
      const response = await adminFetch(`${backendUrl}/api/admin/2fa/setup`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start 2FA setup.");
      }

      setTwoFactorSetup({
        qrCodeDataUrl: data.qrCodeDataUrl || "",
        manualEntryKey: data.manualEntryKey || "",
      });
      setTwoFactorEnableCode("");
    } catch (error) {
      toast.error(error.message || "Failed to start 2FA setup.");
    } finally {
      setIsTwoFactorLoading(false);
    }
  }, [token]);

  const enableTwoFactor = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!twoFactorEnableCode.trim()) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    try {
      setIsTwoFactorSubmitting(true);
      const response = await adminFetch(`${backendUrl}/api/admin/2fa/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFactorEnableCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to enable 2FA.");
      }

      updateAdminSession(data.admin);
      setTwoFactorSetup(emptyTwoFactorSetup());
      setTwoFactorEnableCode("");
      toast.success(data.message || "2FA enabled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to enable 2FA.");
    } finally {
      setIsTwoFactorSubmitting(false);
    }
  }, [token, twoFactorEnableCode, updateAdminSession]);

  const disableTwoFactor = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!twoFactorDisableCode.trim()) {
      toast.error("Enter your current 2FA code to disable it.");
      return;
    }

    try {
      setIsTwoFactorSubmitting(true);
      const response = await adminFetch(`${backendUrl}/api/admin/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFactorDisableCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to disable 2FA.");
      }

      updateAdminSession(data.admin);
      setTwoFactorSetup(emptyTwoFactorSetup());
      setTwoFactorDisableCode("");
      toast.success(data.message || "2FA disabled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to disable 2FA.");
    } finally {
      setIsTwoFactorSubmitting(false);
    }
  }, [token, twoFactorDisableCode, updateAdminSession]);

  const loadDashboard = useCallback(
    async (authToken) => {
      try {
        setIsLoading(true);
        const response = await adminFetch(`${backendUrl}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        const heroSkills = normalizeHeroSkills(data.profile?.heroSkills);

        setMessages(sortMessagesByLatest(data.messages || []));
        setDashboardSummary({
          ...emptyDashboardSummary(),
          ...(data.dashboardSummary || {}),
        });
        setForm({
          name: data.profile?.name || "",
          profile: data.profile?.profile || "",
          designation: data.profile?.designation || "",
          description: data.profile?.description || "",
          resume: data.profile?.resume || "",
          siteSettings: {
            ...emptySiteSettings(),
            ...(data.siteSettings || {}),
            smtpPort: data.siteSettings?.smtpPort || 587,
            robotsIndexingEnabled:
              typeof data.siteSettings?.robotsIndexingEnabled === "boolean"
                ? data.siteSettings.robotsIndexingEnabled
                : true,
            robotsFollowEnabled:
              typeof data.siteSettings?.robotsFollowEnabled === "boolean"
                ? data.siteSettings.robotsFollowEnabled
                : true,
            smtpSecure:
              typeof data.siteSettings?.smtpSecure === "boolean" ? data.siteSettings.smtpSecure : false,
          },
          statsCounters:
            Array.isArray(data.statsCounters) && data.statsCounters.length
              ? data.statsCounters.map((item) => ({
                  label: item?.label || "",
                  highlight: item?.highlight || "",
                  count: item?.count || "",
                  icon: item?.icon || "projects",
                }))
              : [emptyCounterItem()],
          achievements:
            Array.isArray(data.achievements) && data.achievements.length
              ? data.achievements.map((item) => ({
                  title: item?.title || "",
                  issuer: item?.issuer || "",
                  date: item?.date || "",
                  type: item?.type || "",
                  image: item?.image || "",
                }))
              : [emptyAchievementItem()],
          skills:
            Array.isArray(data.skills) && data.skills.length
              ? data.skills.map((item) => ({
                  name: item?.name || "",
                  image: item?.image || "",
                  percentage: item?.percentage || 0,
                }))
              : [emptySkillItem()],
          experiences:
            Array.isArray(data.experiences) && data.experiences.length
              ? data.experiences.map((item) => ({
                  title: item?.title || "",
                  company: item?.company || "",
                  location: item?.location || "",
                  duration: item?.duration || "",
                  description: item?.description || "",
                }))
              : [emptyExperienceItem()],
          educations:
            Array.isArray(data.educations) && data.educations.length
              ? data.educations.map((item) => ({
                  title: item?.title || "",
                  institution: item?.institution || "",
                  department: item?.department || "",
                  duration: item?.duration || "",
                  achievement: item?.achievement || "",
                }))
              : [emptyEducationItem()],
          pricings:
            Array.isArray(data.pricings) && data.pricings.length
              ? data.pricings.map((item) => ({
                  slug: item?.slug || "",
                  name: item?.name || "",
                  description: item?.description || "",
                  price: item?.price || "",
                  duration: item?.duration || "Monthly",
                  content: item?.content || "",
                  features:
                    Array.isArray(item?.features) && item.features.length ? item.features : [""],
                  status: typeof item?.status === "boolean" ? item.status : true,
                  isPopular: Boolean(item?.isPopular),
                }))
              : [],
          faqs:
            Array.isArray(data.faqs) && data.faqs.length
              ? data.faqs.map((item) => ({
                  question: item?.question || "",
                  answer: item?.answer || "",
                  status: typeof item?.status === "boolean" ? item.status : true,
                }))
              : [],
          testimonials:
            Array.isArray(data.testimonials) && data.testimonials.length
              ? data.testimonials.map((item) => ({
                  name: item?.name || "",
                  content: item?.content || "",
                  image: item?.image || "/profile.png",
                  company: item?.company || "",
                  position: item?.position || "",
                  stars: item?.stars || 5,
                  status: typeof item?.status === "boolean" ? item.status : true,
                }))
              : [],
          projects:
            Array.isArray(data.projects) && data.projects.length
              ? data.projects.map((item) => ({
                  id: item?.id || "",
                  slug: item?.slug || "",
                  name: item?.name || "",
                  description: item?.description || "",
                  content: item?.content || "",
                  role: item?.role || "",
                  image: item?.image || "",
                  tools: Array.isArray(item?.tools) && item.tools.length ? item.tools : [""],
                  code: item?.code || "",
                  demo: item?.demo || "",
                  views: item?.views || 0,
                  impressionCount: item?.impressionCount || 0,
                  buttons:
                    Array.isArray(item?.buttons) && item.buttons.length
                      ? item.buttons.map((button) => ({
                          text: button?.text || "",
                          link: button?.link || "",
                        }))
                      : [
                          ...(item?.demo ? [{ text: "Live Demo", link: item.demo }] : []),
                          ...(item?.code ? [{ text: "Code", link: item.code }] : []),
                        ].length
                        ? [
                            ...(item?.demo ? [{ text: "Live Demo", link: item.demo }] : []),
                            ...(item?.code ? [{ text: "Code", link: item.code }] : []),
                          ]
                        : [emptyProjectButton()],
                }))
              : [],
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
          serviceSectionTitle: data.serviceSection?.title || "",
          serviceSectionSubtitle: data.serviceSection?.subtitle || "",
          services:
            Array.isArray(data.services) && data.services.length
              ? data.services.map((item) => ({
                  slug: item?.slug || "",
                  name: item?.name || "",
                  impression: item?.impression || "",
                  impressionCount: item?.impressionCount || 0,
                  description: item?.description || "",
                  content: item?.content || "",
                  isFeatured: Boolean(item?.isFeatured),
                  icon: item?.icon || "briefcase",
                  status: typeof item?.status === "boolean" ? item.status : true,
                  views: item?.views || 0,
                  comments:
                    Array.isArray(item?.comments) && item.comments.length
                      ? item.comments.map((comment) => ({
                          photo: comment?.photo || "/profile.png",
                          comment: comment?.comment || "",
                          impression: comment?.impression || "",
                          replies:
                            Array.isArray(comment?.replies) && comment.replies.length
                              ? comment.replies.map((reply) => ({
                                  reply: reply?.reply || "",
                                  impression: reply?.impression || "",
                                }))
                              : [emptyServiceReply()],
                        }))
                      : [emptyServiceComment()],
                }))
              : [emptyServiceItem()],
        });
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard.");
        localStorage.removeItem("portfolio_admin_token");
        localStorage.removeItem("portfolio_admin_user");
        router.replace("/login/admin");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const loadAnalytics = useCallback(
    async (authToken, options = {}) => {
      const shouldShowLoading = !options.silent;

      try {
        if (shouldShowLoading) {
          setIsAnalyticsLoading(true);
        }

        const response = await adminFetch(`${backendUrl}/api/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load analytics.");
        }

        const nextVisitors = Array.isArray(data.visitors) ? data.visitors : [];

        setAnalytics({
          ...emptyAnalytics(),
          ...data,
          growth: Array.isArray(data.growth) ? data.growth : [],
          weekly: Array.isArray(data.weekly) ? data.weekly : [],
          visitors: nextVisitors,
        });
        setSelectedAnalyticsVisitor((current) => {
          if (!current) {
            return current;
          }

          return nextVisitors.find((visitor) => visitor.id === current.id) || current;
        });
      } catch (error) {
        setAnalytics((current) => ({
          ...current,
          note: error.message || "Failed to load analytics.",
        }));
      } finally {
        if (shouldShowLoading) {
          setIsAnalyticsLoading(false);
        }
      }
    },
    [],
  );

  const loadArticles = useCallback(async (authToken) => {
    if (!authToken) {
      return;
    }

    try {
      setIsArticlesLoading(true);
      const response = await adminFetch(`${backendUrl}/api/admin/articles`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load articles.");
      }

      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (error) {
      toast.error(error.message || "Failed to load articles.");
    } finally {
      setIsArticlesLoading(false);
    }
  }, []);

  const loadArticleCategories = useCallback(async (authToken) => {
    if (!authToken) {
      return;
    }

    try {
      const response = await adminFetch(`${backendUrl}/api/admin/article-categories`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load article categories.");
      }

      setArticleCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      toast.error(error.message || "Failed to load article categories.");
    }
  }, []);

  const createArticleCategory = useCallback(async () => {
    if (!token || !newArticleCategory.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setIsSavingArticleCategory(true);
      const response = await adminFetch(`${backendUrl}/api/admin/article-categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newArticleCategory.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create article category.");
      }

      setNewArticleCategory("");
      setArticleCategories((current) =>
        [...current, data.category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success("Article category created successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to create article category.");
    } finally {
      setIsSavingArticleCategory(false);
    }
  }, [newArticleCategory, token]);

  const openArticleCategoryEditor = useCallback((category) => {
    setEditingArticleCategoryId(category?.id ?? null);
    setArticleCategoryDraft(category?.name || "");
  }, []);

  const closeArticleCategoryEditor = useCallback(() => {
    setEditingArticleCategoryId(null);
    setArticleCategoryDraft("");
  }, []);

  const updateArticleCategory = useCallback(async () => {
    if (!token || !editingArticleCategoryId || !articleCategoryDraft.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setIsSavingArticleCategory(true);
      const response = await adminFetch(`${backendUrl}/api/admin/article-categories/${editingArticleCategoryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: articleCategoryDraft.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update article category.");
      }

      setArticleCategories((current) =>
        current
          .map((category) => (category.id === data.category.id ? data.category : category))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      closeArticleCategoryEditor();
      toast.success("Article category updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update article category.");
    } finally {
      setIsSavingArticleCategory(false);
    }
  }, [articleCategoryDraft, closeArticleCategoryEditor, editingArticleCategoryId, token]);

  const deleteArticleCategory = useCallback(
    async (category) => {
      if (!token || !category?.id) {
        return;
      }

      const shouldDelete = window.confirm(`Delete "${category.name}" category?`);
      if (!shouldDelete) {
        return;
      }

      try {
        setDeletingArticleCategoryId(category.id);
        const response = await adminFetch(`${backendUrl}/api/admin/article-categories/${category.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete article category.");
        }

        setArticleCategories((current) => current.filter((item) => item.id !== category.id));
        if (editingArticleCategoryId === category.id) {
          closeArticleCategoryEditor();
        }
        toast.success("Article category deleted successfully.");
      } catch (error) {
        toast.error(error.message || "Failed to delete article category.");
      } finally {
        setDeletingArticleCategoryId(null);
      }
    },
    [closeArticleCategoryEditor, editingArticleCategoryId, token],
  );

  const loadEmergencyContacts = useCallback(async (authToken) => {
    if (!authToken) {
      return;
    }

    try {
      setIsEmergencyContactsLoading(true);
      const response = await adminFetch(`${backendUrl}/api/admin/emergency-contacts`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load emergency contacts.");
      }

      setEmergencyContacts(Array.isArray(data.contacts) ? data.contacts : []);
    } catch (error) {
      toast.error(error.message || "Failed to load emergency contacts.");
    } finally {
      setIsEmergencyContactsLoading(false);
    }
  }, []);

  const deleteArticle = useCallback(
    async (article) => {
      if (!token || !article?.id) {
        return;
      }

      const shouldDelete = window.confirm(`Delete "${article.title}" article?`);
      if (!shouldDelete) {
        return;
      }

      try {
        setDeletingArticleId(article.id);
        const response = await adminFetch(`${backendUrl}/api/admin/articles/${article.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete article.");
        }

        setArticles((current) => current.filter((item) => item.id !== article.id));
        toast.success("Article deleted successfully.");
      } catch (error) {
        toast.error(error.message || "Failed to delete article.");
      } finally {
        setDeletingArticleId(null);
      }
    },
    [token],
  );

  const openEmergencyContactModal = useCallback((contact = null) => {
    setEditingEmergencyContactId(contact?.id ?? null);
    setEmergencyContactDraft(
      contact
        ? {
            label: contact.label || "",
            name: contact.name || "",
            icon: contact.icon || "whatsapp",
            link: contact.link || "",
          }
        : emptyEmergencyContactItem(),
    );
    setEmergencyContactSearch("");
    setIsEmergencyContactModalOpen(true);
  }, []);

  const closeEmergencyContactModal = useCallback(() => {
    setIsEmergencyContactModalOpen(false);
    setEditingEmergencyContactId(null);
    setEmergencyContactDraft(emptyEmergencyContactItem());
    setEmergencyContactSearch("");
  }, []);

  const saveEmergencyContact = useCallback(async () => {
    if (
      !token ||
      !emergencyContactDraft.label.trim() ||
      !emergencyContactDraft.name.trim() ||
      !emergencyContactDraft.icon.trim() ||
      !emergencyContactDraft.link.trim()
    ) {
      toast.error("Label, name, icon, and link are required.");
      return;
    }

    try {
      setIsSavingEmergencyContact(true);
      const response = await adminFetch(
        `${backendUrl}/api/admin/emergency-contacts${editingEmergencyContactId ? `/${editingEmergencyContactId}` : ""}`,
        {
          method: editingEmergencyContactId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: emergencyContactDraft.label.trim(),
            name: emergencyContactDraft.name.trim(),
            icon: emergencyContactDraft.icon.trim(),
            link: emergencyContactDraft.link.trim(),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save emergency contact.");
      }

      setEmergencyContacts((current) => {
        const nextContacts = editingEmergencyContactId
          ? current.map((item) => (item.id === editingEmergencyContactId ? data.contact : item))
          : [...current, data.contact];

        return nextContacts.sort((a, b) => {
          const sortDifference = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
          if (sortDifference !== 0) {
            return sortDifference;
          }

          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
      });
      closeEmergencyContactModal();
      toast.success(editingEmergencyContactId ? "Emergency contact updated successfully." : "Emergency contact created successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to save emergency contact.");
    } finally {
      setIsSavingEmergencyContact(false);
    }
  }, [closeEmergencyContactModal, editingEmergencyContactId, emergencyContactDraft.icon, emergencyContactDraft.label, emergencyContactDraft.link, emergencyContactDraft.name, token]);

  const deleteEmergencyContact = useCallback(
    async (contactId) => {
      if (!token || !contactId) {
        return;
      }

      try {
        setEmergencyContactActionId(contactId);
        const response = await adminFetch(`${backendUrl}/api/admin/emergency-contacts/${contactId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete emergency contact.");
        }

        setEmergencyContacts((current) => current.filter((item) => item.id !== contactId));
        toast.success("Emergency contact deleted successfully.");
      } catch (error) {
        toast.error(error.message || "Failed to delete emergency contact.");
      } finally {
        setEmergencyContactActionId(null);
      }
    },
    [token],
  );

  const loadMessageThread = useCallback(
    async (authToken, messageId) => {
      if (!authToken || !messageId) {
        return;
      }

      try {
        setIsMessageThreadLoading(true);
        const response = await adminFetch(`${backendUrl}/api/admin/messages/${messageId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load message thread.");
        }

        setSelectedMessageThread(data.message || null);
      } catch (error) {
        toast.error(error.message || "Failed to load message thread.");
      } finally {
        setIsMessageThreadLoading(false);
      }
    },
    [],
  );

  const sendAdminMessageReply = useCallback(
    async (authToken) => {
      if (
        !authToken ||
        !selectedMessageThread?.id ||
        (!messageReplyDraft.trim() && !messageReplyAttachments.photo && !messageReplyAttachments.file)
      ) {
        return;
      }

      try {
        setIsSendingMessageReply(true);
        const formData = new FormData();
        formData.append("message", messageReplyDraft.trim());

        if (messageReplyAttachments.photo) {
          formData.append("photo", messageReplyAttachments.photo);
        }

        if (messageReplyAttachments.file) {
          formData.append("file", messageReplyAttachments.file);
        }

        const response = await adminFetch(`${backendUrl}/api/admin/messages/${selectedMessageThread.id}/replies`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to send reply.");
        }

        setMessageReplyDraft("");
        setMessageReplyAttachments({ photo: null, file: null });
        if (messageReplyPhotoInputRef.current) {
          messageReplyPhotoInputRef.current.value = "";
        }
        if (messageReplyFileInputRef.current) {
          messageReplyFileInputRef.current.value = "";
        }
        setSelectedMessageThread((current) => {
          if (!current || !data.data) {
            return current;
          }

          const exists = (current.chatMessages || []).some((item) => item.id === data.data.id);
          if (exists) {
            return current;
          }

          return {
            ...current,
            chatMessages: [...(current.chatMessages || []), data.data],
            messageCount: Number(current.messageCount || 0) + 1,
            lastMessageAt: data.data.createdAt,
            latestReply: data.data,
          };
        });
      } catch (error) {
        toast.error(error.message || "Failed to send reply.");
      } finally {
        setIsSendingMessageReply(false);
      }
    },
    [messageReplyAttachments.file, messageReplyAttachments.photo, messageReplyDraft, selectedMessageThread],
  );

  const updateMessageStatus = useCallback(
    async (authToken, messageId, status) => {
      if (!authToken || !messageId) {
        return;
      }

      try {
        setMessageActionId(messageId);
        const response = await adminFetch(`${backendUrl}/api/admin/messages/${messageId}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update ticket status.");
        }

        setMessages((current) =>
          sortMessagesByLatest(
            current.map((message) => (message.id === messageId ? { ...message, ...data.data } : message)),
          ),
        );
        setSelectedMessageThread((current) =>
          current && current.id === messageId ? { ...current, ...data.data } : current,
        );
      } catch (error) {
        toast.error(error.message || "Failed to update ticket status.");
      } finally {
        setMessageActionId(null);
      }
    },
    [],
  );

  const deleteMessageTicket = useCallback(
    async (authToken, messageId) => {
      if (!authToken || !messageId) {
        return;
      }

      try {
        setMessageActionId(messageId);
        const response = await adminFetch(`${backendUrl}/api/admin/messages/${messageId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete ticket.");
        }

        setMessages((current) => current.filter((message) => message.id !== messageId));
        setSelectedMessageThread((current) => (current?.id === messageId ? null : current));
        setMessageReplyDraft("");
      } catch (error) {
        toast.error(error.message || "Failed to delete ticket.");
      } finally {
        setMessageActionId(null);
      }
    },
    [],
  );

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

    loadAdminProfile(savedToken).catch(() => {
      localStorage.removeItem("portfolio_admin_token");
      localStorage.removeItem("portfolio_admin_user");
      router.replace("/login/admin");
    });
    loadDashboard(savedToken);
    loadAnalytics(savedToken);
    if (section === "artical" || section === "artical-categories") {
      loadArticles(savedToken);
      loadArticleCategories(savedToken);
    }
    if (section === "contact") {
      loadEmergencyContacts(savedToken);
    }
  }, [loadAdminProfile, loadAnalytics, loadArticleCategories, loadArticles, loadDashboard, loadEmergencyContacts, router, section]);

  useEffect(() => {
    if (!["artical", "artical-categories"].includes(activeTab) || !token) {
      return;
    }

    loadArticles(token);
    loadArticleCategories(token);
  }, [activeTab, loadArticleCategories, loadArticles, token]);

  useEffect(() => {
    if (activeTab !== "contact" || !token) {
      return;
    }

    loadEmergencyContacts(token);
  }, [activeTab, loadEmergencyContacts, token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      loadAnalytics(token, { silent: true });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadAnalytics, token]);

  useEffect(() => {
    if (activeTab !== "services") {
      return undefined;
    }

    const serviceSlugs = serviceSocketKey ? serviceSocketKey.split("|").filter(Boolean) : [];

    if (!serviceSlugs.length) {
      return undefined;
    }

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    serviceSlugs.forEach((slug) => {
      socket.emit("service:join", slug);
    });

    socket.on("service:comment_created", (payload) => {
      const normalizedSlug = String(payload?.serviceSlug || "").trim().toLowerCase();
      if (!normalizedSlug || !payload?.comment) {
        return;
      }

      setForm((current) => ({
        ...current,
        services: mergeLiveServiceComment(current.services, normalizedSlug, payload.comment),
      }));

      setServiceDraft((current) => {
        if (String(current?.slug || "").trim().toLowerCase() !== normalizedSlug) {
          return current;
        }

        return {
          ...current,
          comments: mergeLiveServiceComment(
            [{ ...current, comments: current.comments || [] }],
            normalizedSlug,
            payload.comment,
          )[0].comments,
        };
      });
    });

    socket.on("service:reply_created", (payload) => {
      const normalizedSlug = String(payload?.serviceSlug || "").trim().toLowerCase();
      if (!normalizedSlug || !payload?.reply || !payload?.commentId) {
        return;
      }

      setForm((current) => ({
        ...current,
        services: mergeLiveServiceReply(current.services, normalizedSlug, payload.commentId, payload.reply),
      }));

      setServiceDraft((current) => {
        if (String(current?.slug || "").trim().toLowerCase() !== normalizedSlug) {
          return current;
        }

        return {
          ...current,
          comments: mergeLiveServiceReply(
            [{ ...current, comments: current.comments || [] }],
            normalizedSlug,
            payload.commentId,
            payload.reply,
          )[0].comments,
        };
      });
    });

    return () => {
      serviceSlugs.forEach((slug) => {
        socket.emit("service:leave", slug);
      });
      socket.disconnect();
    };
  }, [activeTab, serviceSocketKey]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    if (selectedMessageThread?.id) {
      socket.emit("contact:admin_join", {
        messageId: selectedMessageThread.id,
        token,
      });
    }

    socket.on("contact:ticket_created", (payload) => {
      if (!payload?.ticket?.id) {
        return;
      }

      setMessages((current) => {
        const exists = current.some((item) => item.id === payload.ticket.id);
        if (exists) {
          return current;
        }

        return sortMessagesByLatest([
          {
            ...payload.ticket,
            messageCount: (payload.ticket.chatMessages || []).length,
            lastMessageAt:
              payload.ticket.chatMessages?.[payload.ticket.chatMessages.length - 1]?.createdAt ||
              payload.ticket.createdAt,
            latestReply:
              payload.ticket.chatMessages?.[payload.ticket.chatMessages.length - 1] || null,
          },
          ...current,
        ]);
      });
    });

    socket.on("contact:message_created", (payload) => {
      if (!payload?.ticketId || !payload?.message) {
        return;
      }

      const isAdminMessage = payload.message.senderType === "admin";

      if (!isAdminMessage) {
        const matchingTicket = messagesRef.current.find((item) => item.id === payload.ticketId);
        showChatMessageNotification({
          audience: "admin",
          senderName: payload.message.senderName || matchingTicket?.name,
          ticketId: payload.ticketId,
          message: payload.message.message,
          tag: `admin-inbox-${payload.message.id}`,
        });
      }

      setMessages((current) =>
        sortMessagesByLatest(
          current.map((message) =>
            message.id === payload.ticketId
              ? {
                  ...message,
                  lastMessageAt: payload.message.createdAt,
                  messageCount: Number(message.messageCount || 0) + 1,
                  latestReply: payload.message,
                  isNew: payload.message.senderType === "admin" ? false : message.isNew,
                }
              : message,
          ),
        ),
      );

      setSelectedMessageThread((current) => {
        if (!current || current.id !== payload.ticketId) {
          return current;
        }

        const exists = (current.chatMessages || []).some((item) => item.id === payload.message.id);
        if (exists) {
          return current;
        }

        return {
          ...current,
          chatMessages: [...(current.chatMessages || []), payload.message],
          lastMessageAt: payload.message.createdAt,
          messageCount: Number(current.messageCount || 0) + 1,
          latestReply: payload.message,
          isNew: payload.message.senderType === "admin" ? false : current.isNew,
        };
      });
    });

    return () => {
      if (selectedMessageThread?.id) {
        socket.emit("contact:admin_leave", {
          messageId: selectedMessageThread.id,
        });
      }
      socket.disconnect();
    };
  }, [selectedMessageThread?.id, token]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSiteSettingsField(key, value) {
    setForm((current) => ({
      ...current,
      siteSettings: {
        ...current.siteSettings,
        [key]: value,
      },
    }));
  }

  function updateHeroSkill(index, key, value) {
    setForm((current) => ({
      ...current,
      heroSkills: current.heroSkills.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateSocialLink(index, key, value) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateCounterItem(index, key, value) {
    setForm((current) => ({
      ...current,
      statsCounters: current.statsCounters.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateAchievementItem(index, key, value) {
    setForm((current) => ({
      ...current,
      achievements: current.achievements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateSkillItem(index, key, value) {
    setForm((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateExperienceItem(index, key, value) {
    setForm((current) => ({
      ...current,
      experiences: current.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateEducationItem(index, key, value) {
    setForm((current) => ({
      ...current,
      educations: current.educations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updatePricingDraft(key, value) {
    setPricingDraft((current) => ({ ...current, [key]: value }));
  }

  function updateFaqDraft(key, value) {
    setFaqDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTestimonialDraft(key, value) {
    setTestimonialDraft((current) => ({ ...current, [key]: value }));
  }

  function updateProjectDraft(key, value) {
    setProjectDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePricingFeature(index, value) {
    setPricingDraft((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature,
      ),
    }));
  }

  function updateServiceItem(index, key, value) {
    setForm((current) => ({
      ...current,
      services: current.services.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function updateServiceDraft(key, value) {
    setServiceDraft((current) => ({ ...current, [key]: value }));
  }

  function updateProjectTool(index, value) {
    setProjectDraft((current) => ({
      ...current,
      tools: current.tools.map((tool, toolIndex) => (toolIndex === index ? value : tool)),
    }));
  }

  function updateProjectButton(index, key, value) {
    setProjectDraft((current) => ({
      ...current,
      buttons: current.buttons.map((button, buttonIndex) =>
        buttonIndex === index ? { ...button, [key]: value } : button,
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

  function addAchievementItem() {
    setForm((current) => ({
      ...current,
      achievements: [...current.achievements, emptyAchievementItem()],
    }));
  }

  function addSkillItem() {
    setForm((current) => ({
      ...current,
      skills: [...current.skills, emptySkillItem()],
    }));
  }

  function addExperienceItem() {
    setForm((current) => ({
      ...current,
      experiences: [...current.experiences, emptyExperienceItem()],
    }));
  }

  function addEducationItem() {
    setForm((current) => ({
      ...current,
      educations: [...current.educations, emptyEducationItem()],
    }));
  }

  function removeSkillItem(index) {
    setForm((current) => {
      const nextSkills = current.skills.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        skills: nextSkills.length ? nextSkills : [emptySkillItem()],
      };
    });
  }

  function removeExperienceItem(index) {
    setForm((current) => {
      const nextExperiences = current.experiences.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        experiences: nextExperiences.length ? nextExperiences : [emptyExperienceItem()],
      };
    });
  }

  function removeEducationItem(index) {
    setForm((current) => {
      const nextEducations = current.educations.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        educations: nextEducations.length ? nextEducations : [emptyEducationItem()],
      };
    });
  }

  function addPricingItem() {
    setEditingPricingIndex(-1);
    setPricingDraft(emptyPricingItem());
    setIsPricingModalOpen(true);
  }

  function addFaqItem() {
    setEditingFaqIndex(-1);
    setFaqDraft(emptyFaqItem());
    setIsFaqModalOpen(true);
  }

  function addTestimonialItem() {
    setEditingTestimonialIndex(-1);
    setTestimonialDraft(emptyTestimonialItem());
    setIsTestimonialModalOpen(true);
  }

  function removePricingItem(index) {
    setForm((current) => {
      const nextPricings = current.pricings.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        pricings: nextPricings,
      };
    });
  }

  function removeFaqItem(index) {
    setForm((current) => ({
      ...current,
      faqs: current.faqs.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function removeTestimonialItem(index) {
    setForm((current) => ({
      ...current,
      testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addProjectItem() {
    setEditingProjectIndex(-1);
    setProjectDraft(emptyProjectItem());
    setIsProjectModalOpen(true);
  }

  function removeProjectItem(index) {
    setForm((current) => ({
      ...current,
      projects: current.projects.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function openEditProjectModal(index) {
    setEditingProjectIndex(index);
    setProjectDraft({
      ...cloneProjectItem(form.projects[index]),
      tools:
        Array.isArray(form.projects[index]?.tools) && form.projects[index].tools.length
          ? form.projects[index].tools
          : [""],
      buttons:
        Array.isArray(form.projects[index]?.buttons) && form.projects[index].buttons.length
          ? form.projects[index].buttons
          : [emptyProjectButton()],
    });
    setIsProjectModalOpen(true);
  }

  function closeProjectModal() {
    setIsProjectModalOpen(false);
    setEditingProjectIndex(-1);
    setProjectDraft(emptyProjectItem());
  }

  function addProjectTool() {
    setProjectDraft((current) => ({
      ...current,
      tools: [...current.tools, ""],
    }));
  }

  function removeProjectTool(index) {
    setProjectDraft((current) => {
      const nextTools = current.tools.filter((_, toolIndex) => toolIndex !== index);
      return {
        ...current,
        tools: nextTools.length ? nextTools : [""],
      };
    });
  }

  function addProjectButton() {
    setProjectDraft((current) => ({
      ...current,
      buttons: [...current.buttons, emptyProjectButton()],
    }));
  }

  function removeProjectButton(index) {
    setProjectDraft((current) => {
      const nextButtons = current.buttons.filter((_, buttonIndex) => buttonIndex !== index);
      return {
        ...current,
        buttons: nextButtons.length ? nextButtons : [emptyProjectButton()],
      };
    });
  }

  function openEditPricingModal(index) {
    setEditingPricingIndex(index);
    setPricingDraft({
      ...form.pricings[index],
      features:
        Array.isArray(form.pricings[index]?.features) && form.pricings[index].features.length
          ? form.pricings[index].features
          : [""],
    });
    setIsPricingModalOpen(true);
  }

  function closePricingModal() {
    setIsPricingModalOpen(false);
    setEditingPricingIndex(-1);
    setPricingDraft(emptyPricingItem());
  }

  function openEditFaqModal(index) {
    setEditingFaqIndex(index);
    setFaqDraft({
      ...form.faqs[index],
      status: typeof form.faqs[index]?.status === "boolean" ? form.faqs[index].status : true,
    });
    setIsFaqModalOpen(true);
  }

  function closeFaqModal() {
    setIsFaqModalOpen(false);
    setEditingFaqIndex(-1);
    setFaqDraft(emptyFaqItem());
  }

  function openEditTestimonialModal(index) {
    setEditingTestimonialIndex(index);
    setTestimonialDraft({
      ...form.testimonials[index],
      image: form.testimonials[index]?.image || "/profile.png",
    });
    setIsTestimonialModalOpen(true);
  }

  function closeTestimonialModal() {
    setIsTestimonialModalOpen(false);
    setEditingTestimonialIndex(-1);
    setTestimonialDraft(emptyTestimonialItem());
  }

  function addPricingFeature() {
    setPricingDraft((current) => ({
      ...current,
      features: [...current.features, ""],
    }));
  }

  function removePricingFeature(index) {
    setPricingDraft((current) => {
      const nextFeatures = current.features.filter((_, featureIndex) => featureIndex !== index);
      return {
        ...current,
        features: nextFeatures.length ? nextFeatures : [""],
      };
    });
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

  function removeAchievementItem(index) {
    setForm((current) => {
      const nextAchievements = current.achievements.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        achievements: nextAchievements.length ? nextAchievements : [emptyAchievementItem()],
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

  function addServiceItem() {
    setEditingServiceIndex(-1);
    setServiceDraft(emptyServiceItem());
    setIsServiceModalOpen(true);
  }

  function removeServiceItem(index) {
    setForm((current) => {
      const nextServices = current.services.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        services: nextServices.length ? nextServices : [emptyServiceItem()],
      };
    });
  }

  function openEditServiceModal(index) {
    setEditingServiceIndex(index);
    setServiceDraft(cloneServiceItem(form.services[index]));
    setIsServiceModalOpen(true);
  }

  function closeServiceModal() {
    setIsServiceModalOpen(false);
    setEditingServiceIndex(-1);
    setServiceDraft(emptyServiceItem());
    setIsServiceIconDropdownOpen(false);
  }

  function saveServiceDraft() {
    const normalizedDraft = {
      ...serviceDraft,
      slug: slugify(serviceDraft.slug || serviceDraft.name),
      name: serviceDraft.name.trim(),
      impression: serviceDraft.impression.trim(),
      impressionCount: Number(serviceDraft.impressionCount) || 0,
      description: serviceDraft.description.trim(),
      icon: serviceDraft.icon.trim(),
      views: Number(serviceDraft.views) || 0,
      comments: (serviceDraft.comments || []).map((comment) => ({
        ...comment,
        photo: comment.photo || "/profile.png",
        comment: comment.comment,
        impression: comment.impression,
        replies: comment.replies || [emptyServiceReply()],
      })),
    };

    if (!normalizedDraft.name || !normalizedDraft.description) {
      toast.error("Service name and description are required.");
      return;
    }

    setForm((current) => {
      const nextServices = [...current.services];

      if (editingServiceIndex >= 0) {
        nextServices[editingServiceIndex] = normalizedDraft;
      } else {
        nextServices.push(normalizedDraft);
      }

      return {
        ...current,
        services: nextServices,
      };
    });

    closeServiceModal();
  }

  function savePricingDraft() {
    const normalizedDraft = {
      ...pricingDraft,
      slug: slugify(pricingDraft.slug || pricingDraft.name),
      name: pricingDraft.name.trim(),
      description: pricingDraft.description.trim(),
      price: pricingDraft.price,
      duration: pricingDraft.duration.trim(),
      content: pricingDraft.content,
      features: (pricingDraft.features || []).map((feature) => feature.trim()).filter(Boolean),
      status: Boolean(pricingDraft.status),
      isPopular: Boolean(pricingDraft.isPopular),
    };

    if (
      !normalizedDraft.slug ||
      !normalizedDraft.name ||
      !normalizedDraft.description ||
      !normalizedDraft.duration ||
      !normalizedDraft.content ||
      !(Number(normalizedDraft.price) > 0)
    ) {
      toast.error("Pricing slug, name, description, content, price, and duration are required.");
      return;
    }

    setForm((current) => {
      const nextPricings = [...current.pricings];

      if (editingPricingIndex >= 0) {
        nextPricings[editingPricingIndex] = normalizedDraft;
      } else {
        nextPricings.push(normalizedDraft);
      }

      return {
        ...current,
        pricings: nextPricings,
      };
    });

    closePricingModal();
  }

  function saveFaqDraft() {
    const normalizedDraft = {
      ...faqDraft,
      question: faqDraft.question.trim(),
      answer: faqDraft.answer,
      status: Boolean(faqDraft.status),
    };

    if (!normalizedDraft.question || !normalizedDraft.answer) {
      toast.error("FAQ question and answer are required.");
      return;
    }

    setForm((current) => {
      const nextFaqs = [...current.faqs];

      if (editingFaqIndex >= 0) {
        nextFaqs[editingFaqIndex] = normalizedDraft;
      } else {
        nextFaqs.push(normalizedDraft);
      }

      return {
        ...current,
        faqs: nextFaqs,
      };
    });

    closeFaqModal();
  }

  function saveTestimonialDraft() {
    const normalizedDraft = {
      ...testimonialDraft,
      name: testimonialDraft.name.trim(),
      content: testimonialDraft.content,
      image: testimonialDraft.image.trim() || "/profile.png",
      company: testimonialDraft.company.trim(),
      position: testimonialDraft.position.trim(),
      stars: Math.max(1, Math.min(5, Number(testimonialDraft.stars) || 5)),
      status: Boolean(testimonialDraft.status),
    };

    if (!normalizedDraft.name || !normalizedDraft.content || !normalizedDraft.company) {
      toast.error("Testimonial name, company, and content are required.");
      return;
    }

    setForm((current) => {
      const nextTestimonials = [...current.testimonials];

      if (editingTestimonialIndex >= 0) {
        nextTestimonials[editingTestimonialIndex] = normalizedDraft;
      } else {
        nextTestimonials.push(normalizedDraft);
      }

      return {
        ...current,
        testimonials: nextTestimonials,
      };
    });

    closeTestimonialModal();
  }

  function saveProjectDraft() {
    const normalizedDraft = {
      ...projectDraft,
      id: projectDraft.id,
      slug: slugify(projectDraft.name),
      name: projectDraft.name.trim(),
      description: projectDraft.description.trim(),
      content: projectDraft.content,
      role: projectDraft.role.trim(),
      image: projectDraft.image.trim(),
      code: projectDraft.code.trim(),
      demo: projectDraft.demo.trim(),
      views: Number(projectDraft.views) || 0,
      impressionCount: Number(projectDraft.impressionCount) || 0,
      tools: (projectDraft.tools || []).map((tool) => tool.trim()).filter(Boolean),
      buttons: (projectDraft.buttons || [])
        .map((button) => ({
          text: button.text.trim(),
          link: button.link.trim(),
        }))
        .filter((button) => button.text && button.link),
    };

    if (!normalizedDraft.name || !normalizedDraft.description || !normalizedDraft.content) {
      toast.error("Project name, description, and content are required.");
      return;
    }

    setForm((current) => {
      const nextProjects = [...current.projects];

      if (editingProjectIndex >= 0) {
        nextProjects[editingProjectIndex] = normalizedDraft;
      } else {
        nextProjects.push(normalizedDraft);
      }

      return {
        ...current,
        projects: nextProjects,
      };
    });

    closeProjectModal();
  }

  async function persistContent(payload, successMessage) {
    try {
      setIsSaving(true);
      const response = await adminFetch(`${backendUrl}/api/admin/content`, {
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

  async function handleAchievementsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildAchievementsPayload(form), "Achievement section updated.");
    } catch {}
  }

  async function handleSkillsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildSkillsPayload(form), "Skills section updated.");
    } catch {}
  }

  async function handleExperiencesSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildExperiencesPayload(form), "Experience section updated.");
    } catch {}
  }

  async function handleEducationsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildEducationsPayload(form), "Education section updated.");
    } catch {}
  }

  async function handlePricingSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildPricingPayload(form), "Pricing section updated.");
    } catch {}
  }

  async function handleFaqSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildFaqPayload(form), "FAQ section updated.");
    } catch {}
  }

  async function handleTestimonialsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildTestimonialsPayload(form), "Testimonials section updated.");
    } catch {}
  }

  async function handleProjectsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildProjectsPayload(form), "Projects updated.");
    } catch {}
  }

  async function handleServicesSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildServicePayload(form), "Services section updated.");
    } catch {}
  }

  async function handleSettingsSave(event) {
    event.preventDefault();
    try {
      await persistContent(buildSiteSettingsPayload(form), "Website settings updated.");
    } catch {}
  }

  async function handleVerificationFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("verificationFile", file);

      const response = await adminFetch(`${backendUrl}/api/admin/upload-verification-file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification file upload failed.");
      }

      const nextForm = {
        ...form,
        siteSettings: {
          ...form.siteSettings,
          googleVerificationFilePath: data.path || "",
        },
      };

      setForm(nextForm);
      await persistContent(buildSiteSettingsPayload(nextForm), "Verification file uploaded and saved.");
    } catch (error) {
      toast.error(error.message || "Verification file upload failed.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
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

      const response = await adminFetch(`${backendUrl}/api/admin/upload-image`, {
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
            itemIndex === options.index ? { ...item, image: data.path } : item,
          ),
        };
      } else if (options.type === "achievement") {
        nextForm = {
          ...form,
          achievements: form.achievements.map((item, itemIndex) =>
            itemIndex === options.index ? { ...item, image: data.path } : item,
          ),
        };
      } else if (options.type === "real-skill") {
        nextForm = {
          ...form,
          skills: form.skills.map((item, itemIndex) =>
            itemIndex === options.index ? { ...item, image: data.path } : item,
          ),
        };
      } else if (options.type === "testimonial") {
        setTestimonialDraft((current) => ({
          ...current,
          image: data.path,
        }));
        return;
      } else if (options.type === "project") {
        setProjectDraft((current) => ({
          ...current,
          image: data.path,
        }));
        return;
      } else if (options.type === "site-setting") {
        nextForm = {
          ...form,
          siteSettings: {
            ...form.siteSettings,
            [options.key]: data.path,
          },
        };
      } else {
        nextForm = {
          ...form,
          profile: data.path,
        };
      }

      setForm(nextForm);
      if (options.type === "site-setting") {
        await persistContent(buildSiteSettingsPayload(nextForm), "Image uploaded and saved.");
      } else if (options.type === "achievement") {
        await persistContent(buildAchievementsPayload(nextForm), "Image uploaded and saved.");
      } else {
        await persistContent(buildHeroPayload(nextForm), "Image uploaded and saved.");
      }
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
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

      const response = await adminFetch(`${backendUrl}/api/admin/upload-resume`, {
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
    } catch (error) {
      toast.error(error.message || "PDF upload failed.");
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
    return (
      <div suppressHydrationWarning className="flex min-h-[80vh] items-center justify-center">
        <div suppressHydrationWarning className="rounded-3xl border border-[#24344d] bg-[#0d1728] px-8 py-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Admin Panel</p>
          <p className="mt-3 text-lg text-[#e8eef7]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeServices = form.services.filter((item) => item.status).length;
  const featuredServices = form.services.filter((item) => item.isFeatured).length;
  const totalServices = form.services.length;
  const totalSkills = form.skills.filter((item) => item.name.trim()).length;
  const totalAchievements = form.achievements.filter((item) => item.title.trim()).length;
  const achievementsWithImage = form.achievements.filter((item) => item.image.trim()).length;
  const totalExperiences = form.experiences.filter((item) => item.title.trim()).length;
  const experiencesWithDescription = form.experiences.filter((item) => stripHtml(item.description).trim()).length;
  const totalEducations = form.educations.filter((item) => item.title.trim()).length;
  const educationsWithAchievement = form.educations.filter((item) => stripHtml(item.achievement).trim()).length;
  const customSkillImages = form.skills.filter((item) => item.image.trim()).length;
  const averageSkillPercentage = totalSkills
    ? Math.round(
        form.skills.reduce((sum, item) => sum + Math.max(0, Math.min(100, Number(item.percentage) || 0)), 0) /
          totalSkills,
      )
    : 0;
  const totalProjects = form.projects.length;
  const totalProjectViews = form.projects.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
  const totalProjectImpressions = form.projects.reduce(
    (sum, item) => sum + (Number(item.impressionCount) || 0),
    0,
  );
  const activePricings = form.pricings.filter((item) => item.status).length;
  const popularPricings = form.pricings.filter((item) => item.isPopular).length;
  const totalPricings = form.pricings.length;
  const activeFaqs = form.faqs.filter((item) => item.status).length;
  const totalFaqs = form.faqs.length;
  const faqWithRichAnswers = form.faqs.filter((item) => stripHtml(item.answer).trim()).length;
  const activeTestimonials = form.testimonials.filter((item) => item.status).length;
  const totalTestimonials = form.testimonials.length;
  const testimonialsWithImage = form.testimonials.filter((item) => item.image.trim()).length;
  const settingsImagesCount = [
    form.siteSettings.seoImage,
    form.siteSettings.websiteIcon,
  ].filter((item) => String(item || "").trim()).length;
  const dashboardQuickActionIcons = {
    services: HiOutlineViewGrid,
    projects: FiFolder,
    messages: FiMail,
    settings: FiSettings,
    faq: FiHelpCircle,
    testimonials: FiMessageSquare,
  };
  const dashboardStatusCards = [
    {
      label: "Analytics Source",
      value: analytics.connected ? "Google Analytics 4" : "Demo dataset",
      detail: analytics.propertyId ? `Property ${analytics.propertyId}` : "No property connected",
    },
    ...(dashboardSummary.statusCards || []),
  ];
  const dashboardHighlights =
    activeTab === "dashboard"
      ? [
            { label: "Current Active Users", value: formatMetricValue(analytics.activeUsers), icon: HiOutlineUsers },
            { label: "Today Total Users", value: formatMetricValue(analytics.todayUsers), icon: FiBarChart2 },
          { label: "Last 7 Days Users", value: formatMetricValue(analytics.last7DaysUsers), icon: FiFolder },
          { label: "Last 30 Days Users", value: formatMetricValue(analytics.last30DaysUsers), icon: FiBriefcase },
          { label: "Tickets", value: formatMetricValue(messages.length), icon: FiMail, href: "/admin/messages" },
        ]
      : activeTab === "settings"
      ? [
          { label: "SEO Assets", value: settingsImagesCount, icon: FiSettings },
          { label: "Analytics", value: form.siteSettings.googleAnalyticsId || form.siteSettings.googleTagManagerId ? "Connected" : "Pending", icon: FiBarChart2 },
          { label: "SMTP", value: form.siteSettings.smtpHost ? "Configured" : "Pending", icon: FiMail },
        ]
      : activeTab === "achievement"
      ? [
          { label: "Total Achievements", value: totalAchievements, icon: HiOutlineUsers },
          { label: "With Image", value: achievementsWithImage, icon: HiOutlineSparkles },
          { label: "Rich Entries", value: `${totalAchievements ? Math.round((achievementsWithImage / totalAchievements) * 100) : 0}%`, icon: FiBarChart2 },
        ]
      : activeTab === "pricing"
      ? [
          { label: "Active Plans", value: activePricings, icon: FiDollarSign },
          { label: "Popular Plans", value: popularPricings, icon: HiOutlineSparkles },
          { label: "Total Plans", value: totalPricings, icon: FiBarChart2 },
        ]
      : activeTab === "faq"
      ? [
          { label: "Published FAQs", value: activeFaqs, icon: FiHelpCircle },
          { label: "Rich Answers", value: faqWithRichAnswers, icon: HiOutlineUsers },
          { label: "Total Entries", value: totalFaqs, icon: FiBarChart2 },
        ]
      : activeTab === "testimonials"
      ? [
          { label: "Published", value: activeTestimonials, icon: FiMessageSquare },
          { label: "With Image", value: testimonialsWithImage, icon: HiOutlineUsers },
          { label: "Total Entries", value: totalTestimonials, icon: FiBarChart2 },
        ]
      : activeTab === "education"
        ? [
            { label: "Total Education", value: totalEducations, icon: FiBookOpen },
            { label: "With Achievement", value: educationsWithAchievement, icon: HiOutlineUsers },
            { label: "Rich Entries", value: `${totalEducations ? Math.round((educationsWithAchievement / totalEducations) * 100) : 0}%`, icon: FiBarChart2 },
          ]
      : activeTab === "experience"
        ? [
            { label: "Total Roles", value: totalExperiences, icon: FiBriefcase },
            { label: "With Details", value: experiencesWithDescription, icon: HiOutlineUsers },
            { label: "Rich Entries", value: `${totalExperiences ? Math.round((experiencesWithDescription / totalExperiences) * 100) : 0}%`, icon: FiBarChart2 },
          ]
      : activeTab === "skills"
        ? [
            { label: "Total Skills", value: totalSkills, icon: FiCode },
            { label: "Custom Images", value: customSkillImages, icon: HiOutlineUsers },
            { label: "Avg. Level", value: `${averageSkillPercentage}%`, icon: FiBarChart2 },
          ]
      : activeTab === "projects"
        ? [
            { label: "Total Projects", value: totalProjects, icon: FiFolder },
            { label: "Project Views", value: totalProjectViews, icon: HiOutlineViewGrid },
            { label: "Impressions", value: totalProjectImpressions, icon: FiBarChart2 },
          ]
      : activeTab === "contact"
        ? [
            { label: "Saved Contacts", value: emergencyContacts.length, icon: FiPhone },
            { label: "Platforms", value: new Set(emergencyContacts.map((item) => item.icon).filter(Boolean)).size, icon: HiOutlineUsers },
            { label: "Quick Links", value: emergencyContacts.filter((item) => item.link).length, icon: FiEye },
          ]
        : [
            { label: "Active Services", value: activeServices, icon: HiOutlineViewGrid },
            { label: "Featured Services", value: featuredServices, icon: HiOutlineSparkles },
            { label: "Total Services", value: totalServices, icon: FiBarChart2 },
          ];
  const dashboardTopCards = [
    { label: "Live Users", value: formatMetricValue(analytics.activeUsers), icon: HiOutlineUsers },
    { label: "Total Users", value: formatMetricValue(analytics.todayUsers), icon: FiBarChart2 },
    { label: "Messages", value: formatMetricValue(messages.length), icon: FiMail, href: "/admin/messages" },
  ];

  return (
    <div suppressHydrationWarning className="w-full">
      <div className="grid gap-5 2xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.88),rgba(7,12,23,0.82))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl 2xl:sticky 2xl:top-6 2xl:h-[calc(100vh-3rem)] 2xl:overflow-y-auto">
          <div className="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_52%),rgba(255,255,255,0.03)] p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Control Center</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Portfolio Admin</h1>
            <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
              A focused workspace for your portfolio content, analytics, and site settings.
            </p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

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
          {false ? (
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(110,231,183,0.12),transparent_24%),linear-gradient(180deg,rgba(15,26,42,0.94),rgba(11,20,34,0.92))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#6bd4ff]">Admin Workspace</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {activeTab === "dashboard" ? dashboardSummary.workspace?.title || "Portfolio command center" : "Clean content management for your portfolio"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#a8b8ca]">
                  {activeTab === "dashboard"
                    ? dashboardSummary.workspace?.description || "Monitor activity, review analytics, and move between core portfolio sections with a cleaner SaaS-style interface."
                    : "The admin area now runs on its own layout, with dedicated service, project, and pricing workflows plus a cleaner editorial flow."}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8ea7c2]">
                  Last update: {analytics.fetchedAt ? new Date(analytics.fetchedAt).toLocaleString() : "Waiting for sync"}
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[#dce8f6] backdrop-blur-xl">
                  <FiSettings size={15} />
                  {activeTab === "dashboard"
                    ? dashboardSummary.workspace?.badge || "Portfolio Admin"
                    : tabs.find((tab) => tab.id === activeTab)?.label || activeTab}
                </div>
              </div>
            </div>

            <div className={`mt-6 grid gap-4 ${activeTab === "dashboard" ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}>
              {dashboardHighlights.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl transition ${
                      item.href ? "hover:-translate-y-0.5 hover:border-[#4dc4ff]/35 hover:bg-white/[0.06]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#9fb1c7]">{item.label}</p>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#132339] text-[#7fdcff]">
                        <Icon size={18} />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                );

                return item.href ? (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </section>
          ) : null}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-3">
                {dashboardTopCards.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div
                      className={`rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl transition ${
                        item.href ? "hover:-translate-y-0.5 hover:border-[#4dc4ff]/35 hover:bg-white/[0.05]" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8ea7c2]">{item.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                        </div>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#132339] text-[#7fdcff]">
                          <Icon size={18} />
                        </span>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <Link key={item.label} href={item.href}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </section>

              <section className="grid gap-5">
                <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Analytics Overview</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">Traffic trends and current activity</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#9fb1c7]">
                        {analytics.note}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#d4e2f0]">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">Source</p>
                      <p className="mt-2 font-medium text-white">
                        {analytics.connected ? "Google Analytics 4" : "Simulated Demo Data"}
                      </p>
                      <p className="mt-1 text-xs text-[#8ea7c2]">
                        {analytics.propertyId ? `Property ${analytics.propertyId}` : "No property connected"}
                      </p>
                    </div>
                  </div>

                    <div className="mt-6">
                      {isAnalyticsLoading ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                          {[0, 1].map((item) => (
                            <div
                              key={item}
                            className="h-[420px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]"
                          />
                        ))}
                      </div>
                    ) : (
                      <AdminAnalyticsCharts growth={analytics.growth} weekly={analytics.weekly} />
                    )}
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-[#6bd4ff]">Visitor Activity</p>
                        <h4 className="mt-2 text-xl font-semibold text-white">Recent tracked users</h4>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">
                        {(analytics.visitors || []).length} visitors
                      </span>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-y-3">
                        <thead>
                          <tr>
                            {["User ID", "Status", "Current Page", "IP", "Country", "Location", "Viewed Pages"].map((label) => (
                              <th
                                key={label}
                                className="px-3 text-left text-xs uppercase tracking-[0.22em] text-[#8ea7c2]"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsVisitors.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-[#8ea7c2]"
                              >
                                No tracked visitors yet.
                              </td>
                            </tr>
                          ) : (
                            paginatedAnalyticsVisitors.map((visitor) => (
                              <tr key={visitor.id} className="rounded-[1.2rem]">
                                <td className="rounded-l-[1.2rem] border border-white/10 border-r-0 bg-white/[0.03] px-3 py-4 text-sm text-white">
                                  <span className="block max-w-[180px] truncate">{visitor.userId}</span>
                                </td>
                                <td className="border border-white/10 border-l-0 border-r-0 bg-white/[0.03] px-3 py-4 text-sm">
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                                      visitor.isLive
                                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                        : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                                    }`}
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        visitor.isLive ? "bg-emerald-300" : "bg-amber-300"
                                      }`}
                                    />
                                    {visitor.isLive ? "Live" : "Away"}
                                  </span>
                                  <span className="mt-2 block text-xs text-[#8ea7c2]">
                                    {formatVisitorLastSeen(visitor.lastSeenAt)}
                                  </span>
                                </td>
                                <td className="border border-white/10 border-l-0 border-r-0 bg-white/[0.03] px-3 py-4 text-sm text-[#d4e2f0]">
                                  <span className="block max-w-[180px] truncate">{visitor.currentPage || "Unknown"}</span>
                                </td>
                                <td className="border border-white/10 border-l-0 border-r-0 bg-white/[0.03] px-3 py-4 text-sm text-[#d4e2f0]">
                                  {visitor.ipAddress || "Unknown"}
                                </td>
                                <td className="border border-white/10 border-l-0 border-r-0 bg-white/[0.03] px-3 py-4 text-sm text-[#d4e2f0]">
                                  {visitor.country || "Unknown"}
                                </td>
                                <td className="border border-white/10 border-l-0 border-r-0 bg-white/[0.03] px-3 py-4 text-sm text-[#d4e2f0]">
                                  {visitor.location || "Unknown"}
                                </td>
                                <td className="rounded-r-[1.2rem] border border-white/10 border-l-0 bg-white/[0.03] px-3 py-4 text-sm">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedAnalyticsVisitor(visitor)}
                                    className="rounded-xl border border-[#36557e] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#9fdcff] transition hover:bg-white/[0.05] hover:text-white"
                                  >
                                    View ({visitor.pageViews?.length || 0})
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {analyticsVisitors.length > analyticsVisitorsPerPage ? (
                      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#8ea7c2]">
                          Showing {analyticsVisitorsStartIndex + 1}-{Math.min(analyticsVisitorsStartIndex + paginatedAnalyticsVisitors.length, analyticsVisitors.length)} of {analyticsVisitors.length} visitors
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAnalyticsVisitorsPage((current) => Math.max(1, current - 1))}
                            disabled={analyticsVisitorsPage === 1}
                            className="rounded-xl border border-[#36557e] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#9fdcff] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#d4e2f0]">
                            Page {analyticsVisitorsPage} / {analyticsVisitorsTotalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAnalyticsVisitorsPage((current) => Math.min(analyticsVisitorsTotalPages, current + 1))}
                            disabled={analyticsVisitorsPage === analyticsVisitorsTotalPages}
                            className="rounded-xl border border-[#36557e] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#9fdcff] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                      <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Workspace Status</p>
                      <div className="mt-5 space-y-3">
                        {dashboardStatusCards.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm text-[#8ea7c2]">{item.label}</p>
                              <p className="mt-1 truncate text-sm text-[#bfd0e2]">{item.detail}</p>
                            </div>
                            <span className="shrink-0 text-sm font-medium text-white">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Quick Actions</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Jump into the next task</h3>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">
                        {(dashboardSummary.snapshot || []).length} live metrics
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {dashboardSummary.quickActions.map((item) => {
                        const Icon = dashboardQuickActionIcons[item.icon] || FiSettings;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-[#36557e] hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#132339] text-[#7fdcff]">
                                <Icon size={18} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="break-words font-medium text-white">{item.label}</p>
                                <p className="mt-1 break-words text-sm leading-6 text-[#8ea7c2]">{item.description}</p>
                              </div>
                            </div>
                            <span className="shrink-0 self-start text-xs uppercase tracking-[0.2em] text-[#9fdcff] sm:self-center">Open</span>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </section>

                <section className="space-y-5">
                  <div className="grid gap-5 xl:grid-cols-2">
                    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Content Health</p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">Publishing mix across sections</h3>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">Configured</p>
                          <p className="mt-2 text-2xl font-semibold text-white">
                            {dashboardSummary.configuredPercentage || 0}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        {dashboardSummary.collectionHealth.map((item) => {
                          const total = Math.max(item.total || 0, 1);
                          const progress = Math.min(100, Math.round((item.value / total) * 100));

                          return (
                            <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-white">{item.label}</p>
                                <p className="text-sm text-[#8ea7c2]">
                                  {item.value}/{item.total || 0}
                                </p>
                              </div>
                              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${item.accentClass}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                      <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Portfolio Snapshot</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">Operational summary</h3>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {dashboardSummary.snapshot.map((item) => (
                          <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">{item.label}</p>
                            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.9),rgba(9,15,26,0.85))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Recent Messages</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">Latest inbox activity</h3>
                    </div>
                    <Link
                      href="/admin/messages"
                      className="text-xs uppercase tracking-[0.22em] text-[#9fdcff] transition hover:text-white"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="mt-6 space-y-3">
                    {dashboardSummary.recentMessages.length === 0 ? (
                      <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-[#8ea7c2]">
                        No messages have arrived yet.
                      </div>
                    ) : (
                      dashboardSummary.recentMessages.map((message) => (
                        <div key={message.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">{message.name}</p>
                              <p className="truncate text-sm text-[#7fdcff]">{message.email}</p>
                            </div>
                            <span className="shrink-0 text-xs text-[#8ea7c2]">
                              {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          {message.subject ? (
                            <p className="mt-3 text-sm font-medium text-white">{message.subject}</p>
                          ) : null}
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#9fb1c7]">
                            {message.message}
                          </p>
                          {message.photo || message.file ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.photo ? (
                                <Link
                                  href={buildPublicAssetUrl(message.photo)}
                                  target="_blank"
                                  className="rounded-full border border-[#2f4866] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#9fdcff] transition hover:border-[#70d5ff] hover:text-white"
                                >
                                  Photo
                                </Link>
                              ) : null}
                              {message.file ? (
                                <Link
                                  href={buildPublicAssetUrl(message.file)}
                                  target="_blank"
                                  className="rounded-full border border-[#2f4866] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#9fdcff] transition hover:border-[#70d5ff] hover:text-white"
                                >
                                  File
                                </Link>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                  </section>
                </section>
            </div>
          )}

          {activeTab === "artical" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Articles</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Manage article library</h3>
                  <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                    Create, edit, and publish long-form articles from a dedicated editor flow.
                  </p>
                </div>
                <Link
                  href="/admin/artical/new"
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
                >
                  Add New Article
                </Link>
              </div>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Article List</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">All saved articles</h3>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">
                    Total Articles: {articles.length}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {isArticlesLoading ? (
                    [0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-28 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]"
                      />
                    ))
                  ) : articles.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                      <p className="text-lg font-semibold text-white">No articles yet</p>
                      <p className="mt-2 text-sm text-[#8ea7c2]">
                        Start by creating your first article from the dedicated editor page.
                      </p>
                    </div>
                  ) : (
                    articles.map((article) => {
                      const commentCount = Array.isArray(article.comments)
                        ? article.comments.reduce(
                            (sum, comment) => sum + 1 + (Array.isArray(comment?.replies) ? comment.replies.length : 0),
                            0,
                          )
                        : 0;
                      const canonicalBase = String(form.siteSettings.canonicalUrl || "").trim().replace(/\/+$/, "");
                      const articleDetailUrl = `${canonicalBase || ""}/artical/${article.slug}`;

                      return (
                        <div
                          key={article.id}
                          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#36557e] hover:bg-white/[0.05]"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.2rem] border border-[#2f4866] bg-[#0f1d2f] sm:h-28 sm:w-28">
                                {article.featuredImage ? (
                                  <Image
                                    src={buildPublicAssetUrl(article.featuredImage)}
                                    alt={article.title || "Article image"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-center text-[10px] uppercase tracking-[0.22em] text-[#7fdcff]">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-xl font-semibold text-white">{article.title}</p>
                                  {article.isFeatured ? (
                                    <span className="inline-flex rounded-full border border-[#4dc4ff]/25 bg-[#4dc4ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9fdcff]">
                                      Featured
                                    </span>
                                  ) : null}
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                      article.status === "published"
                                        ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                                        : "border border-amber-400/25 bg-amber-400/10 text-amber-200"
                                    }`}
                                  >
                                    {article.status}
                                  </span>
                                  {Array.isArray(article.categories) && article.categories.length ? (
                                    <span className="inline-flex rounded-full border border-[#2f4866] bg-[#0f1d2f] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7fdcff]">
                                      {article.categories.map((category) => category.name).join(", ")}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-2">
                                  <Link
                                    href={articleDetailUrl}
                                    target="_blank"
                                    className="inline-flex max-w-full break-all text-sm text-[#7fdcff] transition hover:text-white"
                                  >
                                    {articleDetailUrl}
                                  </Link>
                                </div>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9fb1c7]">
                                  {article.shortDescription}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#8ea7c2]">
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                    {article.author}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                    {article.publishDate ? new Date(article.publishDate).toLocaleString() : "No publish date"}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                    Comments {article.commentsEnabled ? "On" : "Off"}
                                  </span>
                                  <span className="rounded-full border border-[#2f4866] bg-[#0f1d2f] px-3 py-1 text-[#9fdcff]">
                                    {Number(article.views) || 0} Views
                                  </span>
                                  <span className="rounded-full border border-[#2f4866] bg-[#0f1d2f] px-3 py-1 text-[#9fdcff]">
                                    {Number(article.impressionCount) || 0} Impressions
                                  </span>
                                  <span className="rounded-full border border-[#2f4866] bg-[#0f1d2f] px-3 py-1 text-[#9fdcff]">
                                    {commentCount} Comments
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 gap-3">
                              <Link
                                href={`/admin/artical/${article.id}`}
                                className="rounded-full border border-[#36557e] px-4 py-2 text-sm font-medium text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => deleteArticle(article)}
                                disabled={deletingArticleId === article.id}
                                className="rounded-full border border-[#6a3440] px-4 py-2 text-sm font-medium text-[#ffc3cf] transition hover:border-[#ff7f9f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingArticleId === article.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </section>
          )}

          {activeTab === "artical-categories" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Article Categories</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Manage reusable categories</h3>
                  <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                    Create and organize article categories separately, then select multiple categories while creating or updating articles.
                  </p>
                </div>
                <Link
                  href="/admin/artical"
                  className="inline-flex items-center justify-center rounded-full border border-[#36557e] px-5 py-3 text-sm font-semibold text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                >
                  Back To Articles
                </Link>
              </div>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
                <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Saved Categories</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Reusable blog categories</h3>
                  <div className="mt-6 space-y-3">
                    {articleCategories.length === 0 ? (
                      <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-[#8ea7c2]">
                        No categories created yet.
                      </div>
                    ) : (
                      articleCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex flex-col gap-4 rounded-[1.4rem] border border-[#2f4866] bg-[#112033] px-4 py-4 text-sm text-[#c6d7ea] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium text-white">{category.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#7fbde9]">{category.slug}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openArticleCategoryEditor(category)}
                              className="inline-flex items-center justify-center rounded-full border border-[#36557e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteArticleCategory(category)}
                              disabled={deletingArticleCategoryId === category.id}
                              className="inline-flex items-center justify-center rounded-full border border-[#6a3440] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffc3cf] transition hover:border-[#ff7f9f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingArticleCategoryId === category.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">
                    {editingArticleCategoryId ? "Edit Category" : "Create Category"}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {editingArticleCategoryId ? "Update article category" : "Add a new article category"}
                  </h3>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Category Name</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={editingArticleCategoryId ? articleCategoryDraft : newArticleCategory}
                        onChange={(event) =>
                          editingArticleCategoryId
                            ? setArticleCategoryDraft(event.target.value)
                            : setNewArticleCategory(event.target.value)
                        }
                        placeholder="JavaScript"
                      />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={editingArticleCategoryId ? updateArticleCategory : createArticleCategory}
                        disabled={isSavingArticleCategory}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingArticleCategory
                          ? "Saving..."
                          : editingArticleCategoryId
                            ? "Update Category"
                            : "Save Category"}
                      </button>
                      {editingArticleCategoryId ? (
                        <button
                          type="button"
                          onClick={closeArticleCategoryEditor}
                          className="inline-flex w-full items-center justify-center rounded-full border border-[#36557e] px-5 py-3 text-sm font-semibold text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === "contact" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Emergency Contact</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Manage priority contact links</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#9fb1c7]">
                    Create a separate contact directory with label, name, icon, and destination link. This section is fully independent and uses its own database table.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEmergencyContactModal()}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90"
                >
                  Add New Contact
                </button>
              </div>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Contact List</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">All emergency contact records</h3>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">
                    {emergencyContacts.length} items
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {isEmergencyContactsLoading ? (
                    [0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-28 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]"
                      />
                    ))
                  ) : emergencyContacts.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                      <p className="text-lg font-semibold text-white">No contact entries yet</p>
                      <p className="mt-2 text-sm text-[#8ea7c2]">
                        Add a new contact entry from the popup and it will appear here instantly.
                      </p>
                    </div>
                  ) : (
                    emergencyContacts.map((contact) => {
                      const selectedIcon = getSocialIconOption(contact.icon);
                      const Icon = selectedIcon?.icon || FiPhone;

                      return (
                        <div
                          key={contact.id}
                          className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 transition hover:border-[#36557e] hover:bg-white/[0.05]"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-[#315175] bg-[radial-gradient(circle_at_top,rgba(107,212,255,0.24),rgba(17,32,51,0.95))] text-[#8fe3ff] shadow-[0_16px_40px_rgba(14,165,233,0.16)]">
                                  <Icon className="text-2xl" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xl font-semibold text-white">{contact.name}</p>
                                    <span className="rounded-full border border-[#2f4866] bg-[#112033] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#86d7ff]">
                                      {contact.label}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm text-[#8ea7c2]">
                                    {selectedIcon?.label || contact.icon}
                                  </p>
                                  <a
                                    href={contact.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex max-w-full items-center gap-2 text-sm text-[#7fdcff] transition hover:text-white"
                                  >
                                    <span className="truncate">{contact.link}</span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 gap-3">
                              <button
                                type="button"
                                onClick={() => openEmergencyContactModal(contact)}
                                className="rounded-full border border-[#36557e] px-4 py-2 text-sm font-medium text-[#9fdcff] transition hover:border-[#4dc4ff] hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteEmergencyContact(contact.id)}
                                disabled={emergencyContactActionId === contact.id}
                                className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {emergencyContactActionId === contact.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </section>
          )}

          {isEmergencyContactModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
              <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Emergency Contact</p>
                    <h4 className="mt-2 text-2xl font-semibold text-white">
                      {editingEmergencyContactId ? "Update contact entry" : "Create new contact entry"}
                    </h4>
                    <p className="mt-2 text-sm text-[#97a9be]">
                      Choose a social icon, then store the contact label, display name, and target link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEmergencyContactModal}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#c7d6e8] transition hover:border-[#4dc4ff] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Label</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={emergencyContactDraft.label}
                        onChange={(event) =>
                          setEmergencyContactDraft((current) => ({ ...current, label: event.target.value }))
                        }
                        placeholder="Primary Support"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Name</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={emergencyContactDraft.name}
                        onChange={(event) =>
                          setEmergencyContactDraft((current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="WhatsApp Hotline"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Link</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={emergencyContactDraft.link}
                        onChange={(event) =>
                          setEmergencyContactDraft((current) => ({ ...current, link: event.target.value }))
                        }
                        placeholder="https://wa.me/8801..."
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] border border-[#24344d] bg-[#0d1728] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[#79d4ff]">Choose Icon</p>
                        <p className="mt-2 text-sm text-[#93a8c0]">All available social icons are listed below.</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#315175] bg-[#112033] text-[#8fe3ff]">
                        {(() => {
                          const SelectedIcon = getSocialIconOption(emergencyContactDraft.icon)?.icon || FiPhone;
                          return <SelectedIcon className="text-xl" />;
                        })()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={emergencyContactSearch}
                        onChange={(event) => setEmergencyContactSearch(event.target.value)}
                        placeholder="Search icon like whatsapp, linkedin, github..."
                      />
                    </div>

                    <div className="mt-4 grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {(emergencyContactSearch.trim() ? searchSocialIcons(emergencyContactSearch) : socialIconOptions).map((option) => {
                        const Icon = option.icon;
                        const isActive = emergencyContactDraft.icon === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setEmergencyContactDraft((current) => ({ ...current, icon: option.value }))
                            }
                            className={`flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-left transition ${
                              isActive
                                ? "border-[#4dc4ff] bg-[#12304a] text-white shadow-[0_16px_40px_rgba(56,189,248,0.18)]"
                                : "border-[#24344d] bg-[#0f1a2b] text-[#c7d6e8] hover:border-[#36557e] hover:bg-[#132338]"
                            }`}
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                              <Icon className="text-lg" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{option.label}</span>
                              <span className="mt-1 block truncate text-xs uppercase tracking-[0.16em] text-[#8ea7c2]">
                                {option.value}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#203049] pt-5 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEmergencyContactModal}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-[#c7d6e8] transition hover:border-[#4dc4ff] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEmergencyContact}
                    disabled={isSavingEmergencyContact}
                    className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingEmergencyContact ? "Saving..." : editingEmergencyContactId ? "Update Contact" : "Create Contact"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedAnalyticsVisitor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
              <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Viewed Pages</p>
                    <h4 className="mt-2 text-2xl font-semibold text-white">{selectedAnalyticsVisitor.userId}</h4>
                    <p className="mt-2 text-sm text-[#97a9be]">
                      {selectedAnalyticsVisitor.ipAddress || "Unknown IP"} • {selectedAnalyticsVisitor.country || "Unknown country"} • {selectedAnalyticsVisitor.location || "Unknown location"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold ${
                          selectedAnalyticsVisitor.isLive
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            selectedAnalyticsVisitor.isLive ? "bg-emerald-300" : "bg-amber-300"
                          }`}
                        />
                        {selectedAnalyticsVisitor.isLive ? "Live" : "Away"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[#9fb1c7]">
                        Last seen {formatVisitorLastSeen(selectedAnalyticsVisitor.lastSeenAt)}
                      </span>
                      <span className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[#9fb1c7]">
                        Page {selectedAnalyticsVisitor.currentPage || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAnalyticsVisitor(null)}
                    className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {(selectedAnalyticsVisitor.pageViews || []).length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-[#8ea7c2]">
                      No pages tracked for this visitor yet.
                    </div>
                  ) : (
                    selectedAnalyticsVisitor.pageViews.map((page) => (
                      <div key={page.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="break-all font-medium text-white">{page.path}</p>
                          <span className="text-sm text-[#9fdcff]">{page.viewCount} views</span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-[#8ea7c2] sm:grid-cols-2">
                          <p>First viewed: {page.firstViewedAt ? new Date(page.firstViewedAt).toLocaleString() : "Unknown"}</p>
                          <p>Last viewed: {page.lastViewedAt ? new Date(page.lastViewedAt).toLocaleString() : "Unknown"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {(selectedMessageThread || isMessageThreadLoading) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between border-b border-[#203049] px-5 py-4 md:px-6">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Live Ticket Thread</p>
                    <h4 className="mt-2 truncate text-2xl font-semibold text-white">
                      {selectedMessageThread?.subject || selectedMessageThread?.name || "Message Thread"}
                    </h4>
                    <p className="mt-2 truncate text-sm text-[#97a9be]">
                      {selectedMessageThread?.name || "Loading"} | {selectedMessageThread?.email || "Loading"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMessageThread(null);
                      setMessageReplyDraft("");
                      setMessageReplyAttachments({ photo: null, file: null });
                      if (messageReplyPhotoInputRef.current) {
                        messageReplyPhotoInputRef.current.value = "";
                      }
                      if (messageReplyFileInputRef.current) {
                        messageReplyFileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                  >
                    Close
                  </button>
                </div>

                {isMessageThreadLoading ? (
                  <div className="grid gap-4 p-6">
                    <div className="h-24 animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04]" />
                    <div className="h-24 animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04]" />
                    <div className="h-24 animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04]" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
                      {(selectedMessageThread?.chatMessages || []).map((item) => {
                        const isAdminMessage = item.senderType === "admin";
                        const senderLabel = isAdminMessage ? "Admin" : "User";
                        const senderName = item.senderName || senderLabel;

                        return (
                          <div
                            key={item.id}
                            className={`flex ${isAdminMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex max-w-[82%] flex-col ${isAdminMessage ? "items-end" : "items-start"}`}>
                              <span
                                className={`mb-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                  isAdminMessage
                                    ? "border-[#6cc8ff]/25 bg-[#6cc8ff]/12 text-[#9fe7ff]"
                                    : "border-white/10 bg-white/[0.04] text-[#9fb2c8]"
                                }`}
                              >
                                {senderLabel}
                              </span>
                              <div
                                className={`max-w-full rounded-[1.4rem] px-4 py-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.2)] ${
                                isAdminMessage
                                  ? "bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] text-[#07111d]"
                                  : "border border-white/10 bg-white/[0.05] text-white"
                                }`}
                              >
                                {item.message ? <p className="text-sm leading-7">{item.message}</p> : null}
                                {item.photo || item.file ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.photo ? (
                                      <Link
                                        href={item.photo}
                                        target="_blank"
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                                          isAdminMessage
                                            ? "border-[#153043]/15 bg-[#07111d]/10 text-[#153043] hover:border-[#153043]/35 hover:bg-[#07111d]/15"
                                            : "border-white/10 bg-white/[0.03] text-[#9fdcff] hover:border-[#70d5ff] hover:text-white"
                                        }`}
                                      >
                                        <FiImage size={13} />
                                        View Photo
                                      </Link>
                                    ) : null}
                                    {item.file ? (
                                      <Link
                                        href={item.file}
                                        target="_blank"
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                                          isAdminMessage
                                            ? "border-[#153043]/15 bg-[#07111d]/10 text-[#153043] hover:border-[#153043]/35 hover:bg-[#07111d]/15"
                                            : "border-white/10 bg-white/[0.03] text-[#9fdcff] hover:border-[#70d5ff] hover:text-white"
                                        }`}
                                      >
                                        <FiPaperclip size={13} />
                                        Open File
                                      </Link>
                                    ) : null}
                                  </div>
                                ) : null}
                                <p className={`mt-2 text-[11px] ${isAdminMessage ? "text-[#173447]" : "text-[#8ea7c2]"}`}>
                                  {senderName} | {formatThreadTimestamp(item.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-[#203049] px-5 py-4 md:px-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => messageReplyPhotoInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2f4866] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                        >
                          <FiImage size={13} />
                          {messageReplyAttachments.photo ? "Change Photo" : "Add Photo"}
                        </button>
                        <button
                          type="button"
                          onClick={() => messageReplyFileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2f4866] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fdcff] transition hover:-translate-y-0.5 hover:border-[#70d5ff] hover:text-white"
                        >
                          <FiPaperclip size={13} />
                          {messageReplyAttachments.file ? "Change File" : "Add File"}
                        </button>
                        <input
                          ref={messageReplyPhotoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            setMessageReplyAttachments((current) => ({
                              ...current,
                              photo: event.target.files?.[0] || null,
                            }))
                          }
                        />
                        <input
                          ref={messageReplyFileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            setMessageReplyAttachments((current) => ({
                              ...current,
                              file: event.target.files?.[0] || null,
                            }))
                          }
                        />
                      </div>
                      {messageReplyAttachments.photo || messageReplyAttachments.file ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {messageReplyAttachments.photo ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#2f4866] bg-[#081322] px-3 py-1.5 text-xs text-[#d6e4f3]">
                              <FiUpload size={12} />
                              {messageReplyAttachments.photo.name}
                            </span>
                          ) : null}
                          {messageReplyAttachments.file ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#2f4866] bg-[#081322] px-3 py-1.5 text-xs text-[#d6e4f3]">
                              <FiUpload size={12} />
                              {messageReplyAttachments.file.name}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <textarea
                          value={messageReplyDraft}
                          onChange={(event) => setMessageReplyDraft(event.target.value)}
                          rows={3}
                          placeholder="Reply to this ticket..."
                          className="min-h-[110px] flex-1 resize-none rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#70859d] focus:border-[#70d5ff]"
                        />
                        <button
                          type="button"
                          onClick={() => sendAdminMessageReply(token)}
                          disabled={
                            isSendingMessageReply ||
                            (!messageReplyDraft.trim() && !messageReplyAttachments.photo && !messageReplyAttachments.file)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-sm font-semibold text-[#07111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiSend size={16} />
                          {isSendingMessageReply ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <form className="space-y-6" onSubmit={handleSettingsSave}>
              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Website Basics</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Brand, contact, and footer settings</h3>
                  <div className="mt-6 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Website Title</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings.websiteTitle}
                        onChange={(event) => updateSiteSettingsField("websiteTitle", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Website Description</label>
                      <textarea
                        className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings.websiteDescription}
                        onChange={(event) => updateSiteSettingsField("websiteDescription", event.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Nav Title</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={form.siteSettings.navTitle}
                          onChange={(event) => updateSiteSettingsField("navTitle", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Nav Subtitle</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={form.siteSettings.navSubtitle}
                          onChange={(event) => updateSiteSettingsField("navSubtitle", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Contact Email</label>
                        <input
                          type="email"
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={form.siteSettings.contactEmail}
                          onChange={(event) => updateSiteSettingsField("contactEmail", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Mobile Number</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={form.siteSettings.mobileNumber}
                          onChange={(event) => updateSiteSettingsField("mobileNumber", event.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Footer Text</label>
                      <textarea
                        className="min-h-[100px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings.footerText}
                        onChange={(event) => updateSiteSettingsField("footerText", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Canonical URL</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        placeholder="https://yourdomain.com"
                        value={form.siteSettings.canonicalUrl}
                        onChange={(event) => updateSiteSettingsField("canonicalUrl", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">SEO & Indexing</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Search metadata, analytics, and robots</h3>
                  <div className="mt-6 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SEO Title</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings.seoTitle}
                        onChange={(event) => updateSiteSettingsField("seoTitle", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SEO Description</label>
                      <textarea
                        className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings.seoDescription}
                        onChange={(event) => updateSiteSettingsField("seoDescription", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SEO Keywords</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        placeholder="portfolio, developer, next.js"
                        value={form.siteSettings.seoKeywords}
                        onChange={(event) => updateSiteSettingsField("seoKeywords", event.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Google Verification</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={form.siteSettings.googleSiteVerification}
                          onChange={(event) => updateSiteSettingsField("googleSiteVerification", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Verification File Path</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          placeholder="/google1234567890abcdef.html"
                          value={form.siteSettings.googleVerificationFilePath}
                          onChange={(event) => updateSiteSettingsField("googleVerificationFilePath", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Google Analytics ID</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          placeholder="G-XXXXXXXXXX"
                          value={form.siteSettings.googleAnalyticsId}
                          onChange={(event) => updateSiteSettingsField("googleAnalyticsId", event.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Google Tag Manager ID</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        placeholder="GTM-XXXXXXX"
                        value={form.siteSettings.googleTagManagerId}
                        onChange={(event) => updateSiteSettingsField("googleTagManagerId", event.target.value)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                        <input
                          type="checkbox"
                          checked={form.siteSettings.robotsIndexingEnabled}
                          onChange={(event) => updateSiteSettingsField("robotsIndexingEnabled", event.target.checked)}
                        />
                        Allow search engines to index this website
                      </label>
                      <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                        <input
                          type="checkbox"
                          checked={form.siteSettings.robotsFollowEnabled}
                          onChange={(event) => updateSiteSettingsField("robotsFollowEnabled", event.target.checked)}
                        />
                        Allow search engines to follow page links
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Brand Assets</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">SEO image and website icon</h3>
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {[
                    { key: "seoImage", label: "SEO Image" },
                    { key: "websiteIcon", label: "Website Icon" },
                  ].map((asset) => (
                    <div key={asset.key} className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">{asset.label}</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form.siteSettings[asset.key]}
                        onChange={(event) => updateSiteSettingsField(asset.key, event.target.value)}
                      />
                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl border border-[#36557e] px-4 py-3 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]">
                        {isUploadingImage ? "Uploading..." : `Upload ${asset.label}`}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleImageUpload(event, { type: "site-setting", key: asset.key })}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">AdSense</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Global ad code placements</h3>
                <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                  Save your AdSense or ad network snippets here. Head code loads site-wide, page top and bottom ads show on every public page, and the between-sections slot repeats across homepage sections.
                </p>
                <div className="mt-6 grid gap-4">
                  {[
                    {
                      key: "adsenseHeadCode",
                      label: "Head Script Code",
                      hint: "Use this for the global AdSense script snippet.",
                    },
                    {
                      key: "adsensePageTopCode",
                      label: "Page Top Ad Code",
                      hint: "Shows near the top of every public page.",
                    },
                    {
                      key: "adsenseBetweenSectionsCode",
                      label: "Between Sections Ad Code",
                      hint: "Repeats between homepage sections.",
                    },
                    {
                      key: "adsensePageBottomCode",
                      label: "Page Bottom Ad Code",
                      hint: "Shows near the bottom of every public page.",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">{field.label}</label>
                      <textarea
                        className="min-h-[140px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-[#49c1ff]"
                        placeholder="<script async src='...'></script>"
                        value={form.siteSettings[field.key]}
                        onChange={(event) => updateSiteSettingsField(field.key, event.target.value)}
                      />
                      <p className="mt-2 text-xs leading-6 text-[#7f96b2]">{field.hint}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Verification File</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Upload Google or other verification files</h3>
                <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                  Upload any verification file and it will be reachable from your public base URL.
                </p>
                <div className="mt-6 rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Saved Verification Path</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.siteSettings.googleVerificationFilePath}
                    onChange={(event) => updateSiteSettingsField("googleVerificationFilePath", event.target.value)}
                    placeholder="/google1234567890abcdef.html"
                  />
                  <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl border border-[#36557e] px-4 py-3 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]">
                    {isUploadingImage ? "Uploading..." : "Upload Verification File"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleVerificationFileUpload}
                    />
                  </label>
                  {form.siteSettings.googleVerificationFilePath ? (
                    <p className="mt-4 break-all text-sm leading-7 text-[#9fb1c7]">
                      Public URL: {String(form.siteSettings.canonicalUrl || "").trim().replace(/\/+$/, "") || "{base_url}"}
                      {form.siteSettings.googleVerificationFilePath}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">SMTP Settings</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Email delivery for contact form</h3>
                <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                  Contact messages will still save in the admin inbox. When SMTP is configured, the site will also email you and send an auto-reply to the visitor.
                </p>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SMTP Host</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpHost}
                      onChange={(event) => updateSiteSettingsField("smtpHost", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SMTP Port</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpPort}
                      onChange={(event) => updateSiteSettingsField("smtpPort", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SMTP User</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpUser}
                      onChange={(event) => updateSiteSettingsField("smtpUser", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">SMTP Password</label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpPass}
                      onChange={(event) => updateSiteSettingsField("smtpPass", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">From Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpFromEmail}
                      onChange={(event) => updateSiteSettingsField("smtpFromEmail", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">From Name</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpFromName}
                      onChange={(event) => updateSiteSettingsField("smtpFromName", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Reply-To Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpReplyToEmail}
                      onChange={(event) => updateSiteSettingsField("smtpReplyToEmail", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Inbox Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.siteSettings.smtpToEmail}
                      onChange={(event) => updateSiteSettingsField("smtpToEmail", event.target.value)}
                    />
                  </div>
                </div>
                <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                  <input
                    type="checkbox"
                    checked={form.siteSettings.smtpSecure}
                    onChange={(event) => updateSiteSettingsField("smtpSecure", event.target.checked)}
                  />
                  Use secure SMTP connection
                </label>
              </section>

              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Admin Security</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Two-factor authentication</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Add an authenticator app code for admin sign-in. The login page will ask for the 2FA code only when it is enabled.
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                      admin?.twoFactorEnabled
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border border-amber-300/20 bg-amber-300/10 text-amber-100"
                    }`}
                  >
                    {admin?.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                  </span>
                </div>

                {!admin?.twoFactorEnabled ? (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-5">
                      <p className="text-sm font-medium text-white">Setup steps</p>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-[#9fb1c7]">
                        <p>1. Click the setup button to generate a QR code.</p>
                        <p>2. Scan it with Google Authenticator, Microsoft Authenticator, or Authy.</p>
                        <p>3. Enter the 6-digit code below to finish enabling 2FA.</p>
                      </div>

                      {!twoFactorSetup.qrCodeDataUrl ? (
                        <button
                          type="button"
                          onClick={startTwoFactorSetup}
                          disabled={isTwoFactorLoading}
                          className="mt-6 rounded-xl border border-[#4dc4ff] px-5 py-3 text-sm font-semibold text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isTwoFactorLoading ? "Preparing setup..." : "Generate 2FA Setup"}
                        </button>
                      ) : (
                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Authenticator Code</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Enter 6-digit code"
                              value={twoFactorEnableCode}
                              onChange={(event) =>
                                setTwoFactorEnableCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={enableTwoFactor}
                            disabled={isTwoFactorSubmitting}
                            className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-3 text-sm font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isTwoFactorSubmitting ? "Verifying..." : "Enable 2FA"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-5">
                      <p className="text-sm font-medium text-white">Authenticator QR</p>
                      {twoFactorSetup.qrCodeDataUrl ? (
                        <>
                          <div className="mt-4 flex justify-center rounded-[1.4rem] border border-[#2c3852] bg-white p-4">
                            <Image
                              src={twoFactorSetup.qrCodeDataUrl}
                              alt="2FA QR code"
                              width={224}
                              height={224}
                              className="h-56 w-56 rounded-xl object-contain"
                              unoptimized
                            />
                          </div>
                          <div className="mt-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">Manual Entry Key</p>
                            <p className="mt-2 break-all rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d7dfec]">
                              {twoFactorSetup.manualEntryKey}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="mt-4 rounded-[1.4rem] border border-dashed border-[#2c3852] bg-[#101b2d] px-4 py-10 text-center text-sm text-[#8ea7c2]">
                          Generate setup first to show the QR code.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-5">
                      <p className="text-sm font-medium text-white">2FA is protecting this admin account.</p>
                      <p className="mt-3 text-sm leading-7 text-[#9fb1c7]">
                        Every future login will require the email, password, and current 6-digit authenticator code.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-5">
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Current 2FA Code</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={twoFactorDisableCode}
                        onChange={(event) =>
                          setTwoFactorDisableCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                      />
                      <button
                        type="button"
                        onClick={disableTwoFactor}
                        disabled={isTwoFactorSubmitting}
                        className="mt-4 w-full rounded-xl border border-red-400/30 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isTwoFactorSubmitting ? "Disabling..." : "Disable 2FA"}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Website Settings"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "services" && (
            <form className="space-y-6" onSubmit={handleServicesSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Service Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Service list and content settings</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Created services are shown as a clean list here. Use the popup form to create a new service without stretching the page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addServiceItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-3 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Service
                  </button>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Section Title</label>
                    <input
                      className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.serviceSectionTitle}
                      onChange={(event) => updateField("serviceSectionTitle", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Section Subtitle</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                      value={form.serviceSectionSubtitle}
                      onChange={(event) => updateField("serviceSectionSubtitle", event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {form.services.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#2b3b55] bg-[#0c1627] p-8 text-center text-sm text-[#95a9bf]">
                      No services added yet.
                    </div>
                  ) : (
                    form.services.map((service, index) => (
                      <div
                        key={`service-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                                {service.icon || "briefcase"}
                              </span>
                              {service.isFeatured ? (
                                <span className="rounded-full border border-[#2d5f4c] bg-[#0f241b] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ff0be]">
                                  Featured
                                </span>
                              ) : null}
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {service.status ? "Live" : "Hidden"}
                              </span>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {service.name || "Untitled service"}
                            </h4>
                            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#9fb1c7]">
                              {service.description || "No description added yet."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#bfd0e2]">
                              <span>{service.slug || "no-slug"}</span>
                              <span>{service.comments.length} comments</span>
                              <span>
                                {service.comments.reduce((sum, item) => sum + item.replies.length, 0)} replies
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditServiceModal(index)}
                              className="rounded-xl border border-[#36557e] px-4 py-2 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeServiceItem(index)}
                              className="rounded-xl border border-[#5a3040] px-4 py-2 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Services"}
                </button>
              </div>

              {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Service Form</p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {editingServiceIndex >= 0 ? "Edit Service" : "Create New Service"}
                        </h4>
                        <p className="mt-2 text-sm text-[#97a9be]">
                          Keep the service card compact here, then write the full service details in the editor.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closeServiceModal}
                          className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveServiceDraft}
                          className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90"
                        >
                          {editingServiceIndex >= 0 ? "Update Service" : "Add Service"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                      <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                            <h5 className="mt-2 text-lg font-semibold text-white">Service information</h5>
                          </div>
                          <span className="rounded-full border border-[#2b4c70] bg-[#10233a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                            {serviceDraft.status ? "Published" : "Draft"}
                          </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Name</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="UI/UX Design"
                              value={serviceDraft.name}
                              onChange={(event) => {
                                updateServiceDraft("name", event.target.value);
                                if (!serviceDraft.slug || slugify(serviceDraft.slug) === slugify(serviceDraft.name)) {
                                  updateServiceDraft("slug", slugify(event.target.value));
                                }
                              }}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Slug</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="ui-ux-design"
                              value={serviceDraft.slug}
                              onChange={(event) => updateServiceDraft("slug", slugify(event.target.value))}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Icon</label>
                            <div className="rounded-xl border border-[#2c3852] bg-[#101b2d] p-3">
                              <button
                                type="button"
                                onClick={() => setIsServiceIconDropdownOpen((current) => !current)}
                                className="flex w-full items-center justify-between rounded-xl border border-[#2c3852] bg-[#0d1728] px-4 py-3 text-left text-white transition hover:border-[#49c1ff]"
                              >
                                <span className="flex items-center gap-3">
                                  {(() => {
                                    const selectedIcon = getServiceIconOption(serviceDraft.icon);
                                    const Icon = selectedIcon.icon;
                                    return (
                                      <>
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#29405d] bg-[#11253a] text-[#8fdcff]">
                                          <Icon size={18} />
                                        </span>
                                        <span>
                                          <span className="block font-medium">{selectedIcon.label}</span>
                                          <span className="block text-xs uppercase tracking-[0.24em] text-[#89a2bd]">
                                            {selectedIcon.value}
                                          </span>
                                        </span>
                                      </>
                                    );
                                  })()}
                                </span>
                                <span className="text-sm text-[#8fdcff]">{isServiceIconDropdownOpen ? "Hide" : "Choose"}</span>
                              </button>

                              {isServiceIconDropdownOpen ? (
                                <div className="mt-3 grid max-h-[16rem] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3">
                                  {serviceIconOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isActive = serviceDraft.icon === option.value;

                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                          updateServiceDraft("icon", option.value);
                                          setIsServiceIconDropdownOpen(false);
                                        }}
                                        className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-xs transition ${
                                          isActive
                                            ? "border-[#49c1ff] bg-[#12243b] text-white"
                                            : "border-[#2c3852] bg-[#0d1728] text-[#d3d8e8] hover:border-[#49c1ff]"
                                        }`}
                                      >
                                        <Icon size={18} />
                                        <span className="mt-2 text-center leading-4">{option.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Short Description</label>
                            <textarea
                              className="min-h-[130px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Write a short summary for the service card."
                              value={serviceDraft.description}
                              onChange={(event) => updateServiceDraft("description", event.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Visibility</p>
                          <div className="mt-4 grid gap-4">
                            <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d7dfec]">
                              <input
                                type="checkbox"
                                checked={serviceDraft.isFeatured}
                                onChange={(event) => updateServiceDraft("isFeatured", event.target.checked)}
                              />
                              Featured on homepage
                            </label>

                            <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d7dfec]">
                              <input
                                type="checkbox"
                                checked={serviceDraft.status}
                                onChange={(event) => updateServiceDraft("status", event.target.checked)}
                              />
                              Show service publicly
                            </label>
                          </div>
                        </div>

                        <div className="rounded-[1.6rem] border border-[#2b3d58] bg-[#0b1524] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#8ba0b7]">Preview</p>
                          <div className="mt-4 rounded-[1.25rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0c1523)] p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-[#8ad7ff]">
                                {(() => {
                                  const selectedIcon = getServiceIconOption(serviceDraft.icon);
                                  const Icon = selectedIcon.icon;
                                  return (
                                    <>
                                      <Icon size={14} />
                                      <span>{selectedIcon.label}</span>
                                    </>
                                  );
                                })()}
                              </span>
                              {serviceDraft.isFeatured ? (
                                <span className="rounded-full border border-[#2d5f4c] bg-[#0f241b] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8ff0be]">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                            <h6 className="mt-4 text-lg font-semibold text-white">
                              {serviceDraft.name || "Service title"}
                            </h6>
                            <p className="mt-3 text-sm leading-7 text-[#9fb1c7]">
                              {serviceDraft.description || "Service card description preview."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Service Content</p>
                          <h5 className="mt-2 text-lg font-semibold text-white">Detailed description</h5>
                        </div>
                        <p className="text-sm text-[#97a9be]">
                          Comments and replies are hidden from this form on the front end.
                        </p>
                      </div>
                      <RichTextEditor
                        id={`service-draft-content-${editingServiceIndex >= 0 ? editingServiceIndex : "new"}`}
                        label="Content"
                        value={serviceDraft.content}
                        onChange={(nextValue) => updateServiceDraft("content", nextValue)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "hero" && (
            <form className="space-y-6" onSubmit={handleSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Hero Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Main landing content</h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-[1.5rem] border border-[#2c3852] bg-[#101b2d]">
                    <Image
                      src={buildPublicAssetUrl(form.profile || "/profile.png")}
                      alt="Profile preview"
                      width={220}
                      height={260}
                      className="h-[260px] w-full object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border border-dashed border-[#32455f] bg-[#0c1627] p-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Upload profile photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageUpload(event)}
                        disabled={isUploadingImage}
                        className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#2a8fd8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3aa1ea]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Upload CV PDF</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleResumeUpload}
                        disabled={isUploadingResume}
                        className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#57d0a0] file:px-4 file:py-2 file:font-semibold file:text-[#07121d] hover:file:bg-[#76ddb5]"
                      />
                    </div>
                    <p className="text-xs text-[#8b98a5]">
                      {isUploadingImage
                        ? "Uploading image..."
                        : isUploadingResume
                          ? "Uploading resume..."
                          : "Profile image and CV uploads are saved directly to the hero section."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    ["name", "Name"],
                    ["designation", "Designation"],
                    ["resume", "CV PDF Path"],
                    ["heroSkillsTitle", "Skills Section Text"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-medium text-[#d7dfec]">{label}</label>
                      <input
                        className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                        value={form[key]}
                        onChange={(event) => updateField(key, event.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Description</label>
                  <textarea
                    className="min-h-[150px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Hero Skills</h4>
                    <button
                      type="button"
                      onClick={addHeroSkill}
                      className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                    >
                      Add Skill
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.heroSkills.map((skill, index) => (
                      <div
                        key={`hero-skill-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-medium text-[#d3d8e8]">Skill {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeHeroSkill(index)}
                            className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
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
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Skill Name</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              value={skill.name}
                              onChange={(event) => updateHeroSkill(index, "name", event.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Upload skill image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleImageUpload(event, { type: "skill", index })}
                            disabled={isUploadingImage}
                            className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#2a8fd8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3aa1ea]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Social Links</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Header and footer social items</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add New
                  </button>
                </div>

                <div className="space-y-4">
                  {form.socialLinks.map((item, index) => (
                    <div
                      key={`social-link-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Social Link {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Select Icon</label>
                          <div className="rounded-xl border border-[#2c3852] bg-[#101b2d] p-3">
                            <input
                              className="mb-3 w-full rounded-xl border border-[#2c3852] bg-[#0d1728] px-4 py-3 text-sm text-white outline-none transition focus:border-[#49c1ff]"
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
                                        ? "border-[#49c1ff] bg-[#12243b] text-white"
                                        : "border-[#2c3852] bg-[#0d1728] text-[#d3d8e8] hover:border-[#49c1ff]"
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
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Platform Name</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder={getSocialIconOption(item.icon)?.label || "Platform name"}
                            value={item.label}
                            onChange={(event) => updateSocialLink(index, "label", event.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Link</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="https://..."
                            value={item.link}
                            onChange={(event) => updateSocialLink(index, "link", event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Stats Counter</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Homepage metrics cards</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addCounterItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add New
                  </button>
                </div>

                <div className="space-y-4">
                  {form.statsCounters.map((item, index) => (
                    <div
                      key={`counter-item-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Counter Item {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeCounterItem(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Label</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            value={item.label}
                            onChange={(event) => updateCounterItem(index, "label", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Highlight</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            value={item.highlight}
                            onChange={(event) => updateCounterItem(index, "highlight", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Count</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            value={item.count}
                            onChange={(event) => updateCounterItem(index, "count", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Icon</label>
                          <div className="rounded-xl border border-[#2c3852] bg-[#101b2d] p-3">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCounterIconIndex((current) => (current === index ? null : index))
                              }
                              className="flex w-full items-center justify-between rounded-xl border border-[#2c3852] bg-[#0d1728] px-4 py-3 text-left text-white transition hover:border-[#49c1ff]"
                            >
                              <span className="flex items-center gap-3">
                                {(() => {
                                  const selectedIcon = getStatsIconOption(item.icon);
                                  const Icon = selectedIcon.icon;
                                  return (
                                    <>
                                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#29405d] bg-[#11253a] text-[#8fdcff]">
                                        <Icon size={18} />
                                      </span>
                                      <span>
                                        <span className="block font-medium">{selectedIcon.label}</span>
                                        <span className="block text-xs uppercase tracking-[0.24em] text-[#89a2bd]">
                                          {selectedIcon.value}
                                        </span>
                                      </span>
                                    </>
                                  );
                                })()}
                              </span>
                              <span className="text-sm text-[#8fdcff]">
                                {openCounterIconIndex === index ? "Hide" : "Choose"}
                              </span>
                            </button>

                            {openCounterIconIndex === index ? (
                              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                                {statsIconOptions.map((option) => {
                                  const Icon = option.icon;
                                  const isActive = item.icon === option.value;

                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        updateCounterItem(index, "icon", option.value);
                                        setOpenCounterIconIndex(null);
                                      }}
                                      className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-xs transition ${
                                        isActive
                                          ? "border-[#49c1ff] bg-[#12243b] text-white"
                                          : "border-[#2c3852] bg-[#0d1728] text-[#d3d8e8] hover:border-[#49c1ff]"
                                      }`}
                                    >
                                      <Icon size={18} />
                                      <span className="mt-2 text-center leading-4">{option.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-[#273056] bg-[#11172b] p-4">
                        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#8b98a5]">Preview</p>
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] text-white">
                            {(() => {
                              const Icon = getStatsIconOption(item.icon)?.icon;
                              return <Icon size={18} />;
                            })()}
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-[#8fdcff]">
                              {item.highlight || "Highlight"}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-white">{item.count || "0"}</p>
                            <p className="mt-1 text-sm text-[#c9cfde]">{item.label || "Counter label"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Counter Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "achievement" && (
            <form className="space-y-6" onSubmit={handleAchievementsSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Achievement Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Awards, certificates, and recognitions</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addAchievementItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add New
                  </button>
                </div>

                <div className="space-y-4">
                  {form.achievements.map((item, index) => (
                    <div
                      key={`achievement-item-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Achievement {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeAchievementItem(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <div className="overflow-hidden rounded-[1.25rem] border border-[#2c3852] bg-[#101b2d]">
                            {item.image ? (
                              <Image
                                src={buildPublicAssetUrl(item.image)}
                                alt={item.title || "Achievement preview"}
                                width={180}
                                height={180}
                                className="h-[180px] w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-[180px] items-center justify-center text-center text-xs uppercase tracking-[0.25em] text-[#8fdcff]">
                                {item.type || "No image"}
                              </div>
                            )}
                          </div>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="/uploads/achievement.png"
                            value={item.image}
                            onChange={(event) => updateAchievementItem(index, "image", event.target.value)}
                          />
                          <label className="block cursor-pointer rounded-xl border border-[#36557e] px-4 py-3 text-center text-sm text-[#9ae2ff] transition hover:bg-[#12243b]">
                            {isUploadingImage ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handleImageUpload(event, { type: "achievement", index })}
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Title</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              value={item.title}
                              onChange={(event) => updateAchievementItem(index, "title", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Issuer</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              value={item.issuer}
                              onChange={(event) => updateAchievementItem(index, "issuer", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Date</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="2025"
                              value={item.date}
                              onChange={(event) => updateAchievementItem(index, "date", event.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Type</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Award / Certificate / Competition"
                              value={item.type}
                              onChange={(event) => updateAchievementItem(index, "type", event.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Achievement Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "projects" && (
            <form className="space-y-6" onSubmit={handleProjectsSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Project Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Project create, edit, and delete</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Keep project cards compact here, then open the popup to manage image, counters, tools, and multiple buttons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addProjectItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-3 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Project
                  </button>
                </div>

                <div className="mt-8 grid gap-4">
                  {form.projects.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#2b3b55] bg-[#0c1627] p-8 text-center text-sm text-[#95a9bf]">
                      No projects added yet.
                    </div>
                  ) : (
                    form.projects.map((project, index) => (
                      <div
                        key={`project-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                                {project.role || "Role"}
                              </span>
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {Number(project.views) || 0} views
                              </span>
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {Number(project.impressionCount) || 0} impressions
                              </span>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {project.name || "Untitled project"}
                            </h4>
                            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#9fb1c7]">
                              {project.description || "No description added yet."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#bfd0e2]">
                              <span>{(project.tools || []).filter(Boolean).length} tools</span>
                              <span>{(project.buttons || []).filter((item) => item?.text && item?.link).length} buttons</span>
                              <span>{project.image ? "Image ready" : "No image"}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditProjectModal(index)}
                              className="rounded-xl border border-[#36557e] px-4 py-2 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProjectItem(index)}
                              className="rounded-xl border border-[#5a3040] px-4 py-2 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Projects"}
                </button>
              </div>

              {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Project Form</p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {editingProjectIndex >= 0 ? "Edit Project" : "Create New Project"}
                        </h4>
                        <p className="mt-2 text-sm text-[#97a9be]">
                          Add project details, image, links, and multiple custom buttons from one place.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closeProjectModal}
                          className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveProjectDraft}
                          className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90"
                        >
                          {editingProjectIndex >= 0 ? "Update Project" : "Add Project"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1.15fr)]">
                      <div className="space-y-5">
                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Preview</p>
                          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0c1523)]">
                            <div className="relative h-44 w-full border-b border-[#24344d] bg-[#09111d]">
                              {projectDraft.image ? (
                                <Image
                                  src={buildPublicAssetUrl(projectDraft.image)}
                                  alt={projectDraft.name || "Project preview"}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-[#7e92a8]">
                                  Project image preview
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h6 className="text-lg font-semibold text-white">
                                {projectDraft.name || "Project title"}
                              </h6>
                              <p className="mt-2 text-sm text-[#8fdcff]">{projectDraft.role || "Project role"}</p>
                              <p className="mt-3 text-sm leading-7 text-[#9fb1c7]">
                                {projectDraft.description || "Project summary preview."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Links</p>
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Code Link</label>
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder="https://github.com/..."
                                value={projectDraft.code}
                                onChange={(event) => updateProjectDraft("code", event.target.value)}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Demo Link</label>
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder="https://project-demo.com"
                                value={projectDraft.demo}
                                onChange={(event) => updateProjectDraft("demo", event.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                              <h5 className="mt-2 text-lg font-semibold text-white">Project information</h5>
                            </div>
                            <span className="rounded-full border border-[#2b4c70] bg-[#10233a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                              {editingProjectIndex >= 0 ? "Editing" : "New"}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Project Name</label>
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder="Travel Agency App"
                                value={projectDraft.name}
                                onChange={(event) =>
                                  setProjectDraft((current) => ({
                                    ...current,
                                    name: event.target.value,
                                    slug: slugify(event.target.value),
                                  }))
                                }
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Slug</label>
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#0d1728] px-4 py-3 text-[#9fb1c7] outline-none"
                                value={projectDraft.slug || slugify(projectDraft.name)}
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Role</label>
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder="Full Stack Developer"
                                value={projectDraft.role}
                                onChange={(event) => updateProjectDraft("role", event.target.value)}
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Project Image</label>
                              <div className="rounded-xl border border-[#2c3852] bg-[#101b2d] p-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white">
                                    {isUploadingImage ? "Uploading..." : "Upload Image"}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(event) => handleImageUpload(event, { type: "project" })}
                                      disabled={isUploadingImage}
                                    />
                                  </label>
                                  <input
                                    className="min-w-0 flex-1 rounded-xl border border-[#2c3852] bg-[#0d1728] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                    placeholder="/uploads/project-cover.png"
                                    value={projectDraft.image}
                                    onChange={(event) => updateProjectDraft("image", event.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Description</label>
                              <textarea
                                className="min-h-[130px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder="Write a clear summary of the project."
                                value={projectDraft.description}
                                onChange={(event) => updateProjectDraft("description", event.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Project Tools</p>
                              <p className="mt-1 text-sm text-[#9fb1c7]">Each tool will be shown as a stack item.</p>
                            </div>
                            <button
                              type="button"
                              onClick={addProjectTool}
                              className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                            >
                              Add Tool
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(projectDraft.tools || [""]).map((tool, index) => (
                              <div key={`project-tool-${index}`} className="flex gap-3">
                                <input
                                  className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                  placeholder={`Tool ${index + 1}`}
                                  value={tool}
                                  onChange={(event) => updateProjectTool(index, event.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProjectTool(index)}
                                  className="rounded-xl border border-[#5a3040] px-4 py-3 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Project Content</p>
                              <h5 className="mt-2 text-lg font-semibold text-white">Detailed project story</h5>
                            </div>
                            <p className="text-sm text-[#97a9be]">
                              This content appears after the tools section on the public detail page.
                            </p>
                          </div>

                          <RichTextEditor
                            id="project-content-editor"
                            label="Content"
                            value={projectDraft.content}
                            onChange={(nextValue) => updateProjectDraft("content", nextValue)}
                          />
                        </div>

                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Buttons</p>
                              <p className="mt-1 text-sm text-[#9fb1c7]">Add multiple custom button text and link pairs.</p>
                            </div>
                            <button
                              type="button"
                              onClick={addProjectButton}
                              className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                            >
                              Add Button
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(projectDraft.buttons || [emptyProjectButton()]).map((button, index) => (
                              <div key={`project-button-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                                <input
                                  className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                  placeholder="Button text"
                                  value={button.text}
                                  onChange={(event) => updateProjectButton(index, "text", event.target.value)}
                                />
                                <input
                                  className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                  placeholder="https://example.com"
                                  value={button.link}
                                  onChange={(event) => updateProjectButton(index, "link", event.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProjectButton(index)}
                                  className="rounded-xl border border-[#5a3040] px-4 py-3 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "skills" && (
            <form className="space-y-6" onSubmit={handleSkillsSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Skills Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Homepage skills cards</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      These items power the real skills marquee section on the homepage. Hero skills are not affected here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSkillItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="space-y-4">
                  {form.skills.map((skill, index) => (
                    <div
                      key={`real-skill-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Skill {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeSkillItem(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-[140px_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <div className="overflow-hidden rounded-[1.25rem] border border-[#324760] bg-[radial-gradient(circle_at_top,rgba(112,213,255,0.18),transparent_55%),#0f192a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <Image
                              src={skill.image || "/profile.png"}
                              alt={skill.name || `Skill ${index + 1}`}
                              width={140}
                              height={140}
                              className="h-[140px] w-full object-contain p-4"
                              unoptimized
                            />
                          </div>
                          <div className="rounded-[1rem] border border-[#253953] bg-[#0d1728] px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-[#87a2bd]">Preview</p>
                            <p className="mt-2 truncate text-sm font-medium text-white">
                              {skill.name || `Skill ${index + 1}`}
                            </p>
                            <p className="mt-1 text-xs text-[#8fb3cf]">
                              {Math.max(0, Math.min(100, Number(skill.percentage) || 0))}% proficiency
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Skill Name</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="React"
                              value={skill.name}
                              onChange={(event) => updateSkillItem(index, "name", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Percentage</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="80"
                              value={skill.percentage}
                              onChange={(event) => updateSkillItem(index, "percentage", event.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Image URL</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="https://cdn.simpleicons.org/react"
                              value={skill.image}
                              onChange={(event) => updateSkillItem(index, "image", event.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-dashed border-[#304764] bg-[#0c1627] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-[#d7dfec]">Upload skill image</label>
                            <p className="text-xs leading-6 text-[#8b98a5]">
                              Use upload for the safest result, or paste a direct image URL above.
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleImageUpload(event, { type: "real-skill", index })}
                            disabled={isUploadingImage}
                            className="block w-full cursor-pointer text-sm text-[#d3d8e8] lg:max-w-[340px] file:mr-4 file:rounded-lg file:border-0 file:bg-[#2a8fd8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3aa1ea]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Skills Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "experience" && (
            <form className="space-y-6" onSubmit={handleExperiencesSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Experience Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Homepage experience timeline</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Manage each role, company, location or workplace, duration, and the long-form description shown on the public homepage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addExperienceItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Experience
                  </button>
                </div>

                <div className="space-y-4">
                  {form.experiences.map((item, index) => (
                    <div
                      key={`experience-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Experience {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeExperienceItem(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Title</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="Senior Frontend Developer"
                            value={item.title}
                            onChange={(event) => updateExperienceItem(index, "title", event.target.value)}
                          />
                        </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Company</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Acme Studio"
                              value={item.company}
                              onChange={(event) => updateExperienceItem(index, "company", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Location / Workplace</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Remote or Dhaka, Bangladesh"
                              value={item.location}
                              onChange={(event) => updateExperienceItem(index, "location", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Duration</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Jan 2023 - Present"
                              value={item.duration}
                            onChange={(event) => updateExperienceItem(index, "duration", event.target.value)}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <RichTextEditor
                            id={`experience-description-${index}`}
                            label="Description"
                            value={item.description}
                            onChange={(nextValue) => updateExperienceItem(index, "description", nextValue)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Experience Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "education" && (
            <form className="space-y-6" onSubmit={handleEducationsSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Education Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Homepage education timeline</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Manage each education entry, including institution, department, duration, and achievement details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEducationItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Education
                  </button>
                </div>

                <div className="space-y-4">
                  {form.educations.map((item, index) => (
                    <div
                      key={`education-${index}`}
                      className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-[#d3d8e8]">Education {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeEducationItem(index)}
                          className="text-sm text-[#ffb6c6] transition hover:text-[#ffd1db]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Title</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="Bachelor of Science"
                            value={item.title}
                            onChange={(event) => updateEducationItem(index, "title", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Institution</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="University name"
                            value={item.institution}
                            onChange={(event) => updateEducationItem(index, "institution", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Department</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="Computer Science"
                            value={item.department}
                            onChange={(event) => updateEducationItem(index, "department", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Duration</label>
                          <input
                            className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                            placeholder="2020 - 2024"
                            value={item.duration}
                            onChange={(event) => updateEducationItem(index, "duration", event.target.value)}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <RichTextEditor
                            id={`education-achievement-${index}`}
                            label="Achievement"
                            value={item.achievement}
                            onChange={(nextValue) => updateEducationItem(index, "achievement", nextValue)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Education Section"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "pricing" && (
            <form className="space-y-6" onSubmit={handlePricingSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Pricing Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Pricing plans and package settings</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Plans stay compact in this list, and the full create form opens in a popup so the admin page stays clean.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPricingItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-3 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Pricing
                  </button>
                </div>

                <div className="mt-8 grid gap-4">
                  {form.pricings.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#2b3b55] bg-[#0c1627] p-8 text-center text-sm text-[#95a9bf]">
                      No pricing plans added yet.
                    </div>
                  ) : (
                    form.pricings.map((pricing, index) => (
                      <div
                        key={`pricing-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                                {pricing.duration || "Monthly"}
                              </span>
                              {pricing.isPopular ? (
                                <span className="rounded-full border border-[#4e4630] bg-[#221a0f] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#ffd37a]">
                                  Popular
                                </span>
                              ) : null}
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {pricing.status ? "Live" : "Hidden"}
                              </span>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {pricing.name || "Untitled plan"}
                            </h4>
                            <p className="mt-2 text-2xl font-semibold text-[#9ae2ff]">
                              ${Number(pricing.price || 0).toFixed(2)}
                            </p>
                            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#9fb1c7]">
                              {pricing.description || "No description added yet."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#bfd0e2]">
                              <span>{pricing.slug || "no-slug"}</span>
                              <span>{(pricing.features || []).filter(Boolean).length} features</span>
                              <span>{pricing.duration || "Custom duration"}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditPricingModal(index)}
                              className="rounded-xl border border-[#36557e] px-4 py-2 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removePricingItem(index)}
                              className="rounded-xl border border-[#5a3040] px-4 py-2 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Pricing Section"}
                </button>
              </div>

              {isPricingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Pricing Form</p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {editingPricingIndex >= 0 ? "Edit Pricing Plan" : "Create New Pricing Plan"}
                        </h4>
                        <p className="mt-2 text-sm text-[#97a9be]">
                          Add the plan details here, including the duration, feature list, and whether it should be highlighted as popular.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closePricingModal}
                          className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={savePricingDraft}
                          className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90"
                        >
                          {editingPricingIndex >= 0 ? "Update Pricing" : "Add Pricing"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                      <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                            <h5 className="mt-2 text-lg font-semibold text-white">Pricing information</h5>
                          </div>
                          <span className="rounded-full border border-[#2b4c70] bg-[#10233a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                            {pricingDraft.status ? "Published" : "Draft"}
                          </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Plan Name</label>
                        <input
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          placeholder="Starter Plan"
                          value={pricingDraft.name}
                          onChange={(event) =>
                            setPricingDraft((current) => {
                              const nextName = event.target.value;
                              const shouldSyncSlug =
                                !current.slug || slugify(current.slug) === slugify(current.name);

                              return {
                                ...current,
                                name: nextName,
                                slug: shouldSyncSlug ? slugify(nextName) : current.slug,
                              };
                            })
                          }
                        />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Slug</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="starter-plan"
                              value={pricingDraft.slug}
                              onChange={(event) => updatePricingDraft("slug", slugify(event.target.value))}
                            />
                          </div>

                          <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          placeholder="99"
                          value={pricingDraft.price}
                          onChange={(event) => updatePricingDraft("price", event.target.value)}
                        />
                          </div>

                          <div>
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Duration</label>
                        <select
                          className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          value={pricingDraft.duration}
                          onChange={(event) => updatePricingDraft("duration", event.target.value)}
                        >
                          {["Hourly", "Weekly", "Monthly", "Quarterly", "Semi-Annual", "Annual"].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                          </div>

                          <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Description</label>
                        <textarea
                          className="min-h-[120px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                          placeholder="Write a short plan summary..."
                          value={pricingDraft.description}
                          onChange={(event) => updatePricingDraft("description", event.target.value)}
                        />
                          </div>

                          <div className="lg:col-span-2">
                            <RichTextEditor
                              id="pricing-content-editor"
                              label="Content"
                              value={pricingDraft.content}
                              onChange={(nextValue) => updatePricingDraft("content", nextValue)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Features</p>
                            <p className="mt-1 text-sm text-[#9fb1c7]">Each feature will be saved as a list item.</p>
                          </div>
                          <button
                            type="button"
                            onClick={addPricingFeature}
                            className="rounded-xl border border-[#4dc4ff] px-4 py-2 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                          >
                            Add Feature
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(pricingDraft.features || [""]).map((feature, index) => (
                            <div key={`pricing-feature-${index}`} className="flex gap-3">
                              <input
                                className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                                placeholder={`Feature ${index + 1}`}
                                value={feature}
                                onChange={(event) => updatePricingFeature(index, event.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removePricingFeature(index)}
                                className="rounded-xl border border-[#5a3040] px-4 py-3 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Visibility</p>
                          <div className="mt-4 space-y-3">
                            <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                              <input
                                type="checkbox"
                                checked={pricingDraft.status}
                                onChange={(event) => updatePricingDraft("status", event.target.checked)}
                              />
                              Show this plan publicly
                            </label>

                            <label className="flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                              <input
                                type="checkbox"
                                checked={pricingDraft.isPopular}
                                onChange={(event) => updatePricingDraft("isPopular", event.target.checked)}
                              />
                              Mark as popular
                            </label>
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Preview</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#8fa4bb]">
                            /pricing/{pricingDraft.slug || "your-plan-slug"}
                          </p>
                          <p className="mt-3 text-xl font-semibold text-white">
                            {pricingDraft.name || "Untitled plan"}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#9ae2ff]">
                            ${Number(pricingDraft.price || 0).toFixed(2)}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#9fb1c7]">
                            {pricingDraft.description || "No description added yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "faq" && (
            <form className="space-y-6" onSubmit={handleFaqSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">FAQ Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Frequently asked questions</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Add common questions and detailed answers. The compact list stays clean, and full editing opens in a popup with CKEditor support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-3 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add FAQ
                  </button>
                </div>

                <div className="mt-8 grid gap-4">
                  {form.faqs.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#2b3b55] bg-[#0c1627] p-8 text-center text-sm text-[#95a9bf]">
                      No FAQ entries added yet.
                    </div>
                  ) : (
                    form.faqs.map((faq, index) => (
                      <div
                        key={`faq-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                                FAQ Entry
                              </span>
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {faq.status ? "Published" : "Draft"}
                              </span>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {faq.question || "Untitled question"}
                            </h4>
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#9fb1c7]">
                              {stripHtml(faq.answer) || "No answer added yet."}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditFaqModal(index)}
                              className="rounded-xl border border-[#36557e] px-4 py-2 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFaqItem(index)}
                              className="rounded-xl border border-[#5a3040] px-4 py-2 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save FAQs"}
                </button>
              </div>

              {isFaqModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">FAQ Form</p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {editingFaqIndex >= 0 ? "View or Edit FAQ" : "Create New FAQ"}
                        </h4>
                        <p className="mt-2 text-sm text-[#97a9be]">
                          Write the question and a polished answer. Answers support rich formatting through CKEditor.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closeFaqModal}
                          className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={saveFaqDraft}
                          className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90"
                        >
                          {editingFaqIndex >= 0 ? "Update FAQ" : "Add FAQ"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                      <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                            <h5 className="mt-2 text-lg font-semibold text-white">FAQ information</h5>
                          </div>
                          <span className="rounded-full border border-[#2b4c70] bg-[#10233a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                            {faqDraft.status ? "Published" : "Draft"}
                          </span>
                        </div>

                        <div className="grid gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Question</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Write the question..."
                              value={faqDraft.question}
                              onChange={(event) => updateFaqDraft("question", event.target.value)}
                            />
                          </div>

                          <div>
                            <RichTextEditor
                              id={`faq-answer-editor-${editingFaqIndex >= 0 ? editingFaqIndex : "new"}`}
                              label="Answer"
                              value={faqDraft.answer}
                              onChange={(nextValue) => updateFaqDraft("answer", nextValue)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Visibility</p>
                          <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d3d8e8]">
                            <input
                              type="checkbox"
                              checked={faqDraft.status}
                              onChange={(event) => updateFaqDraft("status", event.target.checked)}
                            />
                            Show this FAQ publicly
                          </label>
                        </div>

                        <div className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4">
                          <p className="text-sm uppercase tracking-[0.24em] text-[#79d4ff]">Preview</p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {faqDraft.question || "Question preview"}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-[#9fb1c7]">
                            {stripHtml(faqDraft.answer) || "Answer preview will appear here."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "testimonials" && (
            <form className="space-y-6" onSubmit={handleTestimonialsSave}>
              <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Testimonials Section</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Client reviews and trust signals</h3>
                    <p className="mt-2 text-sm leading-7 text-[#9fb1c7]">
                      Add testimonials with rich text, image, company, and publish status. The list below lets you view, edit, and delete each entry.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTestimonialItem}
                    className="rounded-xl border border-[#4dc4ff] px-4 py-3 text-sm font-medium text-[#9ae2ff] transition hover:bg-[#12304b] hover:text-white"
                  >
                    Add Testimonial
                  </button>
                </div>

                <div className="mt-8 grid gap-4">
                  {form.testimonials.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#2b3b55] bg-[#0c1627] p-8 text-center text-sm text-[#95a9bf]">
                      No testimonials added yet.
                    </div>
                  ) : (
                    form.testimonials.map((testimonial, index) => (
                      <div
                        key={`testimonial-${index}`}
                        className="rounded-[1.5rem] border border-[#24344d] bg-[linear-gradient(180deg,#101a2c,#0b1422)] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2e5074] bg-[#10243a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                                {testimonial.company || "No company"}
                              </span>
                              <span className="rounded-full border border-[#32445d] bg-[#111d31] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#b3c2d4]">
                                {testimonial.status ? "Published" : "Unpublished"}
                              </span>
                            </div>
                            <h4 className="mt-4 text-xl font-semibold text-white">
                              {testimonial.name || "Unnamed testimonial"}
                            </h4>
                            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#7cf0b7]">
                              {testimonial.position || "No position"}
                            </p>
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#9fb1c7]">
                              {stripHtml(testimonial.content) || "No content added yet."}
                            </p>
                            <p className="mt-3 text-sm text-[#ffd27d]">
                              {"★".repeat(Math.max(1, Math.min(5, Number(testimonial.stars) || 5)))}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditTestimonialModal(index)}
                              className="rounded-xl border border-[#36557e] px-4 py-2 text-sm text-[#9ae2ff] transition hover:bg-[#12243b]"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTestimonialItem(index)}
                              className="rounded-xl border border-[#5a3040] px-4 py-2 text-sm text-[#ffb6c6] transition hover:bg-[#2b1420]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-6 py-3 font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save Testimonials"}
                </button>
              </div>

              {isTestimonialModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Testimonial Form</p>
                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          {editingTestimonialIndex >= 0 ? "View or Edit Testimonial" : "Create New Testimonial"}
                        </h4>
                        <p className="mt-2 text-sm text-[#97a9be]">
                          Add the client name, company, rich testimonial content, image, and publication status.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closeTestimonialModal}
                          className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={saveTestimonialDraft}
                          className="rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-2 text-sm font-semibold text-[#08111d] transition hover:opacity-90"
                        >
                          {editingTestimonialIndex >= 0 ? "Update Testimonial" : "Add Testimonial"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                      <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Core Details</p>
                            <h5 className="mt-2 text-lg font-semibold text-white">Testimonial information</h5>
                          </div>
                          <span className="rounded-full border border-[#2b4c70] bg-[#10233a] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#8ad7ff]">
                            {testimonialDraft.status ? "Published" : "Unpublished"}
                          </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Name</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Client name"
                              value={testimonialDraft.name}
                              onChange={(event) => updateTestimonialDraft("name", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Company</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="Company name"
                              value={testimonialDraft.company}
                              onChange={(event) => updateTestimonialDraft("company", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Position</label>
                            <input
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              placeholder="CEO / Product Manager"
                              value={testimonialDraft.position}
                              onChange={(event) => updateTestimonialDraft("position", event.target.value)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Stars</label>
                            <select
                              className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                              value={testimonialDraft.stars}
                              onChange={(event) => updateTestimonialDraft("stars", event.target.value)}
                            >
                              {[5, 4, 3, 2, 1].map((star) => (
                                <option key={star} value={star}>
                                  {star} Star{star > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="lg:col-span-2">
                            <RichTextEditor
                              id={`testimonial-content-editor-${editingTestimonialIndex >= 0 ? editingTestimonialIndex : "new"}`}
                              label="Content"
                              value={testimonialDraft.content}
                              onChange={(nextValue) => updateTestimonialDraft("content", nextValue)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Image</p>
                          <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-[#2c3852] bg-[#101b2d]">
                            <Image
                              src={buildPublicAssetUrl(testimonialDraft.image || "/profile.png")}
                              alt={testimonialDraft.name || "Testimonial image"}
                              width={280}
                              height={220}
                              className="h-[220px] w-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Upload image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleImageUpload(event, { type: "testimonial" })}
                              disabled={isUploadingImage}
                              className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#2a8fd8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3aa1ea]"
                            />
                          </div>
                        </div>

                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Visibility</p>
                          <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-sm text-[#d7dfec]">
                            <input
                              type="checkbox"
                              checked={testimonialDraft.status}
                              onChange={(event) => updateTestimonialDraft("status", event.target.checked)}
                            />
                            Show testimonial publicly
                          </label>
                        </div>

                        <div className="rounded-[1.6rem] border border-[#24344d] bg-[linear-gradient(180deg,#0d1728,#0a1321)] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-[#78d7ff]">Preview</p>
                          <p className="mt-4 text-lg font-semibold text-white">
                            {testimonialDraft.name || "Client name"}
                          </p>
                          <p className="mt-1 text-sm uppercase tracking-[0.24em] text-[#7cf0b7]">
                            {testimonialDraft.company || "Company name"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#8fb3cf]">
                            {testimonialDraft.position || "Position"}
                          </p>
                          <p className="mt-3 text-sm text-[#ffd27d]">
                            {"★".repeat(Math.max(1, Math.min(5, Number(testimonialDraft.stars) || 5)))}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-[#9fb1c7]">
                            {stripHtml(testimonialDraft.content) || "Testimonial preview will appear here."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {activeTab === "messages" && (
            <section className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Inbox</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Recent contact messages</h3>
              <div className="mt-6 overflow-x-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-[#8b98a5]">No messages found yet.</p>
                ) : (
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        {["Name", "Email", "Subject", "Message", "Status", "Actions"].map((label) => (
                          <th
                            key={label}
                            className="px-3 text-left text-xs uppercase tracking-[0.22em] text-[#8ea7c2]"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((message) => (
                        <tr key={message.id}>
                          <td className="rounded-l-[1.2rem] border border-[#24344d] border-r-0 bg-[#0b1524] px-3 py-4 text-sm text-white">
                            <div className="min-w-[140px]">
                              <p className="font-semibold">{message.name}</p>
                              <p className="mt-2 text-xs text-[#8ea7c2]">
                                {message.isNew ? "New" : "Updated"} • {formatThreadTimestamp(message.lastMessageAt || message.createdAt)}
                              </p>
                            </div>
                          </td>
                          <td className="border border-[#24344d] border-l-0 border-r-0 bg-[#0b1524] px-3 py-4 text-sm text-[#6bd4ff]">
                            <span className="block max-w-[220px] truncate">{message.email}</span>
                          </td>
                          <td className="border border-[#24344d] border-l-0 border-r-0 bg-[#0b1524] px-3 py-4 text-sm text-white">
                            <span className="block max-w-[220px] truncate">{message.subject || "No subject"}</span>
                          </td>
                          <td className="border border-[#24344d] border-l-0 border-r-0 bg-[#0b1524] px-3 py-4 text-sm text-[#d3d8e8]">
                            <span className="block max-w-[320px] truncate">
                              {String(message.latestReply?.message || message.message || "").slice(0, 50)}
                            </span>
                          </td>
                          <td className="border border-[#24344d] border-l-0 border-r-0 bg-[#0b1524] px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                                message.status === "solved"
                                  ? "bg-emerald-400/12 text-emerald-200"
                                  : message.isNew
                                    ? "bg-amber-300/12 text-amber-100"
                                    : "bg-sky-400/12 text-sky-200"
                              }`}
                            >
                              {message.status === "solved"
                                ? "Solved"
                                : message.isNew
                                  ? "New"
                                  : "Not Solved"}
                            </span>
                          </td>
                          <td className="rounded-r-[1.2rem] border border-[#24344d] border-l-0 bg-[#0b1524] px-3 py-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMessageThread(null);
                                  setMessageReplyDraft("");
                                  loadMessageThread(token, message.id);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2f4866] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#9fdcff] transition hover:border-[#70d5ff] hover:text-white"
                              >
                                <FiEye size={14} />
                                View
                              </button>
                              <button
                                type="button"
                                disabled={messageActionId === message.id}
                                onClick={() =>
                                  updateMessageStatus(
                                    token,
                                    message.id,
                                    message.status === "solved" ? "not_solved" : "solved",
                                  )
                                }
                                className="inline-flex items-center justify-center rounded-full border border-[#2f4866] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#d4e2f0] transition hover:border-[#70d5ff] hover:text-white disabled:opacity-60"
                              >
                                {message.status === "solved" ? "Not Solved" : "Solved"}
                              </button>
                              <button
                                type="button"
                                disabled={messageActionId === message.id}
                                onClick={() => deleteMessageTicket(token, message.id)}
                                className="inline-flex items-center justify-center rounded-full border border-red-400/20 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-red-200 transition hover:border-red-400/40 hover:text-white disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminSectionPage section="dashboard" />;
}
