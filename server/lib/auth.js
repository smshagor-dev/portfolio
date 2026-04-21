const jwt = require("jsonwebtoken");

const DEFAULT_SECRET = "portfolio-admin-secret";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      role: "admin",
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    },
  );
}

function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getBearerToken(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

function requireAdmin(request, response, next) {
  try {
    const token = getBearerToken(request.headers);

    if (!token) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    request.admin = verifyAdminToken(token);
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = {
  getBearerToken,
  requireAdmin,
  signAdminToken,
  verifyAdminToken,
};
