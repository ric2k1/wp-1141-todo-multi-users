# Vercel 部署错误诊断指南

## 问题：API 返回 "Internal server error" (500)

当部署的应用返回 500 错误时，按照以下步骤诊断：

## 🔍 诊断步骤

### 步骤 1：查看 Vercel 日志

1. **登录 Vercel Dashboard**

   - 访问 https://vercel.com/dashboard
   - 选择您的项目

2. **查看部署日志**

   - 进入 "Deployments" 标签
   - 点击最新的部署
   - 查看 "Build Logs" 确认构建成功

3. **查看运行时日志**
   - 在部署详情页面，点击 "Runtime Logs" 或 "Function Logs"
   - 查找错误堆栈信息
   - 特别注意 Prisma 相关的错误

### 步骤 2：检查环境变量

在 Vercel Dashboard → Settings → Environment Variables 确认：

✅ **必需的环境变量**：

- `DATABASE_URL` - 数据库连接字符串
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `NEXTAUTH_URL` - 应用 URL（如 `https://your-app.vercel.app`）

✅ **OAuth 提供商变量**（根据使用的提供商）：

- `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` 和 `FACEBOOK_CLIENT_SECRET`

**检查方法**：

```bash
# 使用 Vercel CLI 检查环境变量
vercel env ls
```

### 步骤 3：验证数据库连接

**测试数据库连接**：

```bash
# 在本地测试生产数据库连接
DATABASE_URL="你的生产数据库URL" npx prisma db pull
```

如果连接失败，检查：

- 数据库 URL 格式是否正确
- 数据库是否允许来自 Vercel IP 的连接
- SSL 设置是否正确（Vercel Postgres 需要 SSL）

### 步骤 4：确认数据库迁移已运行

**检查构建日志**：
在 Vercel 构建日志中应该看到：

```
Running prisma generate
Running prisma migrate deploy
```

**如果迁移未运行**，手动执行：

```bash
# 设置生产数据库 URL
export DATABASE_URL="你的生产数据库连接字符串"

# 运行迁移
npx prisma migrate deploy
```

### 步骤 5：验证 Prisma 客户端生成

**检查构建日志**：
应该看到 `prisma generate` 成功执行。

**手动验证**：

```bash
# 在本地测试
DATABASE_URL="你的生产数据库URL" npx prisma generate
```

### 步骤 6：检查数据库表是否存在

使用 Prisma Studio 或数据库客户端检查：

```bash
DATABASE_URL="你的生产数据库URL" npx prisma studio
```

确认以下表存在：

- `User` 表
- `Todo` 表（如果使用）

## 🐛 常见错误及解决方案

### 错误 1：Prisma Client 未生成

**症状**：

```
Error: @prisma/client did not initialize yet
```

**解决方案**：

1. 确认 `package.json` 中有 `postinstall` 脚本：
   ```json
   "postinstall": "prisma generate"
   ```
2. 确认 `vercel-build` 脚本包含：
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```

### 错误 2：数据库连接失败

**症状**：

```
Error: Can't reach database server
```

**解决方案**：

1. 验证 `DATABASE_URL` 格式：
   ```
   postgres://user:password@host:port/database?sslmode=require
   ```
2. 确认数据库服务正在运行
3. 检查防火墙/IP 白名单设置
4. 对于 Vercel Postgres，确保使用正确的连接字符串

### 错误 3：表不存在

**症状**：

```
Error: relation "User" does not exist
```

**解决方案**：

1. 运行数据库迁移：
   ```bash
   DATABASE_URL="你的数据库URL" npx prisma migrate deploy
   ```
2. 检查迁移文件是否存在：`prisma/migrations/` 目录

### 错误 4：环境变量未设置

**症状**：

```
Error: Environment variable DATABASE_URL is not set
```

**解决方案**：

1. 在 Vercel Dashboard 中添加环境变量
2. 确认变量已添加到 Production、Preview 和 Development 环境
3. 重新部署应用

### 错误 5：Prisma 客户端版本不匹配

**症状**：

```
Error: Prisma Client has not been generated yet
```

**解决方案**：

1. 确保 `@prisma/client` 和 `prisma` 版本匹配
2. 删除 `node_modules` 和 `.next` 目录
3. 重新安装依赖：
   ```bash
   yarn install
   # 或
   npm install
   ```

## 🔧 快速修复命令

### 完整重置和重新部署

```bash
# 1. 确保本地环境正常
yarn install
npx prisma generate
npx prisma migrate deploy

# 2. 推送到 Git（触发 Vercel 自动部署）
git add .
git commit -m "Fix deployment issues"
git push

# 3. 或使用 Vercel CLI 重新部署
vercel --prod
```

### 手动运行迁移

```bash
# 设置生产数据库 URL
export DATABASE_URL="你的生产数据库连接字符串"

# 运行迁移
npx prisma migrate deploy

# 验证表是否存在
npx prisma studio
```

## 📊 诊断检查清单

在报告问题前，请确认：

- [ ] Vercel 构建日志显示构建成功
- [ ] 所有环境变量已正确设置
- [ ] 数据库连接字符串格式正确
- [ ] 数据库迁移已成功运行
- [ ] Prisma 客户端已生成
- [ ] 数据库表已创建
- [ ] 运行时日志中没有错误
- [ ] API 端点可以访问（不是 404）

## 🆘 获取帮助

如果以上步骤都无法解决问题：

1. **收集信息**：

   - Vercel 构建日志
   - Vercel 运行时日志
   - 错误堆栈信息
   - 环境变量列表（隐藏敏感信息）

2. **检查 Vercel 状态**：

   - 访问 https://vercel-status.com
   - 确认 Vercel 服务正常

3. **查看相关文档**：
   - [Vercel 文档](https://vercel.com/docs)
   - [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
   - [Next.js 部署文档](https://nextjs.org/docs/deployment)

## 🔐 安全提示

⚠️ **重要**：

- 不要在日志或错误消息中暴露敏感信息（如数据库密码）
- 使用环境变量存储所有敏感配置
- 定期轮换 API 密钥和数据库密码

---

**最后更新**：2025-11-24
