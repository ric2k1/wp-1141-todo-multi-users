# Prisma Query Engine 在 Vercel 上的故障排除指南

## 🐛 当前问题

即使已经配置了所有必要的设置，Vercel 部署仍然报错：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

错误信息显示 Prisma 在以下位置搜索二进制文件：
- `/var/task/node_modules/.prisma/client`
- `/var/task/node_modules/@prisma/client`
- `/vercel/path0/node_modules/@prisma/client`
- `/tmp/prisma-engines`

## ✅ 已尝试的解决方案

### 1. Prisma Schema 配置 ✓
- ✅ 已添加 `binaryTargets = ["native", "rhel-openssl-3.0.x"]`

### 2. 构建脚本配置 ✓
- ✅ `postinstall`: `prisma generate --schema=./prisma/schema.prisma`
- ✅ `vercel-build`: `prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build`

### 3. Next.js 配置 ✓
- ✅ `outputFileTracingIncludes` 已配置（使用相对路径）
- ✅ 包含 `/api/**/*` 和 `/*` 路径

## 🔍 进一步诊断步骤

### 步骤 1: 验证本地二进制文件生成

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

# 清理旧的 Prisma Client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 使用临时 DATABASE_URL 生成 Prisma Client
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=./prisma/schema.prisma

# 验证二进制文件存在
ls -la node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node
```

如果文件不存在，说明 `prisma generate` 没有正确生成二进制文件。

### 步骤 2: 检查 Vercel 构建日志

在 Vercel Dashboard → Deployments → 最新部署 → Build Logs 中检查：

1. **`prisma generate` 是否成功执行？**
   - 应该看到类似 `Generated Prisma Client` 的消息
   - 应该看到 `Binary targets: native, rhel-openssl-3.0.x`

2. **二进制文件是否在构建时生成？**
   - 检查日志中是否有关于 `libquery_engine-rhel-openssl-3.0.x.so.node` 的信息

3. **Next.js 构建是否成功？**
   - 检查是否有关于文件追踪的警告或错误

### 步骤 3: 尝试替代配置

如果问题仍然存在，尝试以下替代方案：

#### 方案 A: 使用 `serverComponentsExternalPackages`（不推荐，但可以尝试）

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  serverComponentsExternalPackages: ['@prisma/client'],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
    '/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
};
```

**注意**：这通常不是正确的解决方案，因为我们需要 Prisma 在 serverless 函数中运行。

#### 方案 B: 使用 `@prisma/nextjs-monorepo-workaround-plugin`

```bash
npm install --save-dev @prisma/nextjs-monorepo-workaround-plugin
```

```typescript
// next.config.ts
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }
    return config;
  },
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
    '/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
};
```

**注意**：这个插件主要用于 monorepo 环境，但可能对标准项目也有帮助。

#### 方案 C: 使用 `vercel.json` 配置

```json
{
  "buildCommand": "yarn vercel-build",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "includeFiles": "node_modules/.prisma/client/**"
    }
  }
}
```

### 步骤 4: 检查 Prisma 版本兼容性

确保使用的 Prisma 版本与 Next.js 16 兼容：

```bash
# 检查当前版本
npm list @prisma/client prisma

# 如果需要，更新到最新版本
npm install @prisma/client@latest prisma@latest
```

### 步骤 5: 联系 Prisma 支持

如果所有方法都失败，可以：

1. 在 [Prisma GitHub Issues](https://github.com/prisma/prisma/issues) 中搜索类似问题
2. 提交新的 issue，包含：
   - Next.js 版本
   - Prisma 版本
   - 完整的错误日志
   - `next.config.ts` 配置
   - `package.json` 配置
   - `prisma/schema.prisma` 配置

## 📋 检查清单

在尝试每个解决方案后，检查：

- [ ] Vercel 构建日志显示 `prisma generate` 成功
- [ ] 构建日志显示生成了 `rhel-openssl-3.0.x` 二进制文件
- [ ] 运行时日志没有 "Query Engine not found" 错误
- [ ] `/api/auth/lookup` 端点正常工作
- [ ] `/api/auth/session` 端点正常工作

## 🔗 相关资源

- [Prisma on Vercel - Official Docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Output File Tracing](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Prisma Query Engine Not Found - GitHub Discussion](https://github.com/prisma/prisma/issues)

---

**最后更新**：2025-11-24
