import type { NextConfig } from "next";

// Only proxy /api/v1 requests during local development.
// In production, NEXT_PUBLIC_API_URL is set to the Railway internal DNS
// endpoint, so the frontend calls the backend directly and the rewrite
// is never reached.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const IS_PRODUCTION = Boolean(process.env.NEXT_PUBLIC_API_URL);

const nextConfig: NextConfig = {
  async rewrites() {
    if (IS_PRODUCTION) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
