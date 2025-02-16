/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ensures best practices in React development
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
  },
  output: 'standalone', // Keeps standalone mode for deployment
};

module.exports = nextConfig;
