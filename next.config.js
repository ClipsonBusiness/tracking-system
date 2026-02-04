/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are enabled by default in Next.js 14+
  // Fix CSS-in-JS issues with @import rules
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig

