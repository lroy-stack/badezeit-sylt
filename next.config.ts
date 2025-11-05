import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16: Using remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Next.js 16: Turbopack is now the default bundler
  experimental: {
    // Optimistic UI updates
    optimisticClientCache: true,
  },
};

export default nextConfig;
