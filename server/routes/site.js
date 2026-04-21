const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const prisma = require("../lib/prisma");
const { getBearerToken, verifyAdminToken } = require("../lib/auth");

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
    const [profile, serviceSection, services, statsCounters, skills, experiences, projects, educations, pricings] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
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
    ]);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found." });
    }

    const blogs = await getBlogs(profile.devUsername);

    return response.json({
      profile,
      serviceSection,
      services: services.map(serializeService),
      statsCounters,
      skills,
      experiences,
      projects: projects.map(serializeProject),
      educations,
      pricings: pricings.map(serializePricing),
      blogs,
    });
  } catch (error) {
    console.error("Failed to load homepage data:", error.message);
    return response.status(500).json({ message: "Failed to load homepage data." });
  }
});

router.get("/pricing", async (_request, response) => {
  try {
    const [profile, pricings] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      hasPricingModel()
        ? prisma.pricing.findMany({
            where: { status: true },
            orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
          })
        : Promise.resolve([]),
    ]);

    return response.json({
      profile,
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

    const [profile, pricing, relatedPricings] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
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

    const [profile, existingProject, relatedProjects] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
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
    const [profile, serviceSection, services] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
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

    const [profile, serviceSection, existingService, relatedServices] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
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

router.post("/contact", async (request, response) => {
  try {
    const { name, email, message } = request.body || {};

    if (!name || !email || !message) {
      return response.status(400).json({ message: "Name, email, and message are required." });
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim(),
      },
    });

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
