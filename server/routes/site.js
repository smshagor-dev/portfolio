const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const prisma = require("../lib/prisma");
const { getBearerToken, verifyAdminToken } = require("../lib/auth");
const {
  getDefaultSiteSettings,
  isSmtpConfigured,
  normalizeSiteSettings,
  serializeSiteSettings,
} = require("../lib/site-settings");

const router = express.Router();
const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_request, file, callback) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const safeBaseName = path
      .basename(file.originalname || "comment-photo", ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "comment-photo";

    callback(null, `${Date.now()}-${safeBaseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed."));
      return;
    }

    callback(null, true);
  },
});

function serializeService(service) {
  return {
    ...service,
    comments: (service.comments || []).map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    })),
  };
}

function serializePricing(pricing) {
  return {
    ...pricing,
    features: Array.isArray(pricing?.features) ? pricing.features : [],
  };
}

function serializeTestimonial(testimonial) {
  return {
    ...testimonial,
    image: testimonial?.image || "/profile.png",
    position: testimonial?.position || "",
    stars: Math.max(1, Math.min(5, Number(testimonial?.stars) || 5)),
  };
}

function normalizeString(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function convertPlainTextToHtml(value) {
  return String(value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<p>${escapeHtml(item)}</p>`)
    .join("");
}

function serializeProject(project) {
  return {
    ...project,
    tools: Array.isArray(project?.tools) ? project.tools : [],
    buttons: Array.isArray(project?.buttons) ? project.buttons : [],
    comments: (project.comments || []).map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    })),
  };
}

function hasPricingModel() {
  return Boolean(prisma?.pricing && typeof prisma.pricing.findMany === "function");
}

function hasTestimonialModel() {
  return Boolean(prisma?.testimonial && typeof prisma.testimonial.findMany === "function");
}

function isMissingTableError(error, modelName) {
  return error?.code === "P2021" && error?.meta?.modelName === modelName;
}

async function getAchievementsSafely() {
  try {
    return await prisma.achievement.findMany({ orderBy: { sortOrder: "asc" } });
  } catch (error) {
    if (isMissingTableError(error, "Achievement")) {
      return [];
    }

    throw error;
  }
}

async function getTestimonialsSafely() {
  if (!hasTestimonialModel()) {
    return [];
  }

  try {
    const publishedTestimonials = await prisma.testimonial.findMany({
      where: { status: true },
      orderBy: { sortOrder: "asc" },
    });

    if (publishedTestimonials.length > 0) {
      return publishedTestimonials;
    }

    return await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    if (isMissingTableError(error, "Testimonial")) {
      return [];
    }

    throw error;
  }
}

async function getNextTestimonialSortOrder() {
  if (!hasTestimonialModel()) {
    return 1;
  }

  const latestItem = await prisma.testimonial.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (latestItem?.sortOrder || 0) + 1;
}

async function getSiteSettingsRecord() {
  const existingSettings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });

  if (existingSettings) {
    return existingSettings;
  }

  const defaults = getDefaultSiteSettings();
  return prisma.siteSettings.create({
    data: defaults,
  });
}

