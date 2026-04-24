import type { NextConfig } from "next";

const nextConfig = {
  // Garante que os templates HTML sejam empacotados nas serverless functions da Vercel.
  // Sem isso, os arquivos em src/templates/ não existem em produção e fs.readFileSync falha.
  outputFileTracingIncludes: {
    "/api/generate": ["./src/templates/**/*"],
  },
} satisfies NextConfig & { outputFileTracingIncludes?: Record<string, string[]> };

export default nextConfig;