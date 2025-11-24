# Next.js + Prisma 在 Vercel 上的配置修复

## 🐛 问题

即使已经配置了 `binaryTargets = ["native", "rhel-openssl-3.0.x"]` 并生成了正确的二进制文件，Vercel 部署仍然报错：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## 🔍 根本原因

Next.js 13+ 使用文件追踪（file tracing）来优化 serverless 函数的大小，只包含必要的文件。但是 Prisma 的 Query Engine 二进制文件（`.so.node` 文件）可能没有被自动检测和包含在部署包中。

## ✅ 解决方案

### 1. 更新 `next.config.ts`

添加 `experimental.outputFileTracingIncludes` 配置，明确告诉 Next.js 包含 Prisma 的二进制文件：

```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 确保 Prisma Query Engine 二进制文件被包含在 Vercel 部署包中
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": [
        path.join(process.cwd(), "node_modules/.prisma/client/**/*"),
        path.join(process.cwd(), "node_modules/@prisma/client/**/*"),
      ],
    },
  },
};

export default nextConfig;
```

这个配置确保所有 API 路由（`/api/**`）都包含 Prisma Client 和 Query Engine 二进制文件。

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
