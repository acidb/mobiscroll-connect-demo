const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mobiscroll/connect-sdk'],
};

module.exports = nextConfig;
