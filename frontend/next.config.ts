// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import { env } from './env.mjs';

const API_PROXY_BASE = env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, '');

const baseConfig: NextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  logging: { fetches: { fullUrl: true } },

  // TEMP : ne bloque pas la build sur les erreurs ESLint
  // (remets à false quand le lint sera corrigé)
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    return [
      { source: '/healthz', destination: '/_api/health' },
      { source: '/api/healthz', destination: '/_api/health' },
      { source: '/health', destination: '/_api/health' },
      { source: '/ping', destination: '/_api/health' },

      // Proxy relative /api/* requests to the configured backend base.
      // Example:
      //   NEXT_PUBLIC_API_BASE=https://api.konnaxion.com/api
      // becomes:
      //   /api/foo -> https://api.konnaxion.com/api/foo
      { source: '/api/:path*', destination: `${API_PROXY_BASE}/:path*` },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({ enabled: env.ANALYZE });

export default env.ANALYZE ? withAnalyzer(baseConfig) : baseConfig;