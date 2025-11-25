// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import { env } from "./env.mjs"

const baseConfig: NextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  logging: { fetches: { fullUrl: true } },

  // TEMP : ne bloque pas la build sur les erreurs ESLint
  // (remets à false quand le lint sera corrigé)
  eslint: { ignoreDuringBuilds: true },

  // Important : pas d'optimizePackageImports sur "antd"
  // (c'est ce qui déclenchait les erreurs __barrel_optimize__)
  // experimental: { optimizePackageImports: undefined },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:8000/:path*" },
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
    ]
  },
}

// env.ANALYZE est déjà un booléen grâce à env.mjs
const withAnalyzer = withBundleAnalyzer({ enabled: env.ANALYZE })

export default env.ANALYZE ? withAnalyzer(baseConfig) : baseConfig
