import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/callback/:path*",
        destination: "/api/auth/callback/:path*",
      },
      {
        source: "/auth/callback/:path*",
        destination: "/api/auth/callback/:path*",
      },
    ];
  },
};

export default nextConfig;