async function sendContactEmails(siteSettings, message) {
  const normalizedSettings = normalizeSiteSettings(siteSettings);
  if (!isSmtpConfigured(normalizedSettings)) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: normalizedSettings.smtpHost,
    port: normalizedSettings.smtpPort,
    secure: normalizedSettings.smtpSecure,
    auth:
      normalizedSettings.smtpUser || normalizedSettings.smtpPass
        ? {
            user: normalizedSettings.smtpUser,
            pass: normalizedSettings.smtpPass,
          }
        : undefined,
  });

  const from = normalizedSettings.smtpFromName
    ? `"${normalizedSettings.smtpFromName}" <${normalizedSettings.smtpFromEmail}>`
    : normalizedSettings.smtpFromEmail;

  const replyTo = normalizedSettings.smtpReplyToEmail || message.email;

  await transporter.sendMail({
    from,
    to: normalizedSettings.smtpToEmail,
    replyTo,
    subject: `New contact message from ${message.name}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      "",
      "Message:",
      message.message,
    ].join("\n"),
  });

  await transporter.sendMail({
    from,
    to: message.email,
    replyTo: normalizedSettings.smtpReplyToEmail || normalizedSettings.smtpFromEmail,
    subject: `We received your message${normalizedSettings.websiteTitle ? ` | ${normalizedSettings.websiteTitle}` : ""}`,
    text: [
      `Hi ${message.name},`,
      "",
      "Thanks for reaching out. Your message has been received successfully.",
      "We will get back to you as soon as possible.",
      "",
      "Your message:",
      message.message,
    ].join("\n"),
  });
}

async function getOptionalAdmin(request) {
  try {
    const token = getBearerToken(request.headers);
    if (!token) {
      return null;
    }

    const payload = verifyAdminToken(token);
    if (!payload?.email) {
      return null;
    }

    return prisma.adminUser.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  } catch (_error) {
    return null;
  }
}

async function getBlogs(devUsername) {
  if (!devUsername) {
    return [];
  }

  try {
    const response = await fetch(
      `https://dev.to/api/articles?username=${encodeURIComponent(devUsername)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const blogs = await response.json();

    return blogs.filter((blog) => blog?.cover_image);
  } catch (error) {
    console.error("Failed to fetch blogs:", error.message);
    return [];
  }
}

router.get("/home", async (_request, response) => {
  try {
    const [profile, siteSettings, serviceSection, services, statsCounters, achievements, skills, experiences, projects, educations, pricings, testimonials] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      prisma.serviceSection.findUnique({ where: { id: 1 } }),
      prisma.service.findMany({
        where: { status: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        include: {
          comments: {
            orderBy: { sortOrder: "asc" },
            include: {
              replies: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
      prisma.statsCounter.findMany({ orderBy: { sortOrder: "asc" } }),
      getAchievementsSafely(),
      prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
      hasPricingModel()
        ? prisma.pricing.findMany({
            where: { status: true },
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
          })
        : Promise.resolve([]),
      getTestimonialsSafely(),
    ]);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found." });
    }

    const blogs = await getBlogs(profile.devUsername);

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      serviceSection,
      services: services.map(serializeService),
      statsCounters,
      achievements,
      skills,
      experiences,
      projects: projects.map(serializeProject),
      educations,
      pricings: pricings.map(serializePricing),
      testimonials: testimonials.map(serializeTestimonial),
      blogs,
    });
  } catch (error) {
    console.error("Failed to load homepage data:", error.message);
    return response.status(500).json({ message: "Failed to load homepage data." });
  }
});

router.get("/pricing", async (_request, response) => {
  try {
    const [profile, siteSettings, pricings] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      hasPricingModel()
        ? prisma.pricing.findMany({
            where: { status: true },
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
          })
        : Promise.resolve([]),
    ]);

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      pricings: pricings.map(serializePricing),
    });
  } catch (error) {
    console.error("Failed to load pricing data:", error.message);
    return response.status(500).json({ message: "Failed to load pricing data." });
  }
});

router.get("/pricing/:slug", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();

    const [profile, siteSettings, pricing, relatedPricings] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      hasPricingModel()
        ? prisma.pricing.findUnique({
            where: { slug },
          })
        : Promise.resolve(null),
      hasPricingModel()
        ? prisma.pricing.findMany({
            where: { status: true, slug: { not: slug } },
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
            take: 3,
          })
        : Promise.resolve([]),
    ]);

    if (!pricing || !pricing.status) {
      return response.status(404).json({ message: "Pricing plan not found." });
    }

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      pricing: serializePricing(pricing),
      relatedPricings: relatedPricings.map(serializePricing),
    });
  } catch (error) {
    console.error("Failed to load pricing detail:", error.message);
    return response.status(500).json({ message: "Failed to load pricing detail." });
  }
});

