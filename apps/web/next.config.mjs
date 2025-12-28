// apps/web/next.config.mjs

import withNextIntl from "next-intl/plugin";

const nextIntlConfig = withNextIntl("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ham-marketplace/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextIntlConfig(nextConfig);
