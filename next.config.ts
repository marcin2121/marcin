import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompresja zasobów (zazwyczaj domyślna, ale warto wymusić)
  compress: true,
  
  experimental: {
    // 🔥 Turbo-odchudzanie paczek JS
    // Pobiera tylko te ikony/funkcje, których faktycznie używasz
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;