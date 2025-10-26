import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.pexels.com"], // ✅ allow external image domain
  },
  async rewrites() {
    return [
      {
        source: "/api/ashan",
        destination: "http://192.168.0.114:3000/api/ashan", // ✅ your API rewrite
      },
    ];
  },
};

export default nextConfig;
