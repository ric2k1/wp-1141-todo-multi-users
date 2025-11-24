# Vercel 部署快速检查清单

## ✅ 代码配置（已完成）

- [x] 更新 `package.json` 添加 `vercel-build` 脚本
- [x] 创建 `vercel.json` 配置文件
- [x] 配置 Prisma 自动生成和迁移

## 📋 部署前准备

### 1. 数据库设置

- [ ] 在 Vercel Dashboard 创建 Postgres 数据库（或使用外部服务）
- [ ] 复制数据库连接字符串（`DATABASE_URL`）

### 2. OAuth 配置准备

- [ ] Google OAuth：准备 Client ID 和 Secret
- [ ] GitHub OAuth：准备 Client ID 和 Secret
- [ ] Facebook OAuth：准备 App ID 和 Secret

### 3. 生成密钥

- [ ] 运行 `openssl rand -base64 32` 生成 `NEXTAUTH_SECRET`

## 🚀 Vercel 部署步骤

### 步骤 1：导入项目

- [ ] 登录 Vercel Dashboard
- [ ] 点击 "Add New" → "Project"
- [ ] 选择包含 `todo-multi-users` 的 Git 仓库
- [ ] 设置 Root Directory（如需要）：`1141/Examples/todo-multi-users`

### 步骤 2：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

- [ ] `DATABASE_URL` = 数据库连接字符串
- [ ] `NEXTAUTH_SECRET` = 生成的密钥
- [ ] `NEXTAUTH_URL` = `https://your-app-name.vercel.app`（部署后更新）
- [ ] `GOOGLE_CLIENT_ID` = Google Client ID
- [ ] `GOOGLE_CLIENT_SECRET` = Google Client Secret
- [ ] `GITHUB_CLIENT_ID` = GitHub Client ID
- [ ] `GITHUB_CLIENT_SECRET` = GitHub Client Secret
- [ ] `FACEBOOK_CLIENT_ID` = Facebook App ID
- [ ] `FACEBOOK_CLIENT_SECRET` = Facebook App Secret

### 步骤 3：首次部署

- [ ] 点击 "Deploy" 按钮
- [ ] 等待构建完成
- [ ] 记录部署 URL：`https://your-app-name.vercel.app`

### 步骤 4：更新 OAuth 回调 URL

使用步骤 3 中获得的 URL，更新所有 OAuth 提供商：

- [ ] Google：添加 `https://your-app-name.vercel.app/api/auth/callback/google`
- [ ] GitHub：更新为 `https://your-app-name.vercel.app/api/auth/callback/github`
- [ ] Facebook：添加 `https://your-app-name.vercel.app/api/auth/callback/facebook`

### 步骤 5：更新 NEXTAUTH_URL

- [ ] 在 Vercel 环境变量中更新 `NEXTAUTH_URL` 为实际部署 URL
- [ ] 重新部署（或等待自动部署）

### 步骤 6：验证数据库迁移

- [ ] 检查 Vercel 构建日志，确认迁移成功
- [ ] 或使用 Prisma Studio 连接生产数据库验证表结构

### 步骤 7：添加测试用户

- [ ] 使用 Prisma Studio 或数据库客户端创建测试用户
- [ ] 设置 `alias`、`provider`、`oauthId`（临时值）、`isAuthorized=false`

### 步骤 8：测试部署

- [ ] 访问应用 URL，确认登录页面正常显示
- [ ] 使用测试用户登录，完成 OAuth 授权
- [ ] 测试创建和管理 todos
- [ ] 验证所有功能正常

## 🔍 故障排除检查

如果遇到问题，检查：

- [ ] 所有环境变量是否已正确设置
- [ ] 数据库连接字符串格式是否正确
- [ ] OAuth 回调 URL 是否已更新
- [ ] `NEXTAUTH_URL` 是否设置为完整的 HTTPS URL
- [ ] 构建日志中是否有错误信息
- [ ] 数据库迁移是否成功运行

## 📝 环境变量模板

```env
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## 📚 详细文档

查看 `DEPLOYMENT_GUIDE.md` 获取完整的部署说明和故障排除指南。
