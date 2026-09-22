import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uhgpnbfhxgbyvhgfwisz.supabase.co",
        pathname: "/storage/v1/object/public/project-images/**",
      },
    ],
  },
};

export default nextConfig;

