import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT ?? '',
        pathname: '/exam-assets/**',
      },
    ],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // gunakan native Web Crypto, bukan Node crypto
    }
    return config
  },
  experimental: {
    optimizePackageImports: ['chart.js', 'dexie'],
  },
}

export default nextConfig
