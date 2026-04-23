import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que os templates HTML sejam empacotados nas serverless functions da Vercel.
  // Sem isso, os arquivos em src/templates/ não existem em produção e fs.readFileSync falha.
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate": ["./src/templates/**/*"],
    },
  },
};

export default nextConfig;
