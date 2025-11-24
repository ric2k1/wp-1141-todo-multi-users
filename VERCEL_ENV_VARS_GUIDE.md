# Vercel 环境变量配置指南

## 📋 环境变量设置建议

### 必需设置的环境

| 环境变量          | Production  |   Preview   | Development | 说明             |
| ----------------- | :---------: | :---------: | :---------: | ---------------- |
| `DATABASE_URL`    | ✅ **必须** | ✅ **建议** |   ⚠️ 可选   | 数据库连接字符串 |
| `NEXTAUTH_SECRET` | ✅ **必须** | ✅ **建议** |   ⚠️ 可选   | NextAuth 密钥    |
| `NEXTAUTH_URL`    | ✅ **必须** | ✅ **建议** |   ⚠️ 可选   | 应用 URL         |
| OAuth 变量        | ✅ **必须** | ✅ **建议** |   ⚠️ 可选   | 如果使用 OAuth   |

## 🎯 详细说明

### Production（生产环境）✅ **必须设置**

**所有环境变量都必须设置**，因为这是用户实际使用的环境。

- `DATABASE_URL` - 生产数据库连接字符串
- `NEXTAUTH_SECRET` - 生产环境密钥
- `NEXTAUTH_URL` - 生产 URL（如 `https://todo-multi-users.vercel.app`）
- OAuth 变量（如果使用）

### Preview（预览环境）✅ **强烈建议设置**

Preview 环境用于：

- Pull Request 的预览部署
- 分支部署测试
- 部署前验证

**建议设置所有变量**，原因：

1. ✅ 可以完整测试功能
2. ✅ 避免预览部署失败
3. ✅ 可以使用相同的数据库（或单独的测试数据库）

**选项 A：使用生产数据库**（简单）

- 设置与 Production 相同的 `DATABASE_URL`
- ⚠️ **注意**：预览环境会写入生产数据库

**选项 B：使用测试数据库**（推荐）

- 创建单独的测试数据库
- 设置不同的 `DATABASE_URL`
- ✅ 更安全，不会影响生产数据

### Development（开发环境）⚠️ **可选**

Development 环境用于：

- Vercel CLI 本地开发（`vercel dev`）
- 本地开发服务器

**通常不需要设置**，因为：

- 大多数开发者使用本地 `.env` 文件
- Vercel CLI 会自动读取本地环境变量

**仅在以下情况需要设置**：

- 使用 `vercel dev` 且不想使用本地 `.env`
- 团队协作需要统一开发环境配置

## 🔧 实际配置建议

### 最小配置（最简单）

**只设置 Production**：

- ✅ 生产环境正常工作
- ⚠️ Preview 部署可能失败（如果代码需要环境变量）

### 推荐配置（平衡）

**设置 Production + Preview**：

- ✅ 生产环境正常工作
- ✅ Preview 部署可以测试
- ✅ 可以安全地测试 PR

### 完整配置（最安全）

**设置所有环境**：

- ✅ 所有环境都正常工作
- ✅ 可以使用不同的数据库
- ✅ 团队协作更方便

## 📝 配置步骤

### 在 Vercel Dashboard 中设置

1. **登录 Vercel Dashboard**

   - https://vercel.com/dashboard
   - 选择您的项目

2. **进入环境变量设置**

   - Settings → Environment Variables

3. **添加环境变量**

   - 点击 "Add New"
   - 输入变量名和值
   - **选择应用环境**：
     - ✅ Production（必须）
     - ✅ Preview（建议）
     - ⚠️ Development（可选）

4. **批量设置**
   - 可以一次添加变量，然后选择多个环境
   - 或分别添加到每个环境

### 使用 Vercel CLI 设置

```bash
# 设置 Production 环境变量
vercel env add DATABASE_URL production

# 设置 Preview 环境变量
vercel env add DATABASE_URL preview

# 设置 Development 环境变量
vercel env add DATABASE_URL development

# 或一次设置多个环境
vercel env add DATABASE_URL production preview
```

## ⚠️ 常见问题

### 问题 1：Preview 部署失败，显示环境变量缺失

**原因**：Preview 环境未设置环境变量

**解决方案**：

1. 在 Vercel Dashboard 中添加环境变量到 Preview 环境
2. 或使用 Vercel CLI：
   ```bash
   vercel env add VARIABLE_NAME preview
   ```

### 问题 2：Preview 环境使用了生产数据库

**原因**：Preview 和 Production 使用相同的 `DATABASE_URL`

**解决方案**：

1. 创建测试数据库
2. 为 Preview 环境设置不同的 `DATABASE_URL`
3. 或接受这个设置（如果测试数据不影响生产）

### 问题 3：Development 环境变量未生效

**原因**：使用 `vercel dev` 时，Vercel 会优先使用本地 `.env` 文件

**解决方案**：

1. 使用本地 `.env` 文件（推荐）
2. 或确保 Vercel Dashboard 中 Development 环境变量已设置

## 🎯 针对您的应用的具体建议

### 必需变量

| 变量                     | Production | Preview | Development |
| ------------------------ | :--------: | :-----: | :---------: |
| `DATABASE_URL`           |     ✅     |   ✅    |     ⚠️      |
| `NEXTAUTH_SECRET`        |     ✅     |   ✅    |     ⚠️      |
| `NEXTAUTH_URL`           |     ✅     |   ✅    |     ⚠️      |
| `GOOGLE_CLIENT_ID`       |     ✅     |   ✅    |     ⚠️      |
| `GOOGLE_CLIENT_SECRET`   |     ✅     |   ✅    |     ⚠️      |
| `GITHUB_CLIENT_ID`       |     ✅     |   ✅    |     ⚠️      |
| `GITHUB_CLIENT_SECRET`   |     ✅     |   ✅    |     ⚠️      |
| `FACEBOOK_CLIENT_ID`     |     ✅     |   ✅    |     ⚠️      |
| `FACEBOOK_CLIENT_SECRET` |     ✅     |   ✅    |     ⚠️      |

### 推荐配置

**最小配置**（快速开始）：

- ✅ Production：所有变量

**推荐配置**（平衡）：

- ✅ Production：所有变量
- ✅ Preview：所有变量（可以使用相同的值）

**完整配置**（最佳实践）：

- ✅ Production：生产数据库和配置
- ✅ Preview：测试数据库和配置
- ⚠️ Development：可选（通常使用本地 `.env`）

## 📊 检查清单

在部署前，确认：

- [ ] Production 环境变量已设置
- [ ] Preview 环境变量已设置（如果使用 Preview 部署）
- [ ] `DATABASE_URL` 在 Production 中正确
- [ ] `NEXTAUTH_URL` 在 Production 中设置为生产 URL
- [ ] OAuth 回调 URL 已配置（如果使用 OAuth）

## 🔐 安全提示

⚠️ **重要**：

- 不要在代码中硬编码环境变量
- 使用 Vercel Dashboard 管理敏感信息
- 定期轮换密钥和密码
- Preview 环境如果使用生产数据库，注意数据安全

---

**总结**：

- **Production**：✅ 必须设置所有变量
- **Preview**：✅ 强烈建议设置（用于测试 PR）
- **Development**：⚠️ 可选（通常使用本地 `.env`）

**对于您的应用**，建议至少设置 **Production + Preview**。
