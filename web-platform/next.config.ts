import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; connect-src 'self' blob: data: https://res.cloudinary.com; font-src 'self' data:; object-src 'none'; media-src 'self'; worker-src 'self' blob:; frame-src 'self' blob:; frame-ancestors 'self';",
          },
        ],
      },
      // Serve Unity Brotli compressed assets (.br)
      {
        source: "/unity/Build/(.*).wasm.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/unity/Build/(.*).framework.js.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/unity/Build/(.*).data.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
      // Legacy gzip fallback
      {
        source: "/unity/Build/(.*).wasm.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/unity/Build/(.*).framework.js.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/unity/Build/(.*).data.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
      {
        source: "/unity/TemplateData/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/explore",
        destination: "/campus?mode=explore",
        permanent: true,
      },
      {
        source: "/exploremode",
        destination: "/campus?mode=explore",
        permanent: true,
      },
      {
        source: "/game",
        destination: "/campus?mode=game",
        permanent: true,
      },
      {
        source: "/gamemode",
        destination: "/campus?mode=game",
        permanent: true,
      },
      {
        source: "/directory",
        destination: "/campus?mode=directory",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
