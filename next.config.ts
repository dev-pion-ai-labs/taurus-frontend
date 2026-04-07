import type { NextConfig } from "next";

// Always proxy /api/v1 requests through Next.js rewrites so the browser
// only ever talks to the frontend origin — this avoids CORS entirely.
//
// In production set the BACKEND_URL env var (server-side only) to the
// backend's Railway internal DNS or public URL, e.g.:
//   BACKEND_URL=http://taurus-backend.railway.internal:3000
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
