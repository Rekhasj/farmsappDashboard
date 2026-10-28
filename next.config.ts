import type { NextConfig } from "next";

// Base URL of the Spring Boot backend, e.g. http://localhost:8080
// Set this in .env.local (see .env.example). Do NOT hardcode it here.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

// The backend's servlet context-path (see application.yml -> server.servlet.context-path).
// Currently "/kisaan" for the kisaan-app.
const BACKEND_CONTEXT_PATH = process.env.BACKEND_CONTEXT_PATH ?? "/kisaan";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse already-visited pages for 30s when navigating via links, so going
    // back to Home does not refetch and flash a loader. router.refresh()
    // (used after changing location) still bypasses this.
    staleTimes: { dynamic: 30, static: 180 },
  },
  async rewrites() {
    return [
      {
        // Anything the browser (or a server component) calls at /api/backend/*
        // gets forwarded, server-side, to the real backend. This keeps the
        // browser talking to the same origin as the Next.js app, so there's
        // no CORS to configure on the Spring Boot side.
        source: "/api/backend/:path*",
        destination: `${BACKEND_ORIGIN}${BACKEND_CONTEXT_PATH}/:path*`,
      },
    ];
  },
};

export default nextConfig;
