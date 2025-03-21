/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ghanadude.co.za",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "0.0.0.0",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "developer.apple.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  },
};

export default nextConfig;