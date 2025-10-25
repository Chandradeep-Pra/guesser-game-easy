import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/ashan",
        destination: "http://192.168.0.114:3000/api/ashan", // external API
      },
    ];
  },
};

export default nextConfig;
