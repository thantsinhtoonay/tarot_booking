import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Avoid a Windows-only generated-segment directory race during local builds.
    cpus: process.platform === "win32" ? 1 : undefined,
  },
};

export default nextConfig;
