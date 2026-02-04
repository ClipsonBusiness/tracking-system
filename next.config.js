/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are enabled by default in Next.js 14+
  // Fix CSS-in-JS issues with @import rules
  experimental: {
    optimizeCss: false,
  },
  // Disable CSS optimization to prevent @import errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