router.get("/projects/:slug", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();

    const [profile, siteSettings, existingProject, relatedProjects] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      prisma.project.findUnique({
        where: { slug },
        include: {
          comments: {
            orderBy: { sortOrder: "asc" },
            include: {
              replies: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
      prisma.project.findMany({
        where: { slug: { not: slug } },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
    ]);

    if (!existingProject) {
      return response.status(404).json({ message: "Project not found." });
    }

    const project = await prisma.project.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        comments: {
          orderBy: { sortOrder: "asc" },
          include: {
            replies: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      project: serializeProject(project),
      relatedProjects: relatedProjects.map(serializeProject),
    });
  } catch (error) {
    console.error("Failed to load project detail:", error.message);
    return response.status(500).json({ message: "Failed to load project detail." });
  }
});

router.post("/projects/:slug/impression", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
      },
    });

    if (!project) {
      return response.status(404).json({ message: "Project not found." });
    }

    await prisma.project.update({
      where: { slug },
      data: {
        impressionCount: {
          increment: 1,
        },
      },
    });

    return response.status(201).json({ message: "Project impression tracked." });
  } catch (error) {
    console.error("Failed to track project impression:", error.message);
    return response.status(500).json({ message: "Failed to track project impression." });
  }
});

router.post("/projects/:slug/comments", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const name = String(request.body?.name || "").trim();
    const commentText = String(request.body?.comment || "").trim();

    if (!name || !commentText) {
      return response.status(400).json({ message: "Name and comment are required." });
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    if (!project) {
      return response.status(404).json({ message: "Project not found." });
    }

    const savedComment = await prisma.projectComment.create({
      data: {
        projectId: project.id,
        name,
        comment: commentText,
        sortOrder: (project.comments?.[0]?.sortOrder || 0) + 1,
      },
      include: {
        replies: true,
      },
    });

    request.app.get("io")?.to(`project:${slug}`).emit("project:comment_created", {
      projectSlug: slug,
      comment: savedComment,
    });

    return response.status(201).json({
      message: "Comment saved successfully.",
      comment: savedComment,
    });
  } catch (error) {
    console.error("Failed to save project comment:", error.message);
    return response.status(500).json({ message: "Failed to save comment." });
  }
});

router.post("/projects/:slug/comments/:commentId/replies", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const commentId = Number.parseInt(request.params.commentId, 10);
    const name = String(request.body?.name || "").trim();
    const replyText = String(request.body?.reply || "").trim();

    if (!commentId || !name || !replyText) {
      return response.status(400).json({ message: "Name and reply are required." });
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
      },
    });

    if (!project) {
      return response.status(404).json({ message: "Project not found." });
    }

    const comment = await prisma.projectComment.findFirst({
      where: {
        id: commentId,
        projectId: project.id,
      },
      include: {
        replies: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    if (!comment) {
      return response.status(404).json({ message: "Comment not found." });
    }

    const savedReply = await prisma.projectReply.create({
      data: {
        commentId: comment.id,
        name,
        reply: replyText,
        sortOrder: (comment.replies?.[0]?.sortOrder || 0) + 1,
      },
    });

    request.app.get("io")?.to(`project:${slug}`).emit("project:reply_created", {
      projectSlug: slug,
      commentId: comment.id,
      reply: savedReply,
    });

    return response.status(201).json({
      message: "Reply saved successfully.",
      reply: savedReply,
    });
  } catch (error) {
    console.error("Failed to save project reply:", error.message);
    return response.status(500).json({ message: "Failed to save reply." });
  }
});

