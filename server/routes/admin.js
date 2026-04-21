const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const prisma = require("../lib/prisma");
const { requireAdmin, signAdminToken } = require("../lib/auth");

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
      .basename(file.originalname || "profile-image", ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "profile-image";

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

const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      path.extname(file.originalname || "").toLowerCase() === ".pdf";

    if (!isPdf) {
      callback(new Error("Only PDF files are allowed."));
      return;
    }

    callback(null, true);
  },
});

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeStringList(items) {
  return (items || [])
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function normalizeHeroSkills(value) {
  if (Array.isArray(value)) {
    return {
      title: "",
      items: value
        .map((item) => {
          if (typeof item === "string") {
            const name = normalizeString(item);
            return name ? { name, image: "" } : null;
          }

          const name = normalizeString(item?.name);
          const image = normalizeString(item?.image);
          return name ? { name, image } : null;
        })
        .filter(Boolean),
    };
  }

  const title = normalizeString(value?.title);
  const items = (value?.items || [])
    .map((item) => {
      const name = normalizeString(item?.name);
      const image = normalizeString(item?.image);
      return name ? { name, image } : null;
    })
    .filter(Boolean);

  return {
    title,
    items,
  };
}

function normalizeSocialLinks(value, fallbackProfile = null) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const icon = normalizeString(item?.icon).toLowerCase();
        const label = normalizeString(item?.label);
        const image = normalizeString(item?.image);
        const link = normalizeString(item?.link);
        if (!link) {
          return null;
        }

        if (icon === "custom") {
          return image ? { icon, label, image, link } : null;
        }

        return icon ? { icon, label, image: "", link } : null;
      })
      .filter(Boolean);
  }

  if (Array.isArray(fallbackProfile?.socialLinks)) {
    return fallbackProfile.socialLinks
      .map((item) => {
        const icon = normalizeString(item?.icon).toLowerCase();
        const label = normalizeString(item?.label);
        const image = normalizeString(item?.image);
        const link = normalizeString(item?.link);
        return icon && link ? { icon, label, image, link } : null;
      })
      .filter(Boolean);
  }

  return [
    { icon: "facebook", label: "Facebook", image: "", link: normalizeString(fallbackProfile?.facebook) },
    { icon: "github", label: "GitHub", image: "", link: normalizeString(fallbackProfile?.github) },
    { icon: "linkedin", label: "LinkedIn", image: "", link: normalizeString(fallbackProfile?.linkedIn) },
    { icon: "twitter", label: "Twitter", image: "", link: normalizeString(fallbackProfile?.twitter) },
    { icon: "stackoverflow", label: "Stack Overflow", image: "", link: normalizeString(fallbackProfile?.stackOverflow) },
    { icon: "leetcode", label: "LeetCode", image: "", link: normalizeString(fallbackProfile?.leetcode) },
  ].filter((item) => item.link);
}

function normalizeStatsCounters(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const label = normalizeString(item?.label);
        const highlight = normalizeString(item?.highlight);
        const count = normalizeString(item?.count);
        const icon = normalizeString(item?.icon).toLowerCase();

        return label && count ? { label, highlight, count, icon } : null;
      })
      .filter(Boolean);
  }

  return [];
}

