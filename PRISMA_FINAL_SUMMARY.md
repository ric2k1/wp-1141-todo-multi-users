# Prisma Query Engine 问题最终总结

## 🐛 问题描述

Vercel 部署后，API 路由报错：
```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

错误显示 Prisma 在以下位置搜索但都没找到：
- `/var/task/node_modules/.prisma/client`
- `/var/task/node_modules/@prisma/client`
- `/vercel/path0/node_modules/@prisma/client`
- `/tmp/prisma-engines`

## ✅ 已应用的配置

### 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```
**状态**: ✅ 已配置

### 2. Package.json 脚本
```json
{
  "scripts": {
    "postinstall": "prisma generate --schema=./prisma/schema.prisma",
    "vercel-build": "prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build"
  }
}
```
**状态**: ✅ 已配置

### 3. Next.js 配置 (`next.config.ts`)
```typescript
import type { NextConfig } from "next";
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**': [
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
    ],
    '/*': [
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;
```
**状态**: ✅ 已配置（包括 Prisma webpack 插件）

### 4. 安装的插件
- ✅ `@prisma/nextjs-monorepo-workaround-plugin` (v7.0.0)

## 🔍 诊断步骤

### 步骤 1: 运行诊断脚本
```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
./check-prisma-build.sh
```

### 步骤 2: 检查 Vercel 构建日志
在 Vercel Dashboard → Deployments → 最新部署 → Build Logs 中检查：

1. **`prisma generate` 是否成功执行？**
   - 应该看到类似 `Generated Prisma Client` 的消息
   - 应该看到 `Binary targets: native, rhel-openssl-3.0.x`

2. **二进制文件是否在构建时生成？**
   - 检查日志中是否有关于 `libquery_engine-rhel-openssl-3.0.x.so.node` 的信息
   - 检查是否有任何文件追踪相关的警告

3. **Next.js 构建是否成功？**
   - 检查是否有关于文件追踪的警告或错误
   - 检查构建输出大小（如果二进制文件被包含，serverless 函数会更大）

### 步骤 3: 验证本地构建
```bash
# 清理旧的构建
rm -rf .next node_modules/.prisma

# 生成 Prisma Client
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=./prisma/schema.prisma

# 验证二进制文件存在
ls -la node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node

# 运行 Next.js 构建
npm run build

# 检查构建输出
find .next/server -name "*prisma*" -o -name "*query_engine*"
```

## 🚨 如果问题仍然存在

### 可能的原因

1. **Vercel 构建缓存问题**
   - 即使清除了缓存，某些缓存可能仍然存在
   - **解决方案**: 在 Vercel Dashboard 中完全禁用缓存，或使用 `vercel --force` 命令

2. **Next.js 16 文件追踪问题**
   - Next.js 16 的文件追踪机制可能有 bug
   - **解决方案**: 考虑降级到 Next.js 15，或等待 Next.js 更新

3. **Prisma 版本兼容性问题**
   - Prisma 6.18.0 可能与 Next.js 16 有兼容性问题
   - **解决方案**: 尝试更新到最新版本的 Prisma

4. **Vercel 平台问题**
   - Vercel 的 serverless 函数环境可能有变化
   - **解决方案**: 联系 Vercel 支持

### 替代方案

#### 方案 A: 使用 Prisma Data Proxy（推荐用于生产环境）
```bash
npm install @prisma/client @prisma/data-proxy
```

然后使用 Prisma Data Proxy URL 而不是直接数据库连接。这可以避免二进制文件问题。

#### 方案 B: 降级到 Next.js 15
```bash
npm install next@15
```

Next.js 15 的文件追踪机制可能更稳定。

#### 方案 C: 使用 Edge Runtime（如果适用）
如果 API 路由可以使用 Edge Runtime，Prisma 可能不需要 Query Engine 二进制文件。

#### 方案 D: 联系支持
1. **Prisma GitHub Issues**: https://github.com/prisma/prisma/issues
2. **Vercel Community**: https://community.vercel.com
3. **Next.js Discussions**: https://github.com/vercel/next.js/discussions

## 📋 检查清单

在每次部署后检查：

- [ ] Vercel 构建日志显示 `prisma generate` 成功
- [ ] 构建日志显示生成了 `rhel-openssl-3.0.x` 二进制文件
- [ ] 运行时日志没有 "Query Engine not found" 错误
- [ ] `/api/auth/lookup` 端点正常工作
- [ ] `/api/auth/session` 端点正常工作

## 📚 相关资源

- [Prisma on Vercel - Official Docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Output File Tracing](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Prisma Query Engine Not Found - GitHub Discussion](https://github.com/prisma/prisma/issues)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

**最后更新**: 2025-11-24
**当前状态**: 问题仍然存在，需要进一步诊断
