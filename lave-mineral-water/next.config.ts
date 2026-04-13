import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ✅ ngrok fix (important)
  allowedDevOrigins: ["*.ngrok-free.dev"],
};

export default nextConfig;