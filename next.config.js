/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Aggressive cache prevention to avoid corruption
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Completely disable webpack cache in development to prevent corruption
      config.cache = false;
      
      // Disable persistent cache
      if (config.optimization) {
        config.optimization.moduleIds = 'named';
        config.optimization.chunkIds = 'named';
      }
    }
    return config;
  },
  // Clear output directory on each build
  cleanDistDir: true,
  // Enable SWC minification (but we'll disable its cache separately)
  swcMinify: true,
  // Disable experimental features that might cause cache issues
  experimental: {
    // Disable any experimental caching
    staleTimes: undefined,
  },
  // Force clean builds
  onDemandEntries: {
    // Periodically clear the cache
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

