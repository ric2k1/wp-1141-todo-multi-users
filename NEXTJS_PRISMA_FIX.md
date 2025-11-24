# Next.js + Prisma 在 Vercel 上的配置修复

## 🐛 问题

即使已经配置了 `binaryTargets = ["native", "rhel-openssl-3.0.x"]` 并生成了正确的二进制文件，Vercel 部署仍然报错：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## 🔍 根本原因

Next.js 13+ 使用文件追踪（file tracing）来优化 serverless 函数的大小，只包含必要的文件。但是 Prisma 的 Query Engine 二进制文件（`.so.node` 文件）可能没有被自动检测和包含在部署包中。

## ✅ 解决方案

### 1. 安装 Prisma Next.js 插件

```bash
npm install --save-dev @prisma/nextjs-monorepo-workaround-plugin
```

**注意**：虽然这个插件主要用于 monorepo 环境，但它也可能帮助解决标准项目中的文件追踪问题。

### 2. 更新 `next.config.ts`

添加 `outputFileTracingIncludes` 配置和 Prisma webpack 插件：

```typescript
import type { NextConfig } from "next";
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig: NextConfig = {
  // 确保 Prisma Query Engine 二进制文件被包含在 Vercel 部署包中
  // 在 Next.js 16+ 中，outputFileTracingIncludes 已从 experimental 移动到顶层
  // 使用相对路径，并同时包含 API 路由和所有路由
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
    "/": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
  },
  // 使用 Prisma webpack 插件确保二进制文件被正确处理
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
  // 确保 Prisma 相关包不被 webpack 处理
  serverComponentsExternalPackages: ['@prisma/client'],
};

export default nextConfig;
```

**重要配置说明**：

- 使用**相对路径** `'./node_modules/...'` 而不是 `path.join(process.cwd(), ...)`
- 同时包含 `/api/**/*` 和 `/*` 路径，确保所有路由都包含 Prisma 二进制文件
- 这确保所有 API 路由和页面路由都包含 Prisma Client 和 Query Engine 二进制文件

**重要**：在 Next.js 16.0.0+ 中，`outputFileTracingIncludes` 已经从 `experimental` 移动到顶层配置。如果你使用的是 Next.js 15 或更早版本，请使用 `experimental.outputFileTracingIncludes`。

### 2. 验证配置

确保以下配置都已正确设置：

#### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

#### `package.json`

```json
{
  "scripts": {
    "postinstall": "prisma generate --schema=./prisma/schema.prisma",
    "vercel-build": "prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build"
  }
}
```

### 3. 提交并部署

```bash
git add next.config.ts
git commit -m "Fix Next.js config to include Prisma binaries in Vercel deployment"
git push
```

### 4. 清除 Vercel 缓存并重新部署

1. 在 Vercel Dashboard → Deployments
2. 找到最新部署，点击 "..." → "Redeploy"
3. **取消勾选** "Use existing Build Cache"
4. 点击 "Redeploy"

## 🔍 验证修复

部署后检查：

1. **构建日志**：应该看到 `prisma generate` 成功执行
2. **运行时日志**：不应该再有 "Query Engine not found" 错误
3. **API 端点**：`/api/auth/lookup` 和 `/api/auth/authorize` 应该正常工作

## 📚 相关资源

- [Next.js Output File Tracing](https://nextjs.org/docs/app/api-reference/next-config-js/output#caveats)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

**最后更新**：2025-11-24
