import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  output: 'standalone',
  experimental: {
    // Subida de videos/audios pesados (multipart) vía Server Actions
    serverActions: {
      bodySizeLimit: '150mb',
    },
    // proxy.ts almacena el cuerpo de cada petición; por defecto lo corta a 10MB y rompía los videos
    proxyClientMaxBodySize: '150mb',
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
