/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export for GitHub Pages (only when building for GitHub Actions)
  // Note: This will fail if API routes exist. For API routes, use Vercel/Netlify instead.
  output: process.env.GITHUB_ACTIONS === 'true' ? 'export' : undefined,
  images: {
    domains: [],
    // Unoptimized images required for static export
    unoptimized: process.env.GITHUB_ACTIONS === 'true',
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

