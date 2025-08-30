import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_THANACARE_BACKEND:
      process.env.THANACARE_BACKEND || 'http://localhost:8080',
  },
};

export default nextConfig;
