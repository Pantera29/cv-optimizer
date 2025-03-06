/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
