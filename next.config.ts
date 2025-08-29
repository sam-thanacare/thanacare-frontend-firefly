import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    THANACARE_BACKEND: process.env.THANACARE_BACKEND,
  },
};

export default nextConfig;
