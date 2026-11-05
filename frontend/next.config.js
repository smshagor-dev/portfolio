const path = require("path");

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
const publicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// Public media are hosted by the old FTP web server, not by Laravel.
// This is an HTTP(S) URL only; FTP credentials stay on the backend.
const publicUploadsUrl = process.env.UPLOAD_STORAGE_PUBLIC_BASE_URL || "";
function getHttpOrigin(value) {
  if (!value) return "";
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("UPLOAD_STORAGE_PUBLIC_BASE_URL must be an HTTP(S) URL.");
  }
  return url.origin;
}
const uploadsOrigin = getHttpOrigin(publicUploadsUrl);
const frontendOrigin = getHttpOrigin(process.env.NEXT_PUBLIC_APP_URL || "");
if (uploadsOrigin && frontendOrigin && uploadsOrigin === frontendOrigin) {
  throw new Error("The FTP public media origin cannot be the frontend itself.");
}

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

const backendImagePatterns = [toRemotePattern(backendUrl), toRemotePattern(publicBackendUrl), toRemotePattern(uploadsOrigin)].filter(Boolean);
 
module.exports = {
  poweredByHeader: false,
  compress: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
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
        destination: `${uploadsOrigin || backendUrl}/uploads/:path*`,
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
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};
