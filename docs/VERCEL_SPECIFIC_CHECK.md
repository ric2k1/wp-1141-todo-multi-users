# Vercel 部署特定问题检查清单

## ✅ 本地诊断结果

根据诊断脚本，您的本地配置完全正常：

- ✓ 数据库连接成功
- ✓ 所有表存在且结构正确
- ✓ 环境变量已设置
- ✓ 构建配置正确

如果 Vercel 部署仍然返回 500 错误，请按照以下步骤检查：

## 🔍 Vercel 特定检查步骤

### 步骤 1：验证 Vercel 环境变量

1. **登录 Vercel Dashboard**

   - https://vercel.com/dashboard
   - 选择您的项目

2. **检查环境变量**

   - Settings → Environment Variables
   - **必需**：Production 环境必须设置所有变量
   - **建议**：Preview 环境也设置所有变量（用于测试 PR）
   - **可选**：Development 环境（通常使用本地 `.env`）

   必须设置的变量：

   - `DATABASE_URL` - **必须与本地 .env 中的值相同**
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` - 应该是 `https://todo-multi-users.vercel.app`
   - OAuth 提供商变量（如果使用）

   📖 详细说明请查看：`VERCEL_ENV_VARS_GUIDE.md`

3. **验证 DATABASE_URL**
   ```bash
   # 在 Vercel Dashboard 中，DATABASE_URL 应该与本地 .env 文件中的值完全相同
   # 格式：postgres://user:password@host:port/database?sslmode=require
   ```

### 步骤 2：检查构建日志

1. **查看最新部署**

   - Deployments → 最新部署
   - 点击部署查看详情

2. **检查构建日志**
   应该看到以下步骤：

   ```
   Running "yarn install"
   Running "prisma generate"
   Running "prisma migrate deploy"
   Running "next build"
   ```

3. **查找错误**
   - 如果 `prisma generate` 失败 → Prisma 客户端生成问题
   - 如果 `prisma migrate deploy` 失败 → 数据库迁移问题
   - 如果 `next build` 失败 → 构建问题

### 步骤 3：检查运行时日志

1. **查看 Function Logs**

   - 在部署详情页面
   - 点击 "Runtime Logs" 或 "Function Logs"

2. **查找错误信息**

   - 查找 Prisma 相关错误
   - 查找数据库连接错误
   - 查找环境变量缺失错误

3. **常见错误模式**：

   ```
   Error: Can't reach database server
   → DATABASE_URL 错误或数据库不可访问

   Error: Prisma Client has not been generated
   → Prisma 客户端未生成

   Error: relation "User" does not exist
   → 数据库迁移未运行

   Error: Environment variable DATABASE_URL is not set
   → 环境变量未设置
   ```

### 步骤 4：验证数据库可访问性

**重要**：Vercel 的服务器需要能够访问您的数据库。

1. **检查数据库 IP 白名单**

   - 如果数据库有 IP 白名单，需要添加 Vercel 的 IP 范围
   - Vercel Postgres 自动允许，无需配置

2. **测试从外部连接**
   ```bash
   # 使用 Vercel 的 DATABASE_URL 测试连接
   DATABASE_URL="从Vercel复制的URL" npx prisma db pull
   ```

### 步骤 5：重新部署

如果环境变量已更新，需要重新部署：

1. **通过 Git 推送触发**

   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

2. **或使用 Vercel CLI**
   ```bash
   vercel --prod
   ```

## 🐛 常见 Vercel 特定问题

### 问题 1：环境变量未同步

**症状**：本地工作正常，Vercel 返回 500

**解决方案**：

1. 确认环境变量在 Vercel Dashboard 中已设置
2. 确认变量已添加到所有环境（Production, Preview, Development）
3. 重新部署应用

### 问题 2：Prisma 客户端未生成

**症状**：构建日志中没有 `prisma generate`

**解决方案**：

1. 确认 `package.json` 中有：
   ```json
   "postinstall": "prisma generate"
   ```
2. 确认 `vercel-build` 脚本包含：
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```

### 问题 3：数据库迁移在构建时失败

**症状**：构建日志显示迁移失败

**解决方案**：

1. 检查 `DATABASE_URL` 在构建时是否可访问
2. 确认数据库服务正在运行
3. 检查数据库连接字符串格式

### 问题 4：运行时环境变量未加载

**症状**：构建成功但运行时错误

**解决方案**：

1. 确认环境变量已添加到 **Runtime** 环境（不仅仅是 Build）
2. 在 Vercel Dashboard 中，环境变量应该应用到所有环境

## 🔧 快速修复命令

### 验证 Vercel 环境变量

```bash
# 使用 Vercel CLI 列出环境变量
vercel env ls

# 拉取环境变量到本地（用于测试）
vercel env pull .env.vercel
```

### 手动触发重新部署

```bash
# 方法 1：空提交触发
git commit --allow-empty -m "Redeploy"
git push

# 方法 2：使用 Vercel CLI
vercel --prod
```

## 📊 Vercel vs 本地差异检查清单

| 项目          | 本地 | Vercel | 检查方法                                            |
| ------------- | ---- | ------ | --------------------------------------------------- |
| DATABASE_URL  | ✅   | ❓     | Vercel Dashboard → Settings → Environment Variables |
| NEXTAUTH_URL  | ✅   | ❓     | 应该是 `https://todo-multi-users.vercel.app`        |
| Prisma Client | ✅   | ❓     | 检查构建日志中的 `prisma generate`                  |
| 数据库迁移    | ✅   | ❓     | 检查构建日志中的 `prisma migrate deploy`            |
| 数据库连接    | ✅   | ❓     | 查看运行时日志                                      |

## 🆘 如果问题仍然存在

1. **收集信息**：

   - Vercel 构建日志（完整）
   - Vercel 运行时日志（完整）
   - 环境变量列表（隐藏敏感信息）
   - 错误堆栈信息

2. **检查 Vercel 状态**：

   - https://vercel-status.com
   - 确认 Vercel 服务正常

3. **联系支持**：
   - 提供完整的日志和错误信息
   - 说明本地环境工作正常

---

**最后更新**：2025-11-24
