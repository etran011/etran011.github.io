import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the loopback preview alias compatible with Next’s development origin checks.
  allowedDevOrigins: ["127.0.0.1"],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
