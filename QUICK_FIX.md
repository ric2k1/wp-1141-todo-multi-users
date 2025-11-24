# 快速解决方案：API 返回 500 错误

## 当前情况

- ✅ `list` 命令正常工作 → 数据库连接正常
- ❌ `add` 命令失败 → Vercel API 返回 500 错误

## 解决方案

### 方案 1：使用本地开发服务器（推荐用于测试）

如果您想快速测试添加用户功能：

1. **启动本地开发服务器**：

   ```bash
   # 确保 .env 文件包含正确的 DATABASE_URL
   yarn dev
   # 或
   npm run dev
   ```

2. **在另一个终端运行脚本**：

   ```bash
   # 脚本会自动使用 http://localhost:3000
   ./todo-add-user.sh add ric google
   ```

3. **完成后停止开发服务器**（Ctrl+C）

### 方案 2：直接操作数据库（绕过 API）

如果 Vercel API 有问题，可以直接操作数据库：

#### 使用 Prisma Studio（图形界面）

```bash
# 确保 DATABASE_URL 指向生产数据库
export DATABASE_URL="你的生产数据库连接字符串"

# 打开 Prisma Studio
npx prisma studio
```

然后在浏览器中：

1. 点击 "User" 模型
2. 点击 "Add record"
3. 填写：
   - `alias`: `ric`
   - `provider`: `google`
   - `oauthId`: `temp-123456`（临时值）
   - `isAuthorized`: `false`
4. 保存

#### 完成 OAuth 授权

访问以下 URL（替换为您的实际值）：

```
https://todo-multi-users.vercel.app/auth/start?provider=google&callbackUrl=https://todo-multi-users.vercel.app/api/auth/callback-setup?alias=ric
```

### 方案 3：诊断 Vercel API 问题

1. **查看 Vercel 日志**：

   - 登录 https://vercel.com/dashboard
   - 进入项目 → Deployments → 最新部署
   - 点击 "Runtime Logs" 或 "Function Logs"
   - 查找错误堆栈

2. **常见问题**：

   - **数据库迁移未运行**：检查构建日志中是否有 `prisma migrate deploy`
   - **环境变量缺失**：确认 `DATABASE_URL` 在 Vercel 中已设置
   - **Prisma 客户端未生成**：确认 `vercel-build` 脚本包含 `prisma generate`

3. **手动运行迁移**（如果需要）：
   ```bash
   DATABASE_URL="你的生产数据库URL" npx prisma migrate deploy
   ```

## 推荐工作流程

对于日常使用，推荐：

1. **本地开发/测试**：使用方案 1（本地开发服务器）
2. **生产环境管理**：使用方案 2（Prisma Studio 或直接 SQL）
3. **故障排除**：使用方案 3（查看 Vercel 日志）

## 快速命令参考

```bash
# 启动本地开发服务器
yarn dev

# 在另一个终端添加用户（使用本地服务器）
./todo-add-user.sh add ric google

# 或直接操作数据库
export DATABASE_URL="生产数据库URL"
npx prisma studio
```
