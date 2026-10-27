import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker builds (BUILD_STANDALONE=1) emit a self-contained server in .next/standalone.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
