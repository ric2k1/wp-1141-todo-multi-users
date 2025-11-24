import type { NextConfig } from "next";
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig: NextConfig = {
  // 確保 Prisma Query Engine 二進位檔案被包含在 Vercel 部署包中
  // 在 Next.js 16+ 中，outputFileTracingIncludes 已從 experimental 移動到頂層
  // 使用相對路徑（相對於專案根目錄），避免 Vercel 環境中的路徑問題
  outputFileTracingIncludes: {
    // 匹配所有 API 路由
    '/api/**': [
      // 包含整個 .prisma/client 目錄
      './node_modules/.prisma/client/**/*',
      // 包含 @prisma/client 目錄
      './node_modules/@prisma/client/**/*',
    ],
    // 匹配所有路由（確保所有 serverless 函數都包含）
    '/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  // 停用 Turbopack，使用 webpack（因為 PrismaPlugin 需要 webpack）
  // 在 Next.js 16 中，Turbopack 是預設的，但我們需要 webpack 來使用 PrismaPlugin
  // 注意：在 package.json 的 vercel-build 腳本中也新增了 --webpack 標誌
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
  // 注意：不設定 serverComponentsExternalPackages，因為這會阻止 API Routes 正確打包 Prisma
};

export default nextConfig;
