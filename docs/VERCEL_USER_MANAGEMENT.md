# 在 Vercel 部署环境中管理用户

由于 Vercel 是无服务器平台，无法直接在部署环境中执行 shell 脚本。以下是几种在 Vercel 部署后添加和管理用户的方法。

## 方法一：在本地运行脚本（连接到生产数据库）⭐ 推荐

这是最简单的方法，使用现有的 `todo-add-user.sh` 脚本，但连接到生产数据库。

### 步骤：

1. **获取生产数据库连接字符串**

   - 登录 Vercel Dashboard
   - 进入您的项目 → Settings → Environment Variables
   - 找到 `DATABASE_URL` 的值并复制

2. **在本地项目目录中创建临时环境变量文件**

   ```bash
   cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users

   # 创建临时 .env 文件（不要提交到 git）
   echo "DATABASE_URL=你的生产数据库连接字符串" > .env.production
   echo "NEXTAUTH_URL=https://your-app-name.vercel.app" >> .env.production
   ```

3. **使用生产环境变量运行脚本**

   **方法 A：脚本会自动读取 .env 文件（推荐）**

   如果您的 `.env` 文件已经包含生产数据库连接字符串，直接运行：

   ```bash
   ./todo-add-user.sh list
   ```

   **方法 B：使用临时环境变量文件**

   ```bash
   # 加载生产环境变量并运行脚本（分两行执行）
   export $(grep -v '^#' .env.production | xargs)
   ./todo-add-user.sh add john google
   ```

   或者使用 `source` 命令：

   ```bash
   # 使用 source 加载环境变量（会过滤注释）
   set -a
   source <(grep -v '^#' .env.production | grep -v '^$')
   set +a
   ./todo-add-user.sh list
   ```

   **方法 C：直接在命令行设置环境变量（最简单）**

   ```bash
   DATABASE_URL="你的生产数据库连接字符串" \
   NEXTAUTH_URL="https://your-app-name.vercel.app" \
   ./todo-add-user.sh add john google
   ```

4. **其他命令**

   ```bash
   # 列出所有用户
   DATABASE_URL="你的生产数据库连接字符串" \
   NEXTAUTH_URL="https://your-app-name.vercel.app" \
   ./todo-add-user.sh list

   # 删除用户
   DATABASE_URL="你的生产数据库连接字符串" \
   NEXTAUTH_URL="https://your-app-name.vercel.app" \
   ./todo-add-user.sh remove john
   ```

5. **清理临时文件**

   ```bash
   rm .env.production  # 删除临时环境变量文件
   ```

## 方法二：直接调用 API 端点

您可以直接使用 `curl` 或任何 HTTP 客户端调用 API。

### 添加用户

```bash
curl -X POST https://your-app-name.vercel.app/api/auth/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "john",
    "provider": "google"
  }'
```

响应示例：

```json
{
  "message": "User created, authorization required",
  "authUrl": "https://your-app-name.vercel.app/auth/start?provider=google&callbackUrl=...",
  "userId": "clxxxxxxxxxxxxx"
}
```

然后打开返回的 `authUrl` 完成 OAuth 授权。

### 列出用户（需要创建 API 端点）

目前没有列出用户的 API 端点，但可以使用方法一或方法三。

## 方法三：使用 Prisma Studio（图形界面）

这是最直观的方法，适合不熟悉命令行的用户。

### 步骤：

1. **设置生产数据库环境变量**

   ```bash
   export DATABASE_URL="你的生产数据库连接字符串"
   ```

2. **打开 Prisma Studio**

   ```bash
   cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
   npx prisma studio
   ```

3. **创建用户记录**

   - 浏览器会自动打开 Prisma Studio（通常是 http://localhost:5555）
   - 点击 "User" 模型
   - 点击 "Add record"
   - 填写字段：
     - `alias`: 用户别名（例如：`john`）
     - `provider`: OAuth 提供商（`google`、`github` 或 `facebook`）
     - `oauthId`: 临时值，例如 `temp-123456`（用户首次登录时会更新）
     - `isAuthorized`: `false`
     - `email`: 留空（可选）
     - `oauthName`: 留空（可选）
     - `image`: 留空（可选）
   - 点击 "Save 1 change"

4. **完成 OAuth 授权**
   - 访问：`https://your-app-name.vercel.app/auth/start?provider=google&callbackUrl=https://your-app-name.vercel.app/api/auth/callback-setup?alias=john`
   - 将 `john` 替换为您创建的用户别名
   - 将 `google` 替换为相应的提供商
   - 完成 OAuth 授权流程

