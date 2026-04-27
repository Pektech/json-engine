const path = require('path');
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Default vendor chunk (smaller libraries)
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            minChunks: 2,
          },
          // Monaco Editor - heavy, separate chunk
          monaco: {
            test: /[\/]node_modules[\/](@monaco-editor|monaco-editor)[\/]/,
            name: 'monaco-editor',
            chunks: 'all',
            priority: 20,
            minSize: 1000000, // 1MB
          },
          // React Flow - canvas library
          reactflow: {
            test: /[\/]node_modules[\/](@xyflow|reactflow|react-flow)[\/]/,
            name: 'react-flow',
            chunks: 'all',
            priority: 20,
            minSize: 500000, // 500KB
          },
          // AJV and validation libraries
          validation: {
            test: /[\/]node_modules[\/](ajv|ajv-)[\/]/,
            name: 'validation',
            chunks: 'all',
            priority: 15,
          },
          // Dagre layout library
          dagre: {
            test: /[\/]node_modules[\/](@dagrejs|dagre|graphlib)[\/]/,
            name: 'dagre',
            chunks: 'all',
            priority: 20,
          },
        },
      }
      
      // Increase bundle budget for development (build will still warn)
      config.performance = config.performance || {};
      config.performance.hints = 'warning'; // Change to warning instead of error for dev
      config.performance.maxAssetSize = 500000; // 500KB for development
      config.performance.maxEntrypointSize = 500000; // 500KB for development
    }
    
    
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.join(__dirname, 'src');

    config.resolve.extensions = [...(config.resolve.extensions || ['.js', '.jsx', '.json', '.mjs']), '.ts', '.tsx'];
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
