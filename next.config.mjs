/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Move deprecated options out of experimental
  skipMiddlewareUrlNormalize: true,

  reactStrictMode: false,

  // Disable image optimization warnings
  images: {
    unoptimized: true,
  },

  // Ignore specific page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"].filter(
    (ext) => !ext.includes("spec")
  ),

  // Configure webpack
  webpack: (config, { isServer, dev }) => {
    // Ignore specific modules that might cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      canvas$: false,
    };

    // Speed up development builds
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

  // Suppress specific console warnings
  onDemandEntries: {
    // Reduce console noise
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