router.get("/services", async (_request, response) => {
  try {
    const [profile, siteSettings, serviceSection, services] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      prisma.serviceSection.findUnique({ where: { id: 1 } }),
      prisma.service.findMany({
        where: { status: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        include: {
          comments: {
            orderBy: { sortOrder: "asc" },
            include: {
              replies: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
    ]);

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      serviceSection,
      services: services.map(serializeService),
    });
  } catch (error) {
    console.error("Failed to load services:", error.message);
    return response.status(500).json({ message: "Failed to load services." });
  }
});

router.get("/services/:slug", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();

    const [profile, siteSettings, serviceSection, existingService, relatedServices] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      getSiteSettingsRecord(),
      prisma.serviceSection.findUnique({ where: { id: 1 } }),
      prisma.service.findUnique({
        where: { slug },
        include: {
          comments: {
            orderBy: { sortOrder: "asc" },
            include: {
              replies: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
      prisma.service.findMany({
        where: { status: true, slug: { not: slug } },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 3,
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          views: true,
          impressionCount: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
    ]);

    if (!existingService || !existingService.status) {
      return response.status(404).json({ message: "Service not found." });
    }

    const service = await prisma.service.update({
      where: { slug },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        comments: {
          orderBy: { sortOrder: "asc" },
          include: {
            replies: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return response.json({
      profile,
      siteSettings: serializeSiteSettings(siteSettings),
      serviceSection,
      service: serializeService(service),
      relatedServices,
    });
  } catch (error) {
    console.error("Failed to load service detail:", error.message);
    return response.status(500).json({ message: "Failed to load service detail." });
  }
});

router.post("/services/:slug/impression", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const service = await prisma.service.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
      },
    });

    if (!service || !service.status) {
      return response.status(404).json({ message: "Service not found." });
    }

    await prisma.service.update({
      where: { slug },
      data: {
        impressionCount: {
          increment: 1,
        },
      },
    });

    return response.status(201).json({ message: "Impression tracked." });
  } catch (error) {
    console.error("Failed to track service impression:", error.message);
    return response.status(500).json({ message: "Failed to track service impression." });
  }
});

router.post(
  "/services/upload-image",
  (request, response, next) => {
    upload.single("image")(request, response, (error) => {
      if (error) {
        return response.status(400).json({ message: error.message || "Upload failed." });
      }

      return next();
    });
  },
  async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ message: "Please choose an image to upload." });
    }

    return response.status(201).json({
      message: "Image uploaded successfully.",
      path: `/uploads/${request.file.filename}`,
    });
  },
);

router.post("/services/:slug/comments", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const name = String(request.body?.name || "").trim();
    const photo = String(request.body?.photo || "").trim();
    const commentText = String(request.body?.comment || "").trim();

    if (!name || !commentText) {
      return response.status(400).json({ message: "Name and comment are required." });
    }

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    if (!service || !service.status) {
      return response.status(404).json({ message: "Service not found." });
    }

    const savedComment = await prisma.serviceComment.create({
      data: {
        serviceId: service.id,
        photo: photo || "/profile.png",
        comment: commentText,
        impression: name,
        sortOrder: (service.comments?.[0]?.sortOrder || 0) + 1,
      },
      include: {
        replies: true,
      },
    });

    request.app.get("io")?.to(`service:${slug}`).emit("service:comment_created", {
      serviceSlug: slug,
      comment: savedComment,
    });

    return response.status(201).json({
      message: "Comment saved successfully.",
      comment: savedComment,
    });
  } catch (error) {
    console.error("Failed to save service comment:", error.message);
    return response.status(500).json({ message: "Failed to save comment." });
  }
});

