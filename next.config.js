/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    // Add bundle budget for initial chunks (client-side)
    if (!isServer) {
      config.performance = config.performance || {};
      config.performance.hints = 'error';
      config.performance.maxAssetSize = 300000; // 300KB
      config.performance.maxEntrypointSize = 300000; // 300KB
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
