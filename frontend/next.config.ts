import withBundleAnalyzer from "@next/bundle-analyzer"
import { type NextConfig } from "next"
import { env } from "./env.mjs"

const config: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: { fullUrl: true },
  },
  async rewrites() {
    return [
      // proxy local API vers le backend
      { source: "/api/:path*", destination: "http://localhost:8000/:path*" },
      // endpoints de santé
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
    ]
  },
}

const withAnalyzer = withBundleAnalyzer({
  enabled: env.ANALYZE === "true",
})

export default env.ANALYZE ? withAnalyzer(config) : config