router.post("/services/:slug/comments/:commentId/replies", async (request, response) => {
  try {
    const slug = String(request.params.slug || "").trim().toLowerCase();
    const commentId = Number.parseInt(request.params.commentId, 10);
    const replyText = String(request.body?.reply || "").trim();
    const fallbackName = String(request.body?.name || "").trim();
    const admin = await getOptionalAdmin(request);

    if (!commentId || !replyText) {
      return response.status(400).json({ message: "Reply is required." });
    }

    if (!admin && !fallbackName) {
      return response.status(400).json({ message: "Name is required for replies." });
    }

    const service = await prisma.service.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
      },
    });

    if (!service || !service.status) {
      return response.status(404).json({ message: "Service not found." });
    }

    const comment = await prisma.serviceComment.findFirst({
      where: {
        id: commentId,
        serviceId: service.id,
      },
      include: {
        replies: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    if (!comment) {
      return response.status(404).json({ message: "Comment not found." });
    }

    const savedReply = await prisma.serviceReply.create({
      data: {
        commentId: comment.id,
        reply: replyText,
        impression: admin?.name || fallbackName,
        sortOrder: (comment.replies?.[0]?.sortOrder || 0) + 1,
      },
    });

    request.app.get("io")?.to(`service:${slug}`).emit("service:reply_created", {
      serviceSlug: slug,
      commentId: comment.id,
      reply: savedReply,
    });

    return response.status(201).json({
      message: "Reply saved successfully.",
      reply: savedReply,
      isAdminReply: Boolean(admin),
    });
  } catch (error) {
    console.error("Failed to save service reply:", error.message);
    return response.status(500).json({ message: "Failed to save reply." });
  }
});

router.get("/blogs", async (_request, response) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: 1 } });
    const blogs = await getBlogs(profile?.devUsername);
    return response.json(blogs);
  } catch (error) {
    console.error("Failed to load blogs:", error.message);
    return response.status(500).json({ message: "Failed to load blogs." });
  }
});

router.get("/settings", async (_request, response) => {
  try {
    const siteSettings = await getSiteSettingsRecord();
    return response.json(serializeSiteSettings(siteSettings));
  } catch (error) {
    console.error("Failed to load site settings:", error.message);
    return response.status(500).json({ message: "Failed to load site settings." });
  }
});

router.post(
  "/testimonials/upload-image",
  (request, response, next) => {
    upload.single("image")(request, response, (error) => {
      if (error) {
        return response.status(400).json({ message: error.message || "Upload failed." });
      }

      return next();
    });
  },
  async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ message: "Please choose an image to upload." });
    }

    return response.status(201).json({
      message: "Image uploaded successfully.",
      path: `/uploads/${request.file.filename}`,
    });
  },
);

router.post("/testimonials", async (request, response) => {
  try {
    if (!hasTestimonialModel()) {
      return response.status(503).json({ message: "Testimonials are not available yet." });
    }

    const name = normalizeString(request.body?.name);
    const company = normalizeString(request.body?.company);
    const position = normalizeString(request.body?.position);
    const image = normalizeString(request.body?.image) || "/profile.png";
    const contentSource = normalizeString(request.body?.content);
    const stars = Math.max(1, Math.min(5, Number.parseInt(request.body?.stars, 10) || 5));

    if (!name || !company || !contentSource) {
      return response.status(400).json({
        message: "Name, company, and review content are required.",
      });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        company,
        position,
        image,
        content: convertPlainTextToHtml(contentSource),
        stars,
        status: true,
        sortOrder: await getNextTestimonialSortOrder(),
      },
    });

    const serializedTestimonial = serializeTestimonial(testimonial);
    request.app.get("io")?.to("testimonials").emit("testimonial:created", {
      testimonial: serializedTestimonial,
    });

    return response.status(201).json({
      message: "Review published successfully.",
      testimonial: serializedTestimonial,
    });
  } catch (error) {
    console.error("Failed to save testimonial:", error.message);
    return response.status(500).json({ message: "Failed to save review." });
  }
});

router.post("/contact", async (request, response) => {
  try {
    const { name, email, message } = request.body || {};

    if (!name || !email || !message) {
      return response.status(400).json({ message: "Name, email, and message are required." });
    }

    const siteSettings = await getSiteSettingsRecord();
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim(),
      },
    });

    try {
      await sendContactEmails(siteSettings, savedMessage);
    } catch (mailError) {
      console.error("Failed to send contact email:", mailError.message);
    }

    return response.status(201).json({
      message: "Message sent successfully.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Failed to save contact message:", error.message);
    return response.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
