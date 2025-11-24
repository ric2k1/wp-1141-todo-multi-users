# Vercel 部署指南 - todo-multi-users

本指南将帮助您将 todo-multi-users 应用部署到 Vercel。

## ✅ 已完成的配置

以下配置已经自动完成：

- ✅ 更新了 `package.json`，添加了 `vercel-build` 脚本
- ✅ 创建了 `vercel.json` 配置文件
- ✅ 配置了 Prisma 自动生成和迁移

## 📋 部署步骤清单

### 阶段一：数据库设置

#### 选项 A：使用 Vercel Postgres（推荐）

1. **登录 Vercel Dashboard**

   - 访问 https://vercel.com/dashboard
   - 使用您的 GitHub/GitLab/Bitbucket 账号登录

2. **创建 Postgres 数据库**

   - 在 Dashboard 中，点击 "Storage" 标签
   - 点击 "Create Database"
   - 选择 "Postgres"
   - 选择区域（建议选择离用户最近的区域，如 `Southeast Asia (Singapore)`）
   - 点击 "Create"
   - 等待数据库创建完成（约 1-2 分钟）

3. **获取数据库连接字符串**
   - 在数据库详情页面，找到 "Connection String" 或 "DATABASE_URL"
   - 点击 "Copy" 复制连接字符串
   - **重要**：保存此连接字符串，稍后需要用到
   - 格式类似：`postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb?sslmode=require`

#### 选项 B：使用外部 PostgreSQL 服务

如果您想使用其他 PostgreSQL 服务（如 Supabase、Neon、Railway）：

1. **创建数据库实例**

   - 在您选择的服务提供商注册并创建数据库
   - 获取连接字符串
   - 确保支持 SSL 连接（Vercel 要求）

2. **记录连接字符串**
   - 保存数据库连接字符串供后续使用

---

### 阶段二：OAuth 提供商配置

在部署应用之前，需要先配置 OAuth 回调 URL。**注意**：您需要先知道应用的 Vercel URL（通常是 `your-app-name.vercel.app`），如果还不知道，可以先部署一次获取 URL，然后再更新 OAuth 配置。

#### 1. Google OAuth 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建项目
3. 进入 "APIs & Services" → "Credentials"
4. 找到或创建 OAuth 2.0 客户端 ID
5. **添加授权重定向 URI**：
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   （将 `your-app-name` 替换为您的实际应用名称）
6. 如果使用自定义域名：
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
7. 点击 "Save"
8. **记录以下信息**：
   - Client ID
   - Client Secret

#### 2. GitHub OAuth 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "OAuth Apps" → "New OAuth App" 或编辑现有应用
3. **更新以下字段**：
   - **Application name**: Todo Multi-Users
   - **Homepage URL**: `https://your-app-name.vercel.app`
   - **Authorization callback URL**: `https://your-app-name.vercel.app/api/auth/callback/github`
4. 点击 "Register application" 或 "Update application"
5. **记录以下信息**：
   - Client ID
   - Client Secret（点击 "Generate a new client secret" 生成）

#### 3. Facebook OAuth 配置

