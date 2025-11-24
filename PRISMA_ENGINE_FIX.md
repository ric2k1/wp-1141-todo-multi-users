# Prisma Query Engine 错误修复

## 🐛 问题

错误信息：

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## ✅ 已应用的修复

### 1. 更新 Prisma Schema

在 `prisma/schema.prisma` 中添加了 `binaryTargets`：

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

这确保 Prisma 会生成 Linux (RHEL) 二进制文件，这是 Vercel 使用的运行时环境。

### 2. 更新构建脚本

在 `package.json` 中更新了 `vercel-build` 脚本：

```json
"vercel-build": "prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build"
```

明确指定 schema 路径，确保在正确的目录中运行。

## ✅ 验证修复

已确认生成了正确的二进制文件：

- ✅ `libquery_engine-rhel-openssl-3.0.x.so.node` - Vercel 需要的 Linux 二进制文件
- ✅ `libquery_engine-darwin.dylib.node` - macOS 本地开发

## 🔧 下一步操作

### 1. 提交更改

```bash
git add prisma/schema.prisma package.json PRISMA_ENGINE_FIX.md
git commit -m "Fix Prisma Query Engine for Vercel deployment - add rhel-openssl-3.0.x binary target"
git push
```

### 2. 等待 Vercel 自动部署

推送后，Vercel 会自动：

1. 运行 `yarn install`（会触发 `postinstall: prisma generate`）
2. 运行 `yarn vercel-build`（会再次运行 `prisma generate`）
3. 生成包含 `rhel-openssl-3.0.x` 二进制文件的 Prisma Client
4. 部署应用

### 3. 验证修复

部署后，检查：

- Vercel 构建日志应该显示 `prisma generate` 成功
- 运行时日志不应该再有 Query Engine 错误
- API 端点应该正常工作

## 📋 验证清单

部署后确认：

- [ ] 构建日志显示 `prisma generate` 成功
- [ ] 构建日志显示生成了 `rhel-openssl-3.0.x` 二进制文件
- [ ] 运行时日志没有 Query Engine 错误
- [ ] `/api/auth/authorize` 端点正常工作
- [ ] `/api/auth/lookup` 端点正常工作

## 🔍 如果问题仍然存在

### 检查构建日志

在 Vercel Dashboard → Deployments → 最新部署 → Build Logs

应该看到：

```
Running "prisma generate"
```

### 检查生成的二进制文件

构建日志中应该显示生成了多个平台的二进制文件。

### 清除 Vercel 构建缓存

如果问题仍然存在，可能是 Vercel 缓存了旧的 `node_modules`：

1. **在 Vercel Dashboard 中清除缓存**：

   - 进入项目设置 → General
   - 找到 "Clear Build Cache" 或类似选项
   - 点击清除缓存

2. **或者通过 Vercel CLI**：

   ```bash
   vercel --force
   ```

3. **或者在 Vercel Dashboard 中重新部署**：
   - 进入 Deployments
   - 找到最新的部署
   - 点击 "Redeploy"
   - 选择 "Use existing Build Cache" 为 **否**

### 清理本地并重新部署

如果问题仍然存在：

```bash
# 清理本地 Prisma Client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 重新生成
npx prisma generate --schema=./prisma/schema.prisma

# 验证二进制文件已生成
ls -la node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node

# 提交并推送
git add .
git commit -m "Regenerate Prisma Client with binary targets"
git push
```

### 验证 postinstall 脚本

确保 `package.json` 中的 `postinstall` 脚本正确：

```json
"postinstall": "prisma generate --schema=./prisma/schema.prisma"
```

这确保在 `yarn install` 后自动生成 Prisma Client。

## 📚 相关文档

- [Prisma Binary Targets](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Prisma Guide](https://vercel.com/guides/using-prisma-with-vercel)

---

**修复日期**：2025-11-24
