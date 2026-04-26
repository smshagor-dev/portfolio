const path = require("path");

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
let backendImagePattern = null;

try {
  const parsedBackendUrl = new URL(backendUrl);
  backendImagePattern = {
    protocol: parsedBackendUrl.protocol.replace(":", ""),
    hostname: parsedBackendUrl.hostname,
    port: parsedBackendUrl.port || "",
    pathname: "/uploads/**",
  };
} catch (_error) {
  backendImagePattern = null;
}
 
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    remotePatterns: [
      ...(backendImagePattern ? [backendImagePattern] : []),
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
