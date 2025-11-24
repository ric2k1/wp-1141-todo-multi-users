import type { NextConfig } from "next";
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import path from 'path';

const nextConfig: NextConfig = {
  // 确保 Prisma Query Engine 二进制文件被包含在 Vercel 部署包中
  // 在 Next.js 16+ 中，outputFileTracingIncludes 已从 experimental 移动到顶层
  // 使用绝对路径确保文件被正确包含
  outputFileTracingIncludes: {
    // 匹配所有 API 路由
    '/api/**': [
      // 包含整个 .prisma/client 目录
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
      // 包含 @prisma/client 目录
      path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      // 明确指定二进制文件（如果路径已知）
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
    ],
    // 匹配所有路由（确保所有 serverless 函数都包含）
    '/*': [
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
    ],
  },
  // 使用 Prisma webpack 插件确保二进制文件被正确处理
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
  // 注意：不设置 serverComponentsExternalPackages，因为这会阻止 API Routes 正确打包 Prisma
};

export default nextConfig;