function normalizeProjectButtons(items, fallbackProject = null) {
  if (Array.isArray(items)) {
    return items
      .map((item) => {
        const text = normalizeString(item?.text);
        const link = normalizeString(item?.link);

        return text && link ? { text, link } : null;
      })
      .filter(Boolean);
  }

  const fallbackButtons = [];
  const code = normalizeString(fallbackProject?.code);
  const demo = normalizeString(fallbackProject?.demo);

  if (code) {
    fallbackButtons.push({ text: "Code", link: code });
  }

  if (demo) {
    fallbackButtons.push({ text: "Live Demo", link: demo });
  }

  return fallbackButtons;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeServiceSection(value, fallbackSection = null) {
  return {
    id: 1,
    title: normalizeString(value?.title ?? fallbackSection?.title),
    subtitle: normalizeString(value?.subtitle ?? fallbackSection?.subtitle),
  };
}

function normalizeServices(items) {
  return normalizeCollection(items, (item, index) => {
    const name = normalizeString(item?.name);
    const slug = normalizeString(item?.slug).toLowerCase();
    const impression = normalizeString(item?.impression);
    const description = normalizeString(item?.description);
    const content = String(item?.content || "").trim();

    if (!name || !slug || !description) {
      return null;
    }

    return {
      id: index + 1,
      slug,
      name,
      impression,
      description,
      content,
      isFeatured: Boolean(item?.isFeatured),
      icon: normalizeString(item?.icon) || "briefcase",
      status: typeof item?.status === "boolean" ? item.status : true,
      impressionCount: Math.max(0, Number.parseInt(item?.impressionCount, 10) || 0),
      views: Math.max(0, Number.parseInt(item?.views, 10) || 0),
      sortOrder: index + 1,
      comments: normalizeCollection(item?.comments || [], (comment, commentIndex) => {
        const commentText = normalizeString(comment?.comment);

        if (!commentText) {
          return null;
        }

        return {
          photo: normalizeString(comment?.photo) || "/profile.png",
          comment: commentText,
          impression: normalizeString(comment?.impression),
          sortOrder: commentIndex + 1,
          replies: normalizeCollection(comment?.replies || [], (reply, replyIndex) => {
            const replyText = normalizeString(reply?.reply);

            if (!replyText) {
              return null;
            }

            return {
              reply: replyText,
              impression: normalizeString(reply?.impression),
              sortOrder: replyIndex + 1,
            };
          }),
        };
      }),
    };
  });
}

function normalizePricings(items) {
  return normalizeCollection(items, (item, index) => {
    const slug = slugify(item?.slug || item?.name);
    const name = normalizeString(item?.name);
    const description = normalizeString(item?.description);
    const duration = normalizeString(item?.duration);
    const content = String(item?.content || "").trim();
    const parsedPrice = Number.parseFloat(item?.price);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : Number.NaN;
    const features = normalizeStringList(item?.features);

    if (!slug || !name || !description || !duration || !content || !Number.isFinite(price)) {
      return null;
    }

    return {
      id: index + 1,
      slug,
      name,
      description,
      price,
      duration,
      content,
      features,
      status: typeof item?.status === "boolean" ? item.status : true,
      isPopular: Boolean(item?.isPopular),
      sortOrder: index + 1,
    };
  });
}

function normalizeCollection(items, mapper) {
  return (items || []).map((item, index) => mapper(item, index)).filter(Boolean);
}

function hasPricingModel() {
  return Boolean(prisma?.pricing && typeof prisma.pricing.findMany === "function");
}

async function getDashboardData() {
  const [profile, serviceSection, services, statsCounters, skills, experiences, educations, projects, pricings, messages] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.serviceSection.findUnique({ where: { id: 1 } }),
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
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
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
    hasPricingModel()
      ? prisma.pricing.findMany({ orderBy: { sortOrder: "asc" } })
      : Promise.resolve([]),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return {
    profile,
    serviceSection,
    services,
    statsCounters,
    skills,
    experiences,
    educations,
    projects,
    pricings,
    messages,
  };
}

router.post("/login", async (request, response) => {
  try {
    const email = normalizeString(request.body?.email).toLowerCase();
    const password = String(request.body?.password || "");

    if (!email || !password) {
      return response.status(400).json({ message: "Email and password are required." });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const token = signAdminToken(admin);

    return response.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return response.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", requireAdmin, async (request, response) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: request.admin.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return response.json(admin);
  } catch (error) {
    return response.status(500).json({ message: "Failed to load admin." });
  }
});

router.get("/dashboard", requireAdmin, async (_request, response) => {
  try {
    return response.json(await getDashboardData());
  } catch (error) {
    console.error("Failed to load dashboard:", error.message);
    return response.status(500).json({ message: "Failed to load dashboard data." });
  }
});

router.post(
  "/upload-image",
  requireAdmin,
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

    const uploadedPath = `/uploads/${request.file.filename}`;

    return response.status(201).json({
      message: "Image uploaded successfully.",
      path: uploadedPath,
    });
  },
);

router.post(
  "/upload-resume",
  requireAdmin,
  (request, response, next) => {
    resumeUpload.single("resume")(request, response, (error) => {
      if (error) {
        return response.status(400).json({ message: error.message || "Upload failed." });
      }

      return next();
    });
  },
  async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ message: "Please choose a PDF to upload." });
    }

    return response.status(201).json({
      message: "Resume uploaded successfully.",
      path: `/uploads/${request.file.filename}`,
    });
  },
);

