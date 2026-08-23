import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
