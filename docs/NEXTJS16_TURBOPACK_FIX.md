# Next.js 16 Turbopack 冲突修复

## 🐛 问题

在 Next.js 16 中部署到 Vercel 时遇到构建错误：

```
⨯ ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
   This may be a mistake.

   As of Next.js 16 Turbopack is enabled by default and
   custom webpack configurations may need to be migrated to Turbopack.
```

## 🔍 根本原因

Next.js 16 默认启用 **Turbopack** 作为构建工具，但我们的配置中使用了 **webpack**（因为需要 `PrismaPlugin`）。这导致了冲突。

## ✅ 解决方案

### 1. 更新 `package.json` 的 `vercel-build` 脚本

添加 `--webpack` 标志来明确使用 webpack 而不是 Turbopack：

```json
{
  "scripts": {
    "vercel-build": "prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build --webpack"
  }
}
```

### 2. `next.config.ts` 保持不变

`next.config.ts` 中的 webpack 配置保持不变，因为我们需要 `PrismaPlugin`：

```typescript
import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": [
      path.join(process.cwd(), "node_modules/.prisma/client/**/*"),
      path.join(process.cwd(), "node_modules/@prisma/client/**/*"),
      path.join(
        process.cwd(),
        "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"
      ),
    ],
    "/*": [
      path.join(process.cwd(), "node_modules/.prisma/client/**/*"),
      path.join(process.cwd(), "node_modules/@prisma/client/**/*"),
      path.join(
        process.cwd(),
        "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"
      ),
    ],
  },
  // 使用 webpack（因为 PrismaPlugin 需要 webpack）
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;
```

## 📋 为什么需要 webpack？

1. **PrismaPlugin 依赖**: `@prisma/nextjs-monorepo-workaround-plugin` 的 `PrismaPlugin` 是为 webpack 设计的
2. **二进制文件处理**: webpack 配置可以确保 Prisma Query Engine 二进制文件被正确处理和打包

## 🔄 替代方案（如果将来需要）

如果将来 Prisma 支持 Turbopack，或者不再需要 `PrismaPlugin`，可以考虑：

1. **移除 webpack 配置**，只使用 `outputFileTracingIncludes`
2. **迁移到 Turbopack 配置**（如果 Prisma 支持）

## ✅ 验证修复

部署后检查：

- [ ] Vercel 构建日志显示构建成功（没有 Turbopack 错误）
- [ ] 运行时日志没有 "Query Engine not found" 错误
- [ ] API 端点正常工作

## 📚 相关资源

- [Next.js 16 Turbopack](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [Next.js Build Options](https://nextjs.org/docs/app/api-reference/next-cli#build)

---

**最后更新**: 2025-11-24
