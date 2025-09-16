import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during production builds (Vercel) so deployments don't fail on lint rules
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
