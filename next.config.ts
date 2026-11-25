import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Origin the browser PUTs uploads to (the private S3-compatible bucket). */
function uploadOrigin() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return "";
  if (process.env.S3_ENDPOINT) return new URL(process.env.S3_ENDPOINT).origin;
  return `https://${bucket}.s3.${process.env.S3_REGION || "eu-west-2"}.amazonaws.com`;
}

// NF-05: security headers. Scripts allow 'unsafe-inline' because Next.js injects
// inline bootstrap scripts; move to nonces via middleware if a stricter CSP is needed.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://plausible.io https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${uploadOrigin()} https://plausible.io https://www.google-analytics.com https://*.google-analytics.com`,
  "frame-src https://challenges.cloudflare.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
