import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 确保 Prisma Query Engine 二进制文件被包含在 Vercel 部署包中
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': [
        path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
        path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      ],
    },
  },
};

export default nextConfig;