## 方法四：创建管理 API 端点（高级）

如果您需要更自动化的管理方式，可以创建一个受保护的管理 API。但这需要额外的认证机制（如 API Key 或管理员认证）。

### 示例：创建管理 API

创建 `src/app/api/admin/users/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 简单的 API Key 验证（生产环境应使用更安全的方法）
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: NextRequest) {
  // 验证 API Key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, alias, provider } = await request.json();

    if (action === "add") {
      // 调用现有的授权逻辑
      // ... 类似 authorize API 的实现
    } else if (action === "list") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ users });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

然后在 Vercel 环境变量中添加 `ADMIN_API_KEY`，并使用它来调用 API。

## 推荐工作流程

对于大多数用户，推荐使用**方法一**（本地运行脚本）：

1. ✅ 使用现有的脚本，无需修改代码
2. ✅ 功能完整（添加、删除、列出）
3. ✅ 自动打开浏览器进行 OAuth 授权
4. ✅ 有清晰的错误提示和状态显示

### 快速命令参考

```bash
# 添加用户（替换为您的实际值）
DATABASE_URL="postgres://..." \
NEXTAUTH_URL="https://your-app.vercel.app" \
./todo-add-user.sh add john google

# 列出用户
DATABASE_URL="postgres://..." \
NEXTAUTH_URL="https://your-app.vercel.app" \
./todo-add-user.sh list

# 删除用户
DATABASE_URL="postgres://..." \
NEXTAUTH_URL="https://your-app.vercel.app" \
./todo-add-user.sh remove john
```

## 安全提示

⚠️ **重要**：

- 不要将生产数据库连接字符串提交到 Git
- 使用完临时环境变量文件后立即删除
- 如果使用方法四，确保 API Key 足够复杂且保密
- 定期检查并清理未授权的用户记录

## 故障排除

### 🔧 快速诊断工具

运行诊断脚本快速检查常见问题：

```bash
./diagnose-vercel.sh
```

这将检查：

- 环境变量配置
- Prisma 配置
- 数据库连接
- 数据库迁移状态
- 构建配置

详细诊断指南请查看：`VERCEL_ERROR_DIAGNOSIS.md`

### 问题：API 返回 "Internal server error" (500)

**症状**：运行脚本时看到 `Error: Internal server error`

**可能原因**：

1. 数据库连接问题
2. Prisma 客户端未正确初始化
3. 数据库表不存在（迁移未运行）
4. 环境变量未正确设置

**解决方案**：

1. **查看 Vercel 部署日志**：

   - 登录 Vercel Dashboard
   - 进入您的项目 → Deployments
   - 点击最新的部署
   - 查看 "Runtime Logs" 或 "Function Logs"
   - 查找错误堆栈信息

2. **检查数据库连接**：

   ```bash
   # 在本地测试数据库连接
   DATABASE_URL="你的生产数据库URL" npx prisma db pull
   ```

3. **确认数据库迁移已运行**：

   - 在 Vercel 构建日志中应该看到 `prisma migrate deploy`
   - 如果没有，检查 `vercel-build` 脚本是否正确配置

4. **检查环境变量**：

   - 在 Vercel Dashboard → Settings → Environment Variables
   - 确认 `DATABASE_URL` 已设置且格式正确
   - 确认所有必需的环境变量都已设置

5. **手动运行数据库迁移**（如果需要）：
   ```bash
   DATABASE_URL="你的生产数据库URL" npx prisma migrate deploy
   ```

### 问题：脚本无法连接到数据库

**解决方案**：

- 确认 `DATABASE_URL` 格式正确
- 检查数据库是否允许来自您 IP 的连接（某些数据库服务需要配置 IP 白名单）
- 确认 SSL 设置正确（Vercel Postgres 需要 SSL）

### 问题：OAuth 授权失败

**解决方案**：

- 确认 `NEXTAUTH_URL` 设置为完整的生产 URL（包括 `https://`）
- 检查 OAuth 回调 URL 是否已在提供商处配置
- 确认 OAuth Client ID 和 Secret 正确

### 问题：用户创建成功但无法登录

**解决方案**：

- 确认用户已完成 OAuth 授权（`isAuthorized` 应为 `true`）
- 检查用户使用的 OAuth 提供商是否与数据库中的 `provider` 字段匹配
- 查看应用日志中的错误信息

---

**需要帮助？** 查看主部署指南：`DEPLOYMENT_GUIDE.md`
