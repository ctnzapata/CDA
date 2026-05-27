import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack flag that might not be fully typed yet
  allowedDevOrigins: ['192.168.1.136'],
};

export default nextConfig;
