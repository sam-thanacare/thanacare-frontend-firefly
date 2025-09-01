import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_THANACARE_BACKEND:
      process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080',
    // Additional CORS-related environment variables for frontend configuration
    NEXT_PUBLIC_CORS_ENABLED: process.env.CORS_ENABLED || 'true',
    NEXT_PUBLIC_API_TIMEOUT: process.env.API_TIMEOUT || '10000',
  },
  // Add headers for CORS if needed (though this is primarily handled by the backend)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Ensure environment variables are properly exposed to the client
  serverExternalPackages: [],
};

export default nextConfig;