1. 访问 [Facebook Developers](https://developers.facebook.com/)
2. 选择或创建应用
3. 在左侧菜单找到 "Facebook Login" → "Settings"
4. **添加有效的 OAuth 重定向 URI**：
   ```
   https://your-app-name.vercel.app/api/auth/callback/facebook
   ```
5. 点击 "Save Changes"
6. **记录以下信息**：
   - App ID（即 Client ID）
   - App Secret（即 Client Secret，在 "Settings" → "Basic" 中查看）

---

### 阶段三：在 Vercel 部署应用

#### 方法 1：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**

   - 访问 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**

   - 点击 "Add New" → "Project"
   - 如果项目已在 GitHub 上：
     - 选择包含 `todo-multi-users` 的仓库
     - 如果项目在子目录中，设置 **Root Directory** 为：`1141/Examples/todo-multi-users`
   - 如果项目不在 GitHub 上：
     - 先将项目推送到 GitHub
     - 或使用 Vercel CLI（见方法 2）

3. **配置项目设置**

   - **Framework Preset**: Next.js（应该自动检测）
   - **Root Directory**: `1141/Examples/todo-multi-users`（如果项目在子目录中）
   - **Build Command**: `yarn vercel-build`（已在 vercel.json 中配置，通常会自动使用）
   - **Output Directory**: `.next`（默认，无需修改）
   - **Install Command**: `yarn install`（默认）

4. **配置环境变量**

   在 "Environment Variables" 部分，点击 "Add" 添加以下变量：

   | 变量名                   | 值                                 | 说明                                    |
   | ------------------------ | ---------------------------------- | --------------------------------------- |
   | `DATABASE_URL`           | 您的数据库连接字符串               | 从阶段一获取                            |
   | `NEXTAUTH_SECRET`        | 生成的密钥                         | 使用命令生成：`openssl rand -base64 32` |
   | `NEXTAUTH_URL`           | `https://your-app-name.vercel.app` | 部署后会自动更新，但可以先设置          |
   | `GOOGLE_CLIENT_ID`       | 您的 Google Client ID              | 从阶段二获取                            |
   | `GOOGLE_CLIENT_SECRET`   | 您的 Google Client Secret          | 从阶段二获取                            |
   | `GITHUB_CLIENT_ID`       | 您的 GitHub Client ID              | 从阶段二获取                            |
   | `GITHUB_CLIENT_SECRET`   | 您的 GitHub Client Secret          | 从阶段二获取                            |
   | `FACEBOOK_CLIENT_ID`     | 您的 Facebook App ID               | 从阶段二获取                            |
   | `FACEBOOK_CLIENT_SECRET` | 您的 Facebook App Secret           | 从阶段二获取                            |

   **生成 NEXTAUTH_SECRET**：

   ```bash
   openssl rand -base64 32
   ```

   复制生成的字符串作为 `NEXTAUTH_SECRET` 的值。

   **重要**：

   - 确保所有环境变量都添加到 **Production**、**Preview** 和 **Development** 环境
   - 点击每个变量旁边的环境图标来选择应用环境

5. **部署**

   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 2-5 分钟）
   - 构建过程中可以在 "Deployments" 标签查看日志

6. **获取部署 URL**
   - 部署完成后，您会看到应用的 URL
   - 格式：`https://your-app-name.vercel.app`
   - **重要**：如果这是第一次部署，请记下此 URL，然后返回阶段二更新 OAuth 回调 URL

#### 方法 2：通过 Vercel CLI

1. **安装 Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **登录**

   ```bash
   vercel login
   ```

3. **进入项目目录**

   ```bash
   cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
   ```

4. **部署到预览环境**

   ```bash
   vercel
   ```

   按照提示操作，选择项目设置。

5. **配置环境变量**

   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   vercel env add FACEBOOK_CLIENT_ID
   vercel env add FACEBOOK_CLIENT_SECRET
   ```

   每次命令会提示您输入值。

6. **部署到生产环境**
   ```bash
   vercel --prod
   ```

---

### 阶段四：数据库迁移

部署完成后，数据库迁移应该已经在构建过程中自动运行（通过 `vercel-build` 脚本）。

**验证迁移是否成功**：

1. 检查 Vercel 构建日志

   - 在 Vercel Dashboard 中，进入 "Deployments"
   - 点击最新的部署
   - 查看构建日志，应该看到：
     ```
     Running prisma generate
     Running prisma migrate deploy
     ```

2. **如果迁移失败，手动运行**：

   **方法 A：使用 Vercel CLI**

   ```bash
   # 拉取生产环境变量
   vercel env pull .env.production

   # 运行迁移
   npx prisma migrate deploy
   ```

   **方法 B：使用 Prisma Studio**

   ```bash
   # 设置生产数据库 URL
   export DATABASE_URL="您的生产数据库连接字符串"

   # 打开 Prisma Studio
   npx prisma studio
   ```

   在浏览器中打开 Prisma Studio，检查表结构是否正确创建。

---

### 阶段五：验证部署

1. **检查应用是否正常运行**

   - 访问部署的 URL：`https://your-app-name.vercel.app`
   - 应该看到登录页面
   - 如果看到错误页面，检查 Vercel 日志

2. **检查环境变量**

   - 在 Vercel Dashboard → Project Settings → Environment Variables
   - 确认所有变量都已正确设置

3. **测试数据库连接**

   - 应用应该能够连接到数据库
   - 如果看到数据库连接错误，检查 `DATABASE_URL` 是否正确

4. **测试 OAuth 流程**（需要先添加用户）
   - 见阶段六：添加用户

---

### 阶段六：添加用户到生产环境

由于生产环境无法直接运行 `todo-add-user.sh` 脚本，需要使用以下方法：

#### 方法 A：通过 Prisma Studio（推荐）

1. **设置生产数据库 URL**

   ```bash
   export DATABASE_URL="您的生产数据库连接字符串"
   ```

2. **打开 Prisma Studio**

   ```bash
   cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
   npx prisma studio
   ```

3. **创建用户记录**

   - 在浏览器中打开 Prisma Studio（通常是 http://localhost:5555）
   - 点击 "User" 模型
   - 点击 "Add record"
   - 填写以下字段：
     - `alias`: 用户的登录别名（例如：`john`）
     - `provider`: OAuth 提供商（`google`、`github` 或 `facebook`）
     - `oauthId`: 临时值，例如 `temp-123456`（用户首次登录时会更新）
     - `isAuthorized`: `false`（用户完成 OAuth 授权后会变为 `true`）
     - `email`: 可选，留空
     - `oauthName`: 可选，留空
     - `image`: 可选，留空
   - 点击 "Save 1 change"

4. **用户首次登录**
   - 用户访问应用并输入别名
   - 系统会重定向到 OAuth 提供商
   - 完成 OAuth 授权后，系统会自动更新：
     - `oauthId`: 真实的 OAuth ID
     - `oauthName`: OAuth 提供商的用户名
     - `email`: 用户的邮箱（如果有）
     - `image`: 用户的头像 URL（如果有）
     - `isAuthorized`: `true`

#### 方法 B：通过数据库客户端

如果您有数据库管理工具（如 DBeaver、pgAdmin），可以直接连接数据库并插入用户记录：

```sql
INSERT INTO "User" (id, alias, provider, "oauthId", "isAuthorized", "createdAt", "updatedAt")
VALUES (
  'clxxxxxxxxxxxxx',  -- 生成一个 cuid，可以使用在线工具或 Prisma 生成
  'john',
  'google',
  'temp-123456',
  false,
  NOW(),
  NOW()
);
```

#### 方法 C：创建管理 API（高级）

可以创建一个受保护的管理 API 路由来添加用户，但这需要额外的认证机制。

---

## 🔧 故障排除

### 构建失败

**问题**：部署时构建失败

**解决方案**：

1. 检查 Vercel 构建日志中的错误信息
2. 确认所有环境变量都已设置
3. 检查 `package.json` 中的脚本是否正确
4. 确认 Prisma schema 文件存在且格式正确

### 数据库连接错误

**问题**：应用无法连接到数据库

**解决方案**：

1. 验证 `DATABASE_URL` 格式正确
2. 确认数据库允许来自 Vercel IP 的连接（Vercel Postgres 自动允许）
3. 检查 SSL 设置（Vercel 要求 SSL）
4. 确认数据库服务正在运行

### OAuth 错误

**问题**：OAuth 登录失败或重定向错误

**解决方案**：

1. 验证所有 OAuth 回调 URL 都已正确配置
2. 检查 `NEXTAUTH_URL` 环境变量是否设置为完整的生产 URL（包括 `https://`）
3. 确认 OAuth Client ID 和 Secret 正确
4. 检查 OAuth 提供商的控制台是否有错误日志

### 迁移失败

**问题**：数据库迁移失败

**解决方案**：

1. 检查数据库连接是否正常
2. 确认数据库有创建表的权限
3. 查看 Prisma 迁移文件是否存在
4. 手动运行迁移：`npx prisma migrate deploy`

### 用户无法登录

**问题**：用户输入别名后无法登录

**解决方案**：

1. 确认用户记录已在数据库中创建
2. 检查用户的 `isAuthorized` 状态
3. 确认用户使用的 OAuth 提供商与数据库中的 `provider` 字段匹配
4. 查看应用日志中的错误信息

---

## 📝 后续步骤

### 1. 设置自定义域名（可选）

1. 在 Vercel Dashboard → Project Settings → Domains
2. 添加您的自定义域名
3. 按照提示配置 DNS 记录
4. **重要**：更新所有 OAuth 回调 URL 以使用新域名

### 2. 设置自动部署

- 连接 Git 仓库后，Vercel 会自动部署每次推送到主分支
- 可以在 Project Settings → Git 中配置分支保护规则

### 3. 监控和日志

- 使用 Vercel Dashboard 的 "Logs" 标签查看实时日志
- 启用 Vercel Analytics 监控性能

### 4. 备份策略

- 如果使用 Vercel Postgres，定期检查备份设置
- 考虑导出数据库快照作为额外备份

---

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js 文档](https://next-auth.js.org/)

---

## ✅ 部署检查清单

在完成部署后，请确认：

- [ ] 应用可以正常访问
- [ ] 数据库连接正常
- [ ] 所有环境变量已正确设置
- [ ] OAuth 回调 URL 已配置
- [ ] 数据库迁移已成功运行
- [ ] 可以创建测试用户
- [ ] OAuth 登录流程正常工作
- [ ] 可以创建和管理 todos

---

**祝您部署顺利！** 🚀

如有问题，请查看 Vercel 日志或联系技术支持。
