# Alias-Based Authentication System - Implementation Guide

## 概述 (Overview)

我已經成功實現了您請求的基於別名(alias)的認證系統。現在用戶可以：

1. 使用自定義的別名(alias)作為登入用戶名
2. 背後連接到第三方 OAuth 提供商（Google、GitHub、Facebook）進行驗證
3. 在 session 有效期內直接登入，過期後重新 OAuth 授權

## 主要變更 (Major Changes)

### 1. 數據庫結構修改

原本的 `User` model 已經修改為：

```prisma
model User {
  id          String   @id @default(cuid())
  alias       String   @unique      // 自定義登入用戶名
  email       String?
  oauthName   String?              // OAuth提供商的真實用戶名
  image       String?
  provider    String               // google, github, facebook
  oauthId     String               // OAuth提供商的用戶ID
  isAuthorized Boolean @default(false) // 是否完成OAuth授權
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([provider, oauthId])
}
```

### 2. 新的認證流程

**舊流程問題**：

- 直接比較 OAuth 提供商返回的用戶名與數據庫中的用戶名
- 用戶必須使用 OAuth 提供商的真實用戶名登入

**新流程**：

1. 用戶使用別名登入
2. 系統查找該別名對應的 OAuth 提供商
3. 重定向到 OAuth 提供商進行認證
4. 使用 OAuth ID 和 provider 進行驗證，而不是用戶名
5. 認證成功後，session 中顯示的是用戶的別名

## 部署步驟 (Deployment Steps)

### 1. 應用數據庫遷移

```bash
# 確保您的 .env 文件包含 DATABASE_URL
cd /path/to/todo-multi-users

# 生成並應用數據庫遷移
npx prisma migrate dev --name "implement-alias-based-auth"

# 生成 Prisma 客戶端
npx prisma generate
```

### 2. 重啟應用

```bash
# 重啟開發服務器
npm run dev
# 或
yarn dev
```

## 使用方法 (Usage)

### 1. 添加用戶

```bash
# 添加一個使用Google OAuth的用戶，別名為 "john"
./todo-add-user.sh add john google

# 添加一個使用GitHub OAuth的用戶，別名為 "alice"
./todo-add-user.sh add alice github

# 添加一個使用Facebook OAuth的用戶，別名為 "bob"
./todo-add-user.sh add bob facebook
```

**重要**：執行上述命令後，腳本會：

1. 創建用戶記錄
2. 自動打開瀏覽器進行 OAuth 授權
3. 用戶需要完成 OAuth 授權才能登入

### 2. 查看用戶列表

```bash
./todo-add-user.sh list
```

輸出示例：

```
Alias         Provider      Status        OAuth Name    Created
-----         --------      ------        ----------    -------
john          google        Authorized    John Doe      2024-10-27
alice         github        Pending       N/A           2024-10-27
bob           facebook      Authorized    Bob Smith     2024-10-27
```

### 3. 移除用戶

```bash
./todo-add-user.sh remove john
```

### 4. 用戶登入流程

1. 用戶訪問應用，輸入別名（例如：`john`）
2. 系統自動重定向到對應的 OAuth 提供商（例如：Google）
3. 用戶在 OAuth 提供商完成認證
4. 認證成功後，用戶以別名身份登入到應用

## 認證流程詳解 (Authentication Flow Details)

### 添加用戶時的流程

1. **執行命令**：`./todo-add-user.sh add john google`
2. **創建用戶記錄**：在數據庫中創建 `alias="john"`, `provider="google"`, `isAuthorized=false`
3. **OAuth 授權**：腳本打開瀏覽器，導向 Google OAuth 授權頁面
4. **授權完成**：用戶授權後，系統更新用戶記錄，設置 `oauthId`, `oauthName`, `isAuthorized=true`

### 登入時的流程

1. **輸入別名**：用戶在登入頁面輸入 `john`
2. **查找 provider**：系統查找 `john` 對應的 OAuth 提供商（Google）
3. **OAuth 認證**：重定向到 Google 進行認證
4. **驗證身份**：系統使用 Google 返回的 OAuth ID 與數據庫中的記錄匹配
5. **登入成功**：用戶以別名 `john` 的身份登入

## 重要特性 (Key Features)

### ✅ 已實現的功能

1. **別名登入**：用戶使用自定義別名而非 OAuth 用戶名登入
2. **OAuth 授權**：添加用戶時自動進行 OAuth 授權流程
3. **Session 管理**：Session 有效期內直接登入，過期後重新 OAuth
4. **多提供商支持**：支持 Google、GitHub、Facebook
5. **授權狀態跟蹤**：可查看哪些用戶已完成授權
6. **安全驗證**：基於 OAuth ID 而非用戶名進行身份驗證

### 🔒 安全改進

1. **唯一身份標識**：使用 OAuth provider ID 而非可變的用戶名
2. **授權驗證**：只有完成 OAuth 授權的用戶才能登入
3. **Provider 綁定**：每個別名綁定到特定的 OAuth 提供商

## 故障排除 (Troubleshooting)

### 1. 用戶無法登入

**問題**：用戶輸入別名後顯示 "User not found" 或 "User has not completed OAuth authorization"

**解決方案**：

```bash
# 檢查用戶狀態
./todo-add-user.sh list

# 如果用戶狀態為 "Pending"，需要完成OAuth授權
# 重新運行添加命令來獲取授權URL
./todo-add-user.sh add <alias> <provider>
```

### 2. OAuth 授權失敗

**問題**：在 OAuth 授權過程中出現錯誤

**解決方案**：

1. 確保 `.env` 文件包含正確的 OAuth 客戶端配置
2. 檢查 OAuth 應用的回調 URL 設置
3. 確保應用程序正在運行

### 3. 數據庫遷移問題

**問題**：`npx prisma migrate dev` 失敗

**解決方案**：

```bash
# 確保 .env 文件存在且包含 DATABASE_URL
cat .env | grep DATABASE_URL

# 重置並重新生成數據庫
npx prisma migrate reset
npx prisma migrate dev --name "implement-alias-based-auth"
```

## 與舊系統的差異 (Differences from Old System)

| 項目       | 舊系統                   | 新系統                |
| ---------- | ------------------------ | --------------------- |
| 登入用戶名 | OAuth 提供商的真實用戶名 | 自定義別名            |
| 身份驗證   | 比較 OAuth 用戶名        | 比較 OAuth ID         |
| 用戶添加   | 直接插入數據庫           | 需要完成 OAuth 授權   |
| 用戶管理   | 基於真實用戶名           | 基於別名              |
| 安全性     | 依賴可變的用戶名         | 基於不可變的 OAuth ID |

## 下一步 (Next Steps)

1. **測試系統**：添加幾個測試用戶並驗證完整流程
2. **更新文檔**：根據需要更新其他相關文檔
3. **用戶培訓**：通知用戶新的登入流程
4. **監控**：觀察系統運行情況並處理任何問題

---

**實現完成！** 🎉

您現在擁有一個完全基於別名的認證系統，符合您最初的需求。用戶可以使用自定義的別名登入，背景會透過 OAuth 提供商進行安全驗證。
