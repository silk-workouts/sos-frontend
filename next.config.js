/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ensures best practices in React development
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
  },
  output: 'standalone', // Keeps standalone mode for deployment

  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint checks during builds (Vercel or local next build)
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Consider restricting this to your specific domains in production
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
