const path = require('path');
const dotenv = require('dotenv');

// Load .env from parent directory (root)
const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: Could not load .env file from:', envPath);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pass environment variables to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_BETA: process.env.BETA,
  },

  reactStrictMode: true,

  // Only use export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
  }),

  images: {
    unoptimized: true,
  },

  // Empty turbopack config to silence warning
  turbopack: {},
};

module.exports = nextConfig;