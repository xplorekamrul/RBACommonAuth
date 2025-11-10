/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {

    remotePatterns: [
      {
        protocol: "https",
        hostname: "emptrack.arrowheadit.net",
        pathname: "/uploads/**",
      },
    ],
  },

};

export default nextConfig;
