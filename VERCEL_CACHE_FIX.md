# Vercel Prisma Query Engine 缓存问题修复指南

## 🐛 问题

即使已经配置了 `binaryTargets = ["native", "rhel-openssl-3.0.x"]`，Vercel 部署仍然报错：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## 🔍 可能的原因

1. **Vercel 构建缓存**：Vercel 可能缓存了旧的 `node_modules`，其中不包含正确的二进制文件
2. **postinstall 脚本未执行**：`postinstall` 脚本可能没有在正确的时机执行
3. **二进制文件未包含在部署包中**：生成的二进制文件可能没有被正确打包

## ✅ 解决方案

### 步骤 1: 清除 Vercel 构建缓存

#### 方法 A: 在部署时禁用缓存（推荐，最简单）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 `todo-multi-users`
3. 进入 **Deployments** 页面
4. 找到最新的部署（通常是列表最上面的）
5. 点击部署右侧的 **"..."** (三个点) 菜单
6. 选择 **"Redeploy"**
7. **重要**：在弹出窗口中，**取消勾选** "Use existing Build Cache" 或 "Use Cache"
8. 点击 **"Redeploy"**

这样会强制 Vercel 重新安装所有依赖并重新构建，不使用任何缓存。

#### 方法 B: 通过 Vercel CLI（需要安装 CLI）

如果你已经安装了 Vercel CLI：

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

# 强制重新部署到生产环境，不使用缓存
vercel --prod --force
```

如果没有安装 Vercel CLI，可以安装：

```bash
npm i -g vercel
# 或
yarn global add vercel
```

#### 方法 C: 通过空提交触发新部署（自动清除缓存）

推送新的提交会自动触发新部署，通常 Vercel 会使用新的依赖：

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

# 提交当前的配置更改
git add package.json PRISMA_ENGINE_FIX.md VERCEL_CACHE_FIX.md
git commit -m "Fix Prisma postinstall script - clear cache on next deploy"
git push
```

推送后，在 Vercel Dashboard 的 Deployments 页面，找到新触发的部署，点击 **"Redeploy"** 并**取消勾选缓存选项**。

### 步骤 2: 验证配置

确保以下文件配置正确：

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

#### `next.config.ts`（重要！）

Next.js 13+ 使用文件追踪来优化 serverless 函数大小，需要明确告诉它包含 Prisma 二进制文件：

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

**这是关键配置**：没有这个配置，即使生成了二进制文件，Next.js 也不会将它们包含在部署包中。详见 `NEXTJS_PRISMA_FIX.md`。

### 步骤 3: 本地验证

在推送之前，本地验证二进制文件已生成：

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

# 清理旧的 Prisma Client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 使用一个临时的 DATABASE_URL（prisma generate 不会真正连接数据库）
# 注意：prisma generate 不需要真正的数据库连接，但 prisma.config.ts 需要 DATABASE_URL 环境变量
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=./prisma/schema.prisma

# 验证二进制文件存在
ls -la node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node

# 应该看到类似输出：
# -rw-r--r--  1 user  group  12345678  Nov 24 13:00 libquery_engine-rhel-openssl-3.0.x.so.node
```

**注意**：如果你的项目有 `prisma.config.ts` 文件，`prisma generate` 命令需要 `DATABASE_URL` 环境变量（即使它不会真正连接数据库）。使用临时的 `DATABASE_URL` 值即可，因为 `prisma generate` 只需要读取 schema 文件，不会真正连接数据库。

### 步骤 4: 提交并推送

```bash
git add prisma/schema.prisma package.json next.config.ts NEXTJS_PRISMA_FIX.md
git commit -m "Fix Prisma Query Engine - add Next.js outputFileTracingIncludes config"
git push
```

### 步骤 5: 检查 Vercel 构建日志

部署后，在 Vercel Dashboard → Deployments → 最新部署 → Build Logs 中检查：

1. **应该看到 `postinstall` 脚本执行**：

   ```
   > postinstall
   > prisma generate --schema=./prisma/schema.prisma
   ```

2. **应该看到 `vercel-build` 脚本执行**：

   ```
   > vercel-build
   > prisma generate --schema=./prisma/schema.prisma && ...
   ```

3. **应该看到二进制文件生成信息**：
   ```
   Prisma Client generated with binary targets: native, rhel-openssl-3.0.x
   ```

### 步骤 6: 验证运行时

部署完成后，检查运行时日志：

- ✅ 不应该有 "Query Engine not found" 错误
- ✅ API 端点应该正常工作
- ✅ `/api/auth/lookup` 应该返回 200 而不是 500

## 🔧 如果问题仍然存在

### 检查 1: 验证二进制文件在部署包中

在 Vercel 构建日志中，查找是否有关于二进制文件的警告或错误。

### 检查 2: 尝试使用 Prisma 的 JavaScript 引擎（实验性）

如果 Rust 二进制文件仍然有问题，可以考虑使用 JavaScript 引擎（但这可能影响性能）：

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "library"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

### 检查 3: 联系 Vercel 支持

如果以上步骤都无法解决问题，可能需要联系 Vercel 支持，提供：

- 构建日志
- 运行时日志
- `package.json` 和 `prisma/schema.prisma` 的内容

## 📚 相关资源

- [Prisma Binary Targets 文档](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel 构建缓存文档](https://vercel.com/docs/build-step#caching)
- [Prisma Query Engine 故障排除](https://www.prisma.io/docs/guides/deployment/troubleshooting)

---

**最后更新**：2025-11-24
