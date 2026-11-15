/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'bcryptjs'],
  },
};

export default nextConfig;

