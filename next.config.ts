import type { NextConfig } from "next";

/**
 * The site is fully static (`next build` writes it to `out/`), so it can be
 * hosted anywhere, including GitHub Pages. NEXT_PUBLIC_BASE_PATH is set when the
 * site lives under a sub-path, e.g. "/learning-workspace-website" on
 * <user>.github.io/learning-workspace-website/.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
