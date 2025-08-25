/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add your backend/media host here so Next Image can optimize remote images
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};
export default nextConfig;
