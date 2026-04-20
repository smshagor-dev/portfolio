const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

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
    const [profile, statsCounters, skills, experiences, projects, educations] = await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      prisma.statsCounter.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found." });
    }

    const blogs = await getBlogs(profile.devUsername);

    return response.json({
      profile,
      statsCounters,
      skills,
      experiences,
      projects,
      educations,
      blogs,
    });
  } catch (error) {
    console.error("Failed to load homepage data:", error.message);
    return response.status(500).json({ message: "Failed to load homepage data." });
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