router.put("/content", requireAdmin, async (request, response) => {
  try {
    const profile = request.body?.profile || {};
    const serviceSection = request.body?.serviceSection || {};
    const hasSkills = Object.prototype.hasOwnProperty.call(request.body || {}, "skills");
    const hasExperiences = Object.prototype.hasOwnProperty.call(request.body || {}, "experiences");
    const hasEducations = Object.prototype.hasOwnProperty.call(request.body || {}, "educations");
    const hasProjects = Object.prototype.hasOwnProperty.call(request.body || {}, "projects");
    const hasStatsCounters = Object.prototype.hasOwnProperty.call(request.body || {}, "statsCounters");
    const hasServiceSection = Object.prototype.hasOwnProperty.call(request.body || {}, "serviceSection");
    const hasServices = Object.prototype.hasOwnProperty.call(request.body || {}, "services");
    const hasPricings = Object.prototype.hasOwnProperty.call(request.body || {}, "pricings");
    const skills = request.body?.skills || [];
    const experiences = request.body?.experiences || [];
    const educations = request.body?.educations || [];
    const projects = request.body?.projects || [];
    const statsCounters = request.body?.statsCounters || [];
    const services = request.body?.services || [];
    const pricings = request.body?.pricings || [];
    const existingProfile = await prisma.profile.findUnique({
      where: { id: 1 },
    });
    const existingServiceSection = await prisma.serviceSection.findUnique({
      where: { id: 1 },
    });

    const normalizedProfile = {
      id: 1,
      name: normalizeString(profile.name ?? existingProfile?.name),
      profile: normalizeString(profile.profile ?? existingProfile?.profile) || "/profile.png",
      designation: normalizeString(profile.designation ?? existingProfile?.designation),
      description: normalizeString(profile.description ?? existingProfile?.description),
      email: normalizeString(profile.email ?? existingProfile?.email),
      phone: normalizeString(profile.phone ?? existingProfile?.phone),
      address: normalizeString(profile.address ?? existingProfile?.address),
      github: normalizeString(profile.github ?? existingProfile?.github),
      facebook: normalizeString(profile.facebook ?? existingProfile?.facebook),
      linkedIn: normalizeString(profile.linkedIn ?? existingProfile?.linkedIn),
      twitter: normalizeString(profile.twitter ?? existingProfile?.twitter),
      stackOverflow: normalizeString(profile.stackOverflow ?? existingProfile?.stackOverflow),
      leetcode: normalizeString(profile.leetcode ?? existingProfile?.leetcode),
      socialLinks: normalizeSocialLinks(profile.socialLinks, existingProfile),
      devUsername: normalizeString(profile.devUsername ?? existingProfile?.devUsername),
      resume: normalizeString(profile.resume ?? existingProfile?.resume),
      heroSkills: normalizeHeroSkills(profile.heroSkills ?? existingProfile?.heroSkills),
      hardWorker:
        typeof profile.hardWorker === "boolean"
          ? profile.hardWorker
          : existingProfile?.hardWorker ?? true,
      quickLearner:
        typeof profile.quickLearner === "boolean"
          ? profile.quickLearner
          : existingProfile?.quickLearner ?? true,
      problemSolver:
        typeof profile.problemSolver === "boolean"
          ? profile.problemSolver
          : existingProfile?.problemSolver ?? true,
    };

    const normalizedSkills = normalizeCollection(skills, (item, index) => {
      const name = normalizeString(item.name || item);
      if (!name) {
        return null;
      }

      return {
        id: index + 1,
        name,
        sortOrder: index + 1,
      };
    });

    const normalizedExperiences = normalizeCollection(experiences, (item, index) => ({
      id: index + 1,
      title: normalizeString(item.title),
      company: normalizeString(item.company),
      duration: normalizeString(item.duration),
      sortOrder: index + 1,
    }));

    const normalizedEducations = normalizeCollection(educations, (item, index) => ({
      id: index + 1,
      title: normalizeString(item.title),
      duration: normalizeString(item.duration),
      institution: normalizeString(item.institution),
      sortOrder: index + 1,
    }));

    const normalizedProjects = normalizeCollection(projects, (item, index) => ({
      id: Math.max(1, Number.parseInt(item?.id, 10) || index + 1),
      slug: slugify(item?.slug || item?.name),
      name: normalizeString(item.name),
      description: normalizeString(item.description),
      content: String(item?.content || "").trim(),
      role: normalizeString(item.role),
      code: normalizeString(item.code),
      demo: normalizeString(item.demo),
      image: normalizeString(item.image),
      views: Math.max(0, Number.parseInt(item?.views, 10) || 0),
      impressionCount: Math.max(0, Number.parseInt(item?.impressionCount, 10) || 0),
      buttons: normalizeProjectButtons(item?.buttons, item),
      tools: normalizeStringList(item.tools),
      sortOrder: index + 1,
    }));

    const normalizedStatsCounters = normalizeCollection(statsCounters, (item, index) => {
      const label = normalizeString(item.label);
      const count = normalizeString(item.count);

      if (!label || !count) {
        return null;
      }

      return {
        id: index + 1,
        label,
        highlight: normalizeString(item.highlight),
        count,
        icon: normalizeString(item.icon).toLowerCase(),
        sortOrder: index + 1,
      };
    });

    const normalizedServiceSection = normalizeServiceSection(serviceSection, existingServiceSection);
    const normalizedServices = normalizeServices(services);
    const normalizedPricings = normalizePricings(pricings);

    if (hasPricings && !hasPricingModel()) {
      return response.status(503).json({
        message: "Pricing model is not available yet. Please restart the backend so Prisma reloads the new schema.",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { id: 1 },
        update: normalizedProfile,
        create: normalizedProfile,
      });

      if (hasStatsCounters) {
        await tx.statsCounter.deleteMany();
        if (normalizedStatsCounters.length) {
          await tx.statsCounter.createMany({ data: normalizedStatsCounters });
        }
      }

      if (hasServiceSection) {
        await tx.serviceSection.upsert({
          where: { id: 1 },
          update: normalizedServiceSection,
          create: normalizedServiceSection,
        });
      }

      if (hasServices) {
        await tx.serviceReply.deleteMany();
        await tx.serviceComment.deleteMany();
        await tx.service.deleteMany();
        if (normalizedServices.length) {
          for (const service of normalizedServices) {
            await tx.service.create({
              data: {
                id: service.id,
                slug: service.slug,
                name: service.name,
                impression: service.impression,
                description: service.description,
                content: service.content,
                isFeatured: service.isFeatured,
                icon: service.icon,
                status: service.status,
                impressionCount: service.impressionCount,
                views: service.views,
                sortOrder: service.sortOrder,
                comments: {
                  create: service.comments.map((comment) => ({
                    photo: comment.photo,
                    comment: comment.comment,
                    impression: comment.impression,
                    sortOrder: comment.sortOrder,
                    replies: {
                      create: comment.replies.map((reply) => ({
                        reply: reply.reply,
                        impression: reply.impression,
                        sortOrder: reply.sortOrder,
                      })),
                    },
                  })),
                },
              },
            });
          }
        }
      }

      if (hasSkills) {
        await tx.skill.deleteMany();
        if (normalizedSkills.length) {
          await tx.skill.createMany({ data: normalizedSkills });
        }
      }

      if (hasExperiences) {
        await tx.experience.deleteMany();
        if (normalizedExperiences.length) {
          await tx.experience.createMany({ data: normalizedExperiences });
        }
      }

      if (hasEducations) {
        await tx.education.deleteMany();
        if (normalizedEducations.length) {
          await tx.education.createMany({ data: normalizedEducations });
        }
      }

      if (hasProjects) {
        await tx.project.deleteMany();
        if (normalizedProjects.length) {
          await tx.project.createMany({ data: normalizedProjects });
        }
      }

      if (hasPricings) {
        await tx.pricing.deleteMany();
        if (normalizedPricings.length) {
          await tx.pricing.createMany({ data: normalizedPricings });
        }
      }
    });

    return response.json({
      message: "Content updated successfully.",
      data: await getDashboardData(),
    });
  } catch (error) {
    console.error("Failed to update content:", error.message);
    return response.status(500).json({ message: "Failed to update content." });
  }
});

module.exports = router;
