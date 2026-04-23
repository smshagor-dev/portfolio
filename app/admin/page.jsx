"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { HiOutlineSparkles, HiOutlineUsers, HiOutlineViewGrid } from "react-icons/hi";
import { FiBarChart2, FiBookOpen, FiBriefcase, FiCode, FiDollarSign, FiFolder, FiLogOut, FiMail, FiMessageSquare, FiSettings } from "react-icons/fi";
import { getSocialIconOption, searchSocialIcons } from "@/utils/social-icons";
import { getServiceIconOption, serviceIconOptions } from "@/utils/service-icons";
import { getStatsIconOption, statsIconOptions } from "@/utils/stats-icons";

const RichTextEditor = dynamic(() => import("@/app/components/admin/rich-text-editor"), {
  ssr: false,
});

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    googleAnalyticsId: "",
    googleTagManagerId: "",
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
      googleAnalyticsId: sourceForm.siteSettings.googleAnalyticsId.trim(),
      googleTagManagerId: sourceForm.siteSettings.googleTagManagerId.trim(),
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
  { id: "settings", label: "Settings", icon: FiSettings, href: "/admin/settings" },
  { id: "hero", label: "Hero", icon: HiOutlineSparkles, href: "/admin/hero" },
  { id: "achievement", label: "Achievement", icon: HiOutlineUsers, href: "/admin/achievement" },
  { id: "testimonials", label: "Testimonials", icon: FiMessageSquare, href: "/admin/testimonials" },
  { id: "skills", label: "Skills", icon: FiCode, href: "/admin/skills" },
  { id: "experience", label: "Experience", icon: FiBriefcase, href: "/admin/experience" },
  { id: "education", label: "Education", icon: FiBookOpen, href: "/admin/education" },
  { id: "services", label: "Services", icon: HiOutlineViewGrid, href: "/admin/services" },
  { id: "projects", label: "Projects", icon: FiFolder, href: "/admin/projects" },
  { id: "pricing", label: "Pricing", icon: FiDollarSign, href: "/admin/pricing" },
  { id: "counter", label: "Counters", icon: FiBarChart2, href: "/admin/counters" },
  { id: "social", label: "Social", icon: HiOutlineUsers, href: "/admin/social" },
  { id: "messages", label: "Messages", icon: FiMail, href: "/admin/messages" },
];

export function AdminSectionPage({ section = "services" }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socialSearch, setSocialSearch] = useState({});
  const [openCounterIconIndex, setOpenCounterIconIndex] = useState(null);
  const [isServiceIconDropdownOpen, setIsServiceIconDropdownOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(-1);
  const [serviceDraft, setServiceDraft] = useState(emptyServiceItem());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricingIndex, setEditingPricingIndex] = useState(-1);
  const [pricingDraft, setPricingDraft] = useState(emptyPricingItem());
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

  const loadDashboard = useCallback(
    async (authToken) => {
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

  useEffect(() => {
    if (activeTab !== "services") {
      return undefined;
    }

    const serviceSlugs = serviceSocketKey ? serviceSocketKey.split("|").filter(Boolean) : [];

    if (!serviceSlugs.length) {
      return undefined;
    }

    const socket = io(backendUrl, {
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
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="rounded-3xl border border-[#24344d] bg-[#0d1728] px-8 py-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
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
  const activeTestimonials = form.testimonials.filter((item) => item.status).length;
  const totalTestimonials = form.testimonials.length;
  const testimonialsWithImage = form.testimonials.filter((item) => item.image.trim()).length;
  const settingsImagesCount = [
    form.siteSettings.seoImage,
    form.siteSettings.websiteIcon,
  ].filter((item) => String(item || "").trim()).length;
  const dashboardHighlights =
    activeTab === "settings"
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
      : [
          { label: "Active Services", value: activeServices, icon: HiOutlineViewGrid },
          { label: "Featured Services", value: featuredServices, icon: HiOutlineSparkles },
          { label: "Total Services", value: totalServices, icon: FiBarChart2 },
        ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(16,27,43,0.96),rgba(10,19,34,0.96))] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.35)] xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <div className="rounded-[1.5rem] border border-[#28405f] bg-[radial-gradient(circle_at_top,rgba(107,212,255,0.18),transparent_50%),#0d1728] p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Control Center</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Portfolio Admin</h1>
            <p className="mt-2 text-sm leading-6 text-[#9fb1c7]">
              Manage hero content, social links, counters, services, projects, and pricing from one place.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-[#4dc4ff] bg-[#11243b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : "border-[#23324a] bg-[#0d1728] text-[#bfd0e2] hover:border-[#36557e] hover:text-white"
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

          <div className="mt-6 rounded-[1.5rem] border border-[#23324a] bg-[#0c1627] p-4">
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
          <section className="rounded-[2rem] border border-[#24344d] bg-[linear-gradient(180deg,rgba(15,26,42,0.96),rgba(11,20,34,0.96))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#6bd4ff]">Admin Workspace</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Clean content management for your portfolio</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#a8b8ca]">
                  The admin area now runs on its own layout, with dedicated service, project, and pricing workflows plus a cleaner editorial flow.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#27435f] bg-[#102237] px-4 py-2 text-sm text-[#dce8f6]">
                <FiSettings size={15} />
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {dashboardHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-[#24344d] bg-[#0c1627] p-5"
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
              })}
            </div>
          </section>

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

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-[#24344d] bg-[#0d1728] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#6bd4ff]">Brand Assets</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">SEO image and website icon</h3>
                  <div className="mt-6 grid gap-4">
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
                      src={form.profile || "/profile.png"}
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
                                src={item.image}
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
                                  src={projectDraft.image}
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
                              src={testimonialDraft.image || "/profile.png"}
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
              <div className="mt-6 space-y-4">
                {messages.length === 0 && (
                  <p className="text-sm text-[#8b98a5]">No messages found yet.</p>
                )}
                {messages.map((message) => (
                  <div
                    className="rounded-[1.5rem] border border-[#24344d] bg-[#0b1524] p-4"
                    key={message.id}
                  >
                    <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-white">{message.name}</p>
                      <p className="text-xs text-[#8b98a5]">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mb-2 text-sm text-[#6bd4ff]">{message.email}</p>
                    <p className="text-sm leading-7 text-[#d3d8e8]">{message.message}</p>
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

export default function AdminDashboardPage() {
  return <AdminSectionPage section="services" />;
}
