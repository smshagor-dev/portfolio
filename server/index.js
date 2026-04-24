require("./lib/config");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const prisma = require("./lib/prisma");
const { verifyAdminToken } = require("./lib/auth");
const adminRoutes = require("./routes/admin");
const siteRoutes = require("./routes/site");

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 5000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = frontendUrl.split(",").map((item) => item.trim());
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("trust proxy", true);
app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("project:join", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.join(`project:${normalizedSlug}`);
  });

  socket.on("project:leave", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.leave(`project:${normalizedSlug}`);
  });

  socket.on("service:join", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.join(`service:${normalizedSlug}`);
  });

  socket.on("service:leave", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.leave(`service:${normalizedSlug}`);
  });

  socket.on("article:join", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.join(`article:${normalizedSlug}`);
  });

  socket.on("article:leave", (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      return;
    }

    socket.leave(`article:${normalizedSlug}`);
  });

  socket.on("testimonials:join", () => {
    socket.join("testimonials");
  });

  socket.on("testimonials:leave", () => {
    socket.leave("testimonials");
  });

  socket.on("contact:join", async ({ messageId, token }) => {
    const normalizedId = Number.parseInt(messageId, 10);
    const normalizedToken = String(token || "").trim();
    if (!normalizedId || !normalizedToken) {
      return;
    }

    try {
      const ticket = await prisma.contactMessage.findUnique({
        where: { id: normalizedId },
        select: { id: true, ticketToken: true },
      });

      if (!ticket || ticket.ticketToken !== normalizedToken) {
        return;
      }

      socket.join(`contact:ticket:${ticket.id}`);
    } catch (_error) {
      // Ignore failed joins.
    }
  });

  socket.on("contact:leave", ({ messageId }) => {
    const normalizedId = Number.parseInt(messageId, 10);
    if (!normalizedId) {
      return;
    }

    socket.leave(`contact:ticket:${normalizedId}`);
  });

  socket.on("contact:admin_join", async ({ messageId, token }) => {
    const normalizedId = Number.parseInt(messageId, 10);
    const normalizedToken = String(token || "").trim();
    if (!normalizedId || !normalizedToken) {
      return;
    }

    try {
      verifyAdminToken(normalizedToken);
      const ticket = await prisma.contactMessage.findUnique({
        where: { id: normalizedId },
        select: { id: true },
      });

      if (!ticket) {
        return;
      }

      socket.join(`contact:ticket:${ticket.id}`);
    } catch (_error) {
      // Ignore failed joins.
    }
  });

  socket.on("contact:admin_leave", ({ messageId }) => {
    const normalizedId = Number.parseInt(messageId, 10);
    if (!normalizedId) {
      return;
    }

    socket.leave(`contact:ticket:${normalizedId}`);
  });
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/site", siteRoutes);
app.use("/api/admin", adminRoutes);

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
