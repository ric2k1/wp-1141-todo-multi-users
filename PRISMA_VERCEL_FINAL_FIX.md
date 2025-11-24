# Prisma Query Engine Vercel 部署最终修复方案

## 🐛 问题

即使已经配置了所有必要的设置，Vercel 部署仍然报错：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

错误显示搜索了以下位置但都没找到：
- `/var/task/node_modules/.prisma/client`
- `/var/task/node_modules/@prisma/client`
- `/vercel/path0/node_modules/@prisma/client`
- `/tmp/prisma-engines`

## 🔍 根本原因分析

这个问题通常由以下原因之一引起：

1. **构建缓存问题**：Vercel 使用了旧的构建缓存，其中不包含正确的二进制文件
2. **文件追踪问题**：Next.js 的文件追踪没有正确包含 Prisma 二进制文件
3. **构建时机问题**：`prisma generate` 在构建过程中没有正确执行
4. **路径问题**：`outputFileTracingIncludes` 的路径配置不正确

## ✅ 完整解决方案

### 步骤 1: 验证所有配置文件

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

#### `next.config.ts`

```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**': [
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/@prisma/client/**/*'),
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
    ],
    '/': [
      path.join(process.cwd(), 'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
      path.join(process.cwd(), 'node_modules/.prisma/client/**/*'),
    ],
  },
};

export default nextConfig;
```

#### `vercel.json`

```json
{
  "buildCommand": "yarn vercel-build",
  "installCommand": "yarn install",
  "framework": "nextjs"
}
```

### 步骤 2: 强制清除 Vercel 构建缓存

**这是最关键的一步！**

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `todo-multi-users`
3. 进入 **Deployments** 页面
4. 找到最新的部署，点击右侧的 **"..."** 菜单
5. 选择 **"Redeploy"**
6. **重要**：在弹出窗口中，**取消勾选** "Use existing Build Cache"
7. 点击 **"Redeploy"**

或者使用 Vercel CLI：

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
vercel --prod --force
```

### 步骤 3: 验证构建日志

部署后，检查 Vercel 构建日志，确认：

1. ✅ `prisma generate` 成功执行
2. ✅ 日志中显示生成了 `rhel-openssl-3.0.x` 二进制文件
3. ✅ `next build` 成功完成
4. ✅ 没有文件追踪相关的警告

### 步骤 4: 如果问题仍然存在

#### 方法 A: 使用 `@prisma/adapter-vercel`（如果可用）

检查是否有 `@prisma/adapter-vercel` 包可用，这可能是更可靠的解决方案。

#### 方法 B: 检查 Vercel 构建环境

在 Vercel 构建日志中，查找以下信息：
- Node.js 版本
- 构建命令执行顺序
- `prisma generate` 的输出

#### 方法 C: 使用环境变量强制重新生成

在 Vercel 项目设置中添加环境变量：
- `PRISMA_GENERATE_DATAPROXY=false`（如果使用 Data Proxy）
- `PRISMA_CLI_BINARY_TARGETS=rhel-openssl-3.0.x`

#### 方法 D: 检查 `vercel.json` 配置

确保 `vercel.json` 中的 `buildCommand` 正确执行了 `prisma generate`。

## 🔧 本地验证

在推送之前，本地验证配置：

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

# 清理旧的 Prisma Client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 使用临时 DATABASE_URL 生成 Prisma Client
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=./prisma/schema.prisma

# 验证二进制文件存在
ls -la node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node

# 应该看到类似输出：
# -rwxr-xr-x  1 user  group  12345678 Nov 24 13:00 libquery_engine-rhel-openssl-3.0.x.so.node
```

## 📋 检查清单

部署前确认：

- [ ] `prisma/schema.prisma` 包含 `binaryTargets = ["native", "rhel-openssl-3.0.x"]`
- [ ] `package.json` 的 `postinstall` 和 `vercel-build` 脚本正确配置
- [ ] `next.config.ts` 包含 `outputFileTracingIncludes` 配置
- [ ] `vercel.json` 配置正确
- [ ] 本地可以成功生成 `rhel-openssl-3.0.x` 二进制文件
- [ ] 已提交所有更改到 Git

部署后确认：

- [ ] Vercel 构建日志显示 `prisma generate` 成功
- [ ] 构建日志显示生成了 `rhel-openssl-3.0.x` 二进制文件
- [ ] 运行时日志没有 Query Engine 错误
- [ ] `/api/auth/lookup` 端点正常工作
- [ ] `/api/auth/authorize` 端点正常工作

## 🆘 如果所有方法都失败

如果尝试了所有方法后问题仍然存在，可能需要：

1. **联系 Vercel 支持**：提供构建日志和错误信息
2. **检查 Prisma 版本兼容性**：确保 `@prisma/client` 和 `prisma` 版本兼容
3. **考虑使用 Prisma Data Proxy**：作为替代方案
4. **检查 Vercel 项目设置**：确保没有其他配置冲突

## 📚 相关文档

- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js File Tracing](https://nextjs.org/docs/app/api-reference/next-config-js/output#caveats)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
