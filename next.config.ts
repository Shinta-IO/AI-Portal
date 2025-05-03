import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}, // 👈 this is the correct structure
  },
};

export default nextConfig;
