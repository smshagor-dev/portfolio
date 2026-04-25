require("./lib/config");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const prisma = require("./lib/prisma");
const { validateAuthConfig, verifyAdminToken } = require("./lib/auth");
const adminRoutes = require("./routes/admin");
const siteRoutes = require("./routes/site");

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 5000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = frontendUrl.split(",").map((item) => item.trim());
const serverBaseUrl = process.env.BACKEND_URL || `http://127.0.0.1:${port}`;
const forceHttps =
  String(process.env.FORCE_HTTPS || "").trim().toLowerCase() === "true";
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("trust proxy", true);
app.set("io", io);

if (forceHttps) {
  app.use((request, response, next) => {
    const forwardedProtoHeader = request.headers["x-forwarded-proto"];
    const forwardedProto = Array.isArray(forwardedProtoHeader)
      ? forwardedProtoHeader[0]
      : String(forwardedProtoHeader || "").split(",")[0].trim();

    if (request.secure || forwardedProto === "https") {
      return next();
    }

    const host = request.headers.host;

    if (!host) {
      return next();
    }

    return response.redirect(308, `https://${host}${request.originalUrl}`);
  });

  app.use((_request, response, next) => {
    response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    next();
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

function buildReadyPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Server Ready</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Arial, sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #1e3a5f, #09111d 55%);
        color: #ecf8ff;
      }
      main {
        width: min(92vw, 640px);
        padding: 40px 32px;
        border: 1px solid rgba(137, 213, 255, 0.24);
        border-radius: 24px;
        background: rgba(8, 18, 32, 0.82);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
      }
      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 4vw, 3rem);
      }
      p {
        margin: 10px 0;
        line-height: 1.6;
        color: #b8d9ea;
      }
      code {
        color: #8fe3ff;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Server ready</h1>
      <p>The Node backend is running and ready to accept requests.</p>
      <p>Health check: <code>/health</code></p>
      <p>Base URL: <code>${serverBaseUrl}</code></p>
    </main>
  </body>
</html>`;
}

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

app.get("/", (_request, response) => {
  response.type("html").send(buildReadyPage());
});

app.get("/ready", (_request, response) => {
  response.type("html").send(buildReadyPage());
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok", message: "server ready" });
});

app.use("/api/site", siteRoutes);
app.use("/api/admin", adminRoutes);

validateAuthConfig();

server.listen(port, () => {
  console.log(`Backend server is running on ${serverBaseUrl}`);
});
