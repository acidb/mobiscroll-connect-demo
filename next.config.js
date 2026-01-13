const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mobiscroll/connect-sdk'],
  // Using webpack temporarily to resolve symlinks and add SDK source directory, TODO: use default bundler when SDK is published
  webpack: (config, { isServer }) => {
    config.resolve.symlinks = true;
    config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, '../mobiscroll-connect-node/dist')];
    return config;
  },
};

module.exports = nextConfig;
