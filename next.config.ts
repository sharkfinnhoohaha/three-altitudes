import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, './'),
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    config.resolve.alias['@/contexts'] = path.join(__dirname, 'src/contexts');
    return config;
  },
};

export default nextConfig;
