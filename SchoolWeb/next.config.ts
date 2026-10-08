import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy is per-request (nonce) and set in src/proxy.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone for the Docker image (ignored by `next dev`).
  output: "standalone",
  poweredByHeader: false,
  // No floating Next.js dev badge over the portal.
  devIndicators: false,
  // Let phones/laptops on the same Wi-Fi open `next dev` by the PC's LAN IP.
  allowedDevOrigins: ["192.168.*.*"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/auth/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
