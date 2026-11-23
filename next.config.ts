import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "genshin.jmp.blue",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.nanoka.cc",
        pathname: "/assets/gi/**",
      },
      {
        protocol: "https",
        hostname: "enka.network",
        pathname: "/ui/**",
      },
    ],
  },
};

export default nextConfig;