import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable response compression (gzip/brotli)
  compress: true,
  
  experimental: {
    // Tree-shake heavy dependencies — only import used exports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;