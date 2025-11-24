# OAuth 本地开发问题排查指南

## 问题：localhost 登录显示"认证失败，请重试"

### 可能原因

1. **Google OAuth 重定向 URI 未配置 localhost**（最常见）
2. **NEXTAUTH_URL 环境变量配置错误**
3. **OAuth 客户端 ID/Secret 配置问题**

---

## 解决方案

### 步骤 1：检查 Google Cloud Console 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入 **APIs & Services** → **Credentials**
4. 找到你的 OAuth 2.0 客户端 ID（用于 Vercel 部署的那个）
5. 点击编辑（铅笔图标）

6. **检查"已授权的重定向 URI"列表**，确保包含以下两个 URI：

   ```
   http://localhost:3000/api/auth/callback/google
   https://your-vercel-domain.com/api/auth/callback/google
   ```

7. 如果缺少 localhost 的 URI，点击 **+ 添加 URI**，添加：

   ```
   http://localhost:3000/api/auth/callback/google
   ```

8. 点击 **保存**

### 步骤 2：检查本地环境变量

确保你的 `.env` 文件包含以下配置：

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**重要提示**：

- `NEXTAUTH_URL` 必须设置为 `http://localhost:3000`（不是 https）
- 确保 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 与 Google Cloud Console 中的一致

### 步骤 3：重启开发服务器

修改环境变量或 Google Console 配置后，需要重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
yarn dev
```

### 步骤 4：清除浏览器缓存和 Cookie

1. 清除浏览器缓存
2. 清除 localhost:3000 的 Cookie
3. 或者使用无痕模式重新测试

---

## 验证配置

### 检查 1：确认重定向 URI 配置

在 Google Cloud Console 中，你的 OAuth 客户端应该有以下重定向 URI：

- ✅ `http://localhost:3000/api/auth/callback/google`（开发环境）
- ✅ `https://your-vercel-domain.com/api/auth/callback/google`（生产环境）

### 检查 2：确认环境变量

运行以下命令检查环境变量是否正确加载：

```bash
# 在项目根目录
cat .env | grep -E "NEXTAUTH_URL|GOOGLE_CLIENT"
```

应该看到：

```
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-actual-client-id"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

### 检查 3：查看服务器日志

启动开发服务器后，尝试登录，查看终端输出的错误信息：

```bash
yarn dev
# 然后尝试登录，观察终端输出
```

常见的错误信息：

- `redirect_uri_mismatch` → 重定向 URI 未配置
- `invalid_client` → 客户端 ID/Secret 错误
- `access_denied` → 用户拒绝了授权

---

## 常见错误对照表

| 错误信息                | 原因                                  | 解决方案                                                                |
| ----------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `redirect_uri_mismatch` | 重定向 URI 未在 Google Console 中配置 | 在 Google Console 添加 `http://localhost:3000/api/auth/callback/google` |
| `invalid_client`        | 客户端 ID 或 Secret 错误              | 检查 `.env` 文件中的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`       |
| `access_denied`         | 用户拒绝了 OAuth 授权                 | 重新登录，确保点击"允许"                                                |
| `Configuration`         | NextAuth 配置错误                     | 检查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET`                                |
| `Verification`          | OAuth 验证失败                        | 通常是重定向 URI 或环境变量问题                                         |

---

## 如果问题仍然存在

### 选项 1：创建单独的开发环境 OAuth 应用

如果不想修改生产环境的 OAuth 配置，可以创建一个新的 OAuth 客户端专门用于开发：

1. 在 Google Cloud Console 创建新的 OAuth 2.0 客户端 ID
2. 只添加 localhost 的重定向 URI
3. 在本地 `.env` 文件中使用新的客户端 ID 和 Secret
4. 生产环境继续使用原来的客户端 ID 和 Secret

### 选项 2：检查数据库中的用户记录

确保用户 "ric" 在数据库中存在且已授权：

```bash
# 使用 Prisma Studio 查看
yarn db:studio

# 或者使用脚本查看
./todo-add-user.sh list
```

确保：

- 用户存在
- `provider` 字段为 `google`
- `isAuthorized` 字段为 `true`

### 选项 3：查看详细错误日志

在 `src/lib/auth.ts` 的 `signIn` callback 中添加更多日志：

```typescript
async signIn({ user, account }) {
  console.log('SignIn callback:', { user, account })
  // ... 现有代码
}
```

---

## 快速检查清单

- [ ] Google Cloud Console 中已添加 `http://localhost:3000/api/auth/callback/google` 重定向 URI
- [ ] `.env` 文件中 `NEXTAUTH_URL="http://localhost:3000"`
- [ ] `.env` 文件中 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 正确
- [ ] 已重启开发服务器
- [ ] 已清除浏览器缓存和 Cookie
- [ ] 数据库中存在用户 "ric" 且 `isAuthorized=true`

完成以上所有步骤后，问题应该就能解决了。
