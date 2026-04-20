require("./lib/config");

const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/admin");
const siteRoutes = require("./routes/site");

const app = express();
const port = Number(process.env.PORT || 5000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: frontendUrl.split(",").map((item) => item.trim()),
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/site", siteRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
