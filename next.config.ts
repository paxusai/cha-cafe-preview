import type { NextConfig } from "next";

// GitHub Pages preview: `PAGES_BASE_PATH=/cha-cafe-preview next build` writes a static
// site (no server) to out/, served from that sub-path. See README "GitHub Pages preview".
// It builds in .next like `next dev`, so stop the dev server first.
const pagesBase = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(pagesBase ? { output: "export" as const, basePath: pagesBase, trailingSlash: true } : {}),
  images: {
    // §10: AVIF/WebP everywhere. Static hosting has no image optimizer.
    unoptimized: !!pagesBase,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Cha's own WordPress media library (logo + product photos) — see README "Swapping in real photos".
      { protocol: "https", hostname: "www.chacafeusa.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "chacafeusa.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
};

export default nextConfig;
