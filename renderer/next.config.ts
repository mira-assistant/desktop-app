const path = require('path');
const dotenv = require('dotenv');

// Load .env from parent directory (root)
const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

const isDev = process.env.NODE_ENV === 'development';

if (result.error) {
  console.warn('Warning: Could not load .env file from:', envPath);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',

  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_BETA: process.env.BETA,
  },

  assetPrefix: isDev ? undefined : '.',

  reactStrictMode: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;