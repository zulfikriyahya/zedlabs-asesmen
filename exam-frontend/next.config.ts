import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Aktifkan strict mode React
  reactStrictMode: true,

  // Ekspor header CSP via next-safe dikonfigurasi di middleware
  // sehingga bisa bersifat dinamis per-tenant

  // Konfigurasi image untuk MinIO
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT ?? '',
        pathname: '/exam-assets/**',
      },
    ],
  },

  // Webpack: aktifkan Web Crypto API polyfill di SSR jika perlu
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // gunakan native Web Crypto, bukan Node crypto
    }
    return config
  },

  // Bundle analyzer (aktifkan saat profiling)
  // bundlePagesRouterDependencies: true,

  // Experimental: optimasi untuk PWA
  experimental: {
    optimizePackageImports: ['chart.js', 'dexie'],
  },
}

export default nextConfig
