const path = require("path");

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
const publicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function toRemotePattern(value) {
  try {
    const parsedUrl = new URL(value);
    return {
      protocol: parsedUrl.protocol.replace(":", ""),
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || "",
      pathname: "/uploads/**",
    };
  } catch (_error) {
    return null;
  }
}

const backendImagePatterns = [toRemotePattern(backendUrl), toRemotePattern(publicBackendUrl)].filter(Boolean);
 
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...backendImagePatterns,
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.dev.to',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/site/:path*",
        destination: `${backendUrl}/api/site/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: "/api/research-publications/:path*",
        destination: `${backendUrl}/api/research-publications/:path*`,
      },
      {
        source: "/api/assistant/:path*",
        destination: `${backendUrl}/api/assistant/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
      {
        source: "/ready",
        destination: `${backendUrl}/ready`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/:verificationFile([^/]+\\.[^/]+)",
        destination: `${backendUrl}/:verificationFile`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};
