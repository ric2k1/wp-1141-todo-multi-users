# OAuth 問題排查指南

## ⚠️ 緊急問題：redirect_uri is not associated with this application

### 錯誤訊息

當您嘗試使用 Google 或 GitHub OAuth 登入時，可能會看到以下錯誤：

```
The redirect_uri is not associated with this application.
The application might be misconfigured or could be trying to redirect you to a website you weren't expecting.
```

### 問題原因

這個錯誤表示 OAuth 提供商（Google 或 GitHub）的應用配置中**沒有包含您當前使用的 redirect URI**。

NextAuth 會自動生成以下格式的 redirect URI：

- Google: `{NEXTAUTH_URL}/api/auth/callback/google`
- GitHub: `{NEXTAUTH_URL}/api/auth/callback/github`

### 快速修復步驟

#### 🔧 步驟 1：確認您的環境

首先，確認您是在**本地開發環境**還是**生產環境**：

**本地開發環境**：

- URL 通常是 `http://localhost:3000`
- 需要配置的 redirect URI：`http://localhost:3000/api/auth/callback/google` 和 `http://localhost:3000/api/auth/callback/github`

**生產環境（Vercel）**：

- URL 通常是 `https://your-app-name.vercel.app`
- 需要配置的 redirect URI：`https://your-app-name.vercel.app/api/auth/callback/google` 和 `https://your-app-name.vercel.app/api/auth/callback/github`

#### 🔧 步驟 2：修復 Google OAuth 配置

1. **訪問 Google Cloud Console**

   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 選擇您的專案

2. **進入 OAuth 設定**

   - 點擊左側選單 **APIs & Services** → **Credentials**
   - 找到您的 **OAuth 2.0 客戶端 ID**（用於此應用的那個）
   - 點擊客戶端 ID 右側的**編輯圖示**（鉛筆圖示）

3. **添加 Redirect URI**

   - 在「**已授權的重新導向 URI**」區塊中，點擊 **+ 新增 URI**
   - 根據您的環境，添加以下 URI：

   **本地開發環境**：

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **生產環境**：

   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

   （將 `your-app-name` 替換為您的實際 Vercel 應用名稱）

   **同時支援本地和生產環境**（推薦）：

   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

4. **儲存設定**
   - 點擊底部的 **儲存** 按鈕
   - 等待幾秒鐘讓設定生效

#### 🔧 步驟 3：修復 GitHub OAuth 配置

1. **訪問 GitHub Developer Settings**

   - 前往 [GitHub Developer Settings](https://github.com/settings/developers)
   - 點擊 **OAuth Apps**

2. **編輯 OAuth App**

   - 找到您的 OAuth App（或點擊 **New OAuth App** 建立新的）
   - 點擊應用名稱進入編輯頁面

3. **更新 Callback URL**

   - 找到 **Authorization callback URL** 欄位
   - 根據您的環境，設置為：

   **本地開發環境**：

   ```
   http://localhost:3000/api/auth/callback/github
   ```

   **生產環境**：

   ```
   https://your-app-name.vercel.app/api/auth/callback/github
   ```

   （將 `your-app-name` 替換為您的實際 Vercel 應用名稱）

   **注意**：GitHub OAuth App 只支援**單一** callback URL。如果您需要在本地和生產環境之間切換，有兩個選擇：

   - **選項 A**：建立兩個 OAuth App（一個用於開發，一個用於生產）
   - **選項 B**：在切換環境時手動更新 callback URL

4. **更新 Homepage URL**（可選但建議）

   - **Homepage URL** 也應該更新為對應的環境 URL：
     - 本地：`http://localhost:3000`
     - 生產：`https://your-app-name.vercel.app`

5. **儲存設定**
   - 點擊 **Update application** 按鈕
   - 設定會立即生效

#### 🔧 步驟 4：驗證環境變數

確保您的環境變數正確設置：

**本地開發環境**（`.env` 檔案）：

```env
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**生產環境**（Vercel Dashboard → Settings → Environment Variables）：

```env
NEXTAUTH_URL="https://your-app-name.vercel.app"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**重要提示**：

- `NEXTAUTH_URL` 必須與您在 OAuth 提供商中配置的 redirect URI 的基礎 URL 完全匹配
- 本地環境使用 `http://`，生產環境使用 `https://`
- URL 不應該有尾隨斜線（`/`）

#### 🔧 步驟 5：清除瀏覽器狀態並重新測試

1. **清除 Cookie 和快取**

   **方法 A：使用開發者工具清除特定網站的 Cookie（推薦）**

   1. 打開 Chrome 開發者工具：

      - 按 `F12` 鍵（Windows/Linux）
      - 或按 `Cmd+Option+I`（Mac）
      - 或右鍵點擊頁面 → 選擇「檢查」

   2. 前往 **Application** 標籤：

      - 在開發者工具頂部點擊 **Application**（或「應用程式」）

   3. 清除 Cookie：

      - 在左側選單中展開 **Cookies**
      - 選擇 `http://localhost:3000`（本地環境）或您的生產域名
      - 右鍵點擊 → 選擇 **Clear**（清除）
      - 或選中後按 `Delete` 鍵

   4. 清除快取（可選）：
      - 在左側選單中找到 **Cache Storage**
      - 展開並刪除相關的快取項目

   **方法 B：通過 Chrome 設置清除所有 Cookie 和快取**

   1. 打開 Chrome 設置：

      - 點擊右上角三點選單 → **設置**
      - 或訪問 `chrome://settings/`

   2. 進入隱私和安全：

      - 點擊左側 **隱私和安全**
      - 點擊 **清除瀏覽數據**

   3. 選擇清除內容：

      - **時間範圍**：選擇「過去 1 小時」或「全部時間」
      - 勾選以下選項：
        - ✅ **Cookie 及其他網站數據**
        - ✅ **緩存的圖片和文件**
      - 其他選項可根據需要勾選

   4. 點擊 **清除數據**

   **方法 C：使用無痕模式（最簡單）**

   1. 打開無痕視窗：

      - 按 `Cmd+Shift+N`（Mac）或 `Ctrl+Shift+N`（Windows）
      - 或點擊選單 → **打開新的無痕式視窗**

   2. 在無痕視窗中測試登入：
      - 無痕模式不會使用現有的 cookie，非常適合快速測試

2. **重新啟動開發伺服器**（僅本地環境）

   ```bash
   # 停止目前伺服器（Ctrl+C）
   # 然後重新啟動
   yarn dev
   ```

3. **重新測試登入**
   - 訪問登入頁面
   - 點擊 Google 或 GitHub 登入按鈕
   - 應該能正常重定向到 OAuth 授權頁面

### 驗證清單

完成以上步驟後，請確認：

- [ ] Google Cloud Console 中已添加正確的 redirect URI
- [ ] GitHub OAuth App 中的 Authorization callback URL 已更新
- [ ] `NEXTAUTH_URL` 環境變數與 OAuth 配置中的 URL 匹配
- [ ] OAuth Client ID 和 Secret 在環境變數中正確設置
- [ ] 已清除瀏覽器 cookie 和快取
- [ ] 已重新啟動開發伺服器（本地環境）

---

## 🔍 診斷：OAuth Callback 返回 302 到 /auth/error

### 問題描述

在 Vercel 日誌中，您可能會看到：

```
GET 302 /api/auth/callback/google
GET 200 /auth/error
```

這表示 OAuth callback 處理失敗，NextAuth 重定向到了錯誤頁面。

### 可能原因

1. **用戶未在資料庫中註冊或未授權**（最常見）

   - 用戶嘗試登入，但資料庫中沒有對應的記錄
   - 用戶存在但 `isAuthorized=false`

2. **資料庫連接問題**

   - `DATABASE_URL` 環境變數未設置或錯誤
   - 資料庫無法連接（網路問題、憑證錯誤等）

3. **OAuth 配置問題**
   - Client ID/Secret 錯誤
   - Redirect URI 不匹配（已在前面的章節處理）

### 診斷步驟

#### 步驟 1：查看 Vercel 函數日誌

1. 前往 Vercel Dashboard → 選擇您的部署
2. 點擊 **Functions** 標籤
3. 找到 `/api/auth/callback/google` 的日誌
4. 查找以 `[OAuth]` 開頭的日誌訊息

**成功的日誌應該顯示**：

```
[OAuth] signIn callback triggered for provider: google, OAuth ID: 123456789, email: user@example.com
[OAuth] User ric (ID: abc123) authenticated successfully via google
```

**失敗的日誌可能顯示**：

```
[OAuth] signIn callback triggered for provider: google, OAuth ID: 123456789, email: user@example.com
[OAuth] No authorized user found with provider google and OAuth ID 123456789
[OAuth] Access denied: User with provider google and OAuth ID 123456789 not found or not authorized
[OAuth] User email: user@example.com, name: User Name
[OAuth] To fix this, ensure the user is registered in the database with isAuthorized=true
```

或資料庫錯誤：

```
[OAuth] Error during sign in callback: [錯誤訊息]
[OAuth] Database error code: [錯誤代碼]
```

#### 步驟 2：檢查錯誤頁面的 URL 參數

當您被重定向到 `/auth/error` 時，查看瀏覽器地址欄的 URL：

- `/auth/error?error=AccessDenied` → 用戶未授權或不存在
- `/auth/error?error=Configuration` → OAuth 配置錯誤
- `/auth/error?error=Verification` → OAuth 驗證失敗
- `/auth/error?error=OAuthCallback` → OAuth callback 處理失敗

#### 步驟 3：確認用戶已在資料庫中註冊

**如果錯誤是 `AccessDenied`**，您需要：

1. **檢查用戶是否存在**：

   ```bash
   # 在本地環境
   ./todo-add-user.sh list

   # 或使用 Prisma Studio
   yarn db:studio
   ```

2. **確認用戶的 OAuth ID 匹配**：

   - 用戶的 `provider` 欄位必須與登入使用的 OAuth 提供商一致（`google` 或 `github`）
   - 用戶的 `oauthId` 欄位必須與 Google/GitHub 返回的 OAuth ID 一致
   - 用戶的 `isAuthorized` 欄位必須為 `true`

3. **如果用戶不存在，添加用戶**：

   ```bash
   # 本地環境
   ./todo-add-user.sh add <alias> <provider>

   # 生產環境（需要設置 NEXTAUTH_URL）
   NEXTAUTH_URL="https://your-app.vercel.app" ./todo-add-user.sh add <alias> <provider>
   ```

   **注意**：添加用戶後，用戶需要：

   - 使用正確的 OAuth 提供商登入
   - 完成 OAuth 授權流程
   - 系統會自動將臨時的 `temp-*` OAuth ID 更新為真實的 OAuth ID

#### 步驟 4：檢查資料庫連接

**如果日誌顯示資料庫錯誤**：

1. **確認 Vercel 環境變數**：

   - 在 Vercel Dashboard → Settings → Environment Variables
   - 確認 `DATABASE_URL` 已設置且正確
   - 確認 `DATABASE_URL` 在 **Production** 環境中設置（不只是 Preview）

2. **測試資料庫連接**：

   ```bash
   # 在本地環境測試
   yarn prisma db pull
   ```

3. **檢查資料庫憑證**：
   - 確認資料庫 URL 中的用戶名、密碼、主機名都正確
   - 確認資料庫允許來自 Vercel 的連接（如果使用 IP 白名單）

#### 步驟 5：檢查 OAuth 配置

1. **確認環境變數**：

   - `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 已設置
   - `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 已設置（如果使用 GitHub）
   - 這些值與 OAuth 提供商控制台中的配置一致

2. **確認 Redirect URI**：
   - 已在 Google Cloud Console 和 GitHub Developer Settings 中配置正確的 redirect URI

### 常見錯誤對照表

| 日誌訊息                                                      | 原因                         | 解決方案                                                   |
| ------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `[OAuth] Access denied: User ... not found or not authorized` | 用戶未在資料庫中註冊或未授權 | 使用 `todo-add-user.sh` 添加用戶並確保 `isAuthorized=true` |
| `[OAuth] Error during sign in callback: [資料庫錯誤]`         | 資料庫連接失敗               | 檢查 `DATABASE_URL` 環境變數和資料庫連接                   |
| `[OAuth] signIn callback: No account provided`                | OAuth 流程未完成             | 檢查 OAuth 配置和 redirect URI                             |
| `/auth/error?error=Configuration`                             | NextAuth 配置錯誤            | 檢查 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL`                   |
| `/auth/error?error=Verification`                              | OAuth 驗證失敗               | 檢查 OAuth Client ID/Secret 和 redirect URI                |

### 快速修復檢查清單

如果 OAuth callback 返回 302 到 `/auth/error`：

- [ ] 查看 Vercel 函數日誌，確認具體錯誤訊息
- [ ] 檢查錯誤頁面的 URL 參數（`?error=...`）
- [ ] 確認用戶已在資料庫中註冊且 `isAuthorized=true`
- [ ] 確認用戶的 `provider` 和 `oauthId` 與 OAuth 返回的資訊匹配
- [ ] 檢查 `DATABASE_URL` 環境變數是否正確設置
- [ ] 檢查 OAuth Client ID/Secret 是否正確
- [ ] 確認 Google/GitHub OAuth 應用中的 redirect URI 已正確配置
- [ ] 清除瀏覽器 cookie 並重新測試

### 常見問題

**Q: 我已經添加了 redirect URI，但還是出現錯誤？**

A: 請確認：

1. Redirect URI 的格式完全正確（包括協議 `http://` 或 `https://`）
2. 沒有多餘的空格或尾隨斜線
3. 等待幾秒鐘讓 OAuth 提供商的設定生效
4. 清除瀏覽器 cookie 後重新測試

**Q: 本地和生產環境可以使用同一個 OAuth App 嗎？**

A:

- **Google**：可以，在同一個 OAuth 客戶端中添加多個 redirect URI
- **GitHub**：不可以，每個 OAuth App 只支援單一 callback URL，建議建立兩個 OAuth App

**Q: 如何確認我的 NEXTAUTH_URL 是什麼？**

A:

- 本地環境：檢查 `.env` 檔案中的 `NEXTAUTH_URL`
- 生產環境：在 Vercel Dashboard → Settings → Environment Variables 中查看

---

## ⚠️ 問題：Vercel 預覽部署（Preview Deployment）OAuth 錯誤

### 錯誤訊息

在 Vercel 的預覽部署（Pull Request 或分支部署）中嘗試 OAuth 登入時，可能會遇到以下情況：

- 在 Vercel 日誌中看到 `/api/auth/callback/google` 返回 302 狀態碼但出現錯誤
- 錯誤堆棧顯示在 NextAuth.js 處理流程中（例如：`at e_ (/var/task/.next/server/chunks/589.js:404:24385)`）
- 最終重定向到 `/auth/error` 頁面

### 如何查看詳細錯誤日誌

#### 方法 1：在 Vercel Dashboard 的 Functions 標籤中查看（推薦）

1. **訪問 Vercel Dashboard**

   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇您的專案

2. **找到正確的函數名稱**

   - NextAuth.js 使用動態路由 `[...nextauth]`
   - 實際的函數名稱是：**`api/auth/[...nextauth]`**（不是 `api/auth/callback/google`）
   - 在 Functions 標籤中查找這個函數名稱

3. **查看函數日誌**
   - 點擊 **Functions** 標籤
   - 找到 `api/auth/[...nextauth]` 函數
   - 點擊該函數查看詳細日誌
   - 查找以 `[OAuth]` 開頭的日誌訊息

#### 方法 2：在部署日誌中查看

1. **訪問部署詳情**

   - 在 Vercel Dashboard 中點擊失敗的部署
   - 點擊 **Logs** 標籤

2. **搜索日誌**

   - 使用瀏覽器的搜索功能（`Cmd+F` 或 `Ctrl+F`）
   - 搜索關鍵字：`[OAuth]` 或 `callback/google` 或 `signIn callback`

3. **查看實時日誌**
   - 在部署詳情頁面，點擊 **View Function Logs** 或 **Real-time Logs**
   - 這會顯示所有函數的實時日誌輸出

#### 方法 3：使用 Vercel CLI 查看日誌

如果您安裝了 Vercel CLI：

```bash
# 查看最近的日誌
vercel logs

# 查看特定部署的日誌
vercel logs [deployment-url]

# 實時查看日誌
vercel logs --follow
```

#### 關鍵日誌訊息

查找以下以 `[OAuth]` 開頭的日誌訊息：

- `[OAuth] signIn callback triggered` - 確認 OAuth 回調被觸發
- `[OAuth] Environment:` - 查看環境變數設置（NODE_ENV, VERCEL_URL, NEXTAUTH_URL）
- `[OAuth] Database connection failed` - 數據庫連接錯誤
- `[OAuth] Error during sign in callback` - 登入回調中的錯誤
- `[OAuth] Prisma error code:` - Prisma 數據庫錯誤代碼
- `[OAuth] DATABASE_URL present:` - 確認 DATABASE_URL 是否存在
- `[OAuth] Access denied:` - 用戶未授權或未找到

#### 如果仍然找不到日誌

如果以上方法都找不到日誌，可能的原因：

1. **函數名稱不同**

   - 檢查 Functions 標籤中的所有函數
   - 查找包含 `auth` 或 `nextauth` 的函數名稱

2. **日誌級別設置**

   - 確認 Vercel 的日誌級別設置為顯示所有日誌
   - 某些錯誤可能只在特定級別顯示

3. **日誌延遲**

   - Vercel 日誌可能有幾秒鐘的延遲
   - 等待幾秒後重新刷新頁面

4. **檢查其他位置**
   - 檢查 **Runtime Logs** 標籤
   - 檢查 **Build Logs** 標籤（雖然通常不包含運行時日誌）

### 問題原因

Vercel 的預覽部署會為每個分支或 Pull Request 生成**唯一的預覽 URL**，格式通常為：

```
https://your-app-git-branch-name-username.vercel.app
```

常見問題包括：

1. **預覽部署的 NEXTAUTH_URL 未正確設置**

   - Vercel 預覽部署不會自動使用生產環境的 `NEXTAUTH_URL`
   - 如果 `NEXTAUTH_URL` 設置為生產 URL，但實際訪問的是預覽 URL，會導致 OAuth 回調失敗

2. **OAuth 提供商未配置預覽部署的 redirect URI**

   - Google OAuth 應用中可能沒有添加預覽部署的 redirect URI
   - 每個預覽部署都有不同的域名，需要單獨配置（或使用通配符）

3. **數據庫連接問題**
   - 預覽部署可能無法連接到數據庫
   - 環境變數（如 `DATABASE_URL`）可能未正確設置

### 快速修復步驟

#### 🔧 步驟 1：確認預覽部署的 URL

1. **查看 Vercel 部署日誌**

   - 在 Vercel Dashboard 中找到失敗的部署
   - 查看部署的 URL（通常在部署詳情頁面頂部）

2. **確認實際訪問的域名**
   - 預覽部署的 URL 格式：`https://your-app-git-branch-username.vercel.app`
   - 生產部署的 URL 格式：`https://your-app.vercel.app`

#### 🔧 步驟 2：配置 NEXTAUTH_URL 環境變數

**選項 A：為預覽部署設置動態 NEXTAUTH_URL（推薦）**

Vercel 會自動提供 `VERCEL_URL` 環境變數，您可以在代碼中使用它：

1. **修改 `src/lib/auth.ts`**（如果尚未修改）：

   ```typescript
   // 在 NextAuth 配置之前
   const baseUrl =
     process.env.NEXTAUTH_URL ||
     (process.env.VERCEL_URL
       ? `https://${process.env.VERCEL_URL}`
       : "http://localhost:3000");

   export const { handlers, auth, signIn, signOut } = NextAuth({
     // ... 其他配置
   });
   ```

   然後在 cookie 配置中使用 `baseUrl`：

   ```typescript
   secure: baseUrl.startsWith('https://') ?? process.env.NODE_ENV === 'production',
   ```

**選項 B：在 Vercel 環境變數中設置（不推薦用於預覽部署）**

1. 前往 Vercel Dashboard → Settings → Environment Variables
2. 為 **Preview** 環境添加 `NEXTAUTH_URL`
3. 但這需要為每個預覽部署手動更新，不實用

#### 🔧 步驟 3：配置 Google OAuth 應用支援預覽部署

**方法 1：添加通配符 redirect URI（如果 Google 支援）**

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 進入 **APIs & Services** → **Credentials**
3. 編輯您的 OAuth 2.0 客戶端 ID
4. 在「已授權的重新導向 URI」中添加：

   ```
   https://*-username.vercel.app/api/auth/callback/google
   ```

   ⚠️ **注意**：Google 可能不支援通配符，這種方法可能無效。

**方法 2：為每個預覽部署手動添加 redirect URI（實際可行）**

1. 當您創建新的預覽部署時：

   - 記下預覽部署的完整 URL
   - 前往 Google Cloud Console
   - 添加 redirect URI：`https://your-preview-url.vercel.app/api/auth/callback/google`

2. **缺點**：需要為每個預覽部署手動配置，較為繁瑣

**方法 3：使用單一測試 OAuth 應用（推薦用於開發）**

1. 創建一個專門用於開發和預覽部署的 Google OAuth 應用
2. 在預覽部署的環境變數中使用這個測試應用的 Client ID 和 Secret
3. 在這個測試應用中添加所有需要的預覽部署 redirect URI

#### 🔧 步驟 4：檢查數據庫連接

1. **確認環境變數設置**

   - 在 Vercel Dashboard → Settings → Environment Variables
   - 確認 `DATABASE_URL` 在 **Preview** 環境中已設置
   - 確認其他必要的環境變數（如 `NEXTAUTH_SECRET`）也已設置

2. **測試數據庫連接**
   - 檢查 Vercel 部署日誌中是否有數據庫連接錯誤
   - 確認數據庫允許來自 Vercel IP 的連接（如果有限制）

#### 🔧 步驟 5：臨時解決方案 - 僅在生產環境測試 OAuth

如果預覽部署的 OAuth 配置過於複雜，可以：

1. **僅在生產環境測試 OAuth 功能**

   - 將代碼合併到主分支後，在生產部署中測試
   - 預覽部署主要用於測試非 OAuth 相關的功能

2. **使用本地環境測試 OAuth**
   - 在本地開發環境中完整測試 OAuth 流程
   - 確保本地環境的 OAuth 配置正確

### 驗證清單

完成以上步驟後，請確認：

- [ ] 已確認預覽部署的實際 URL
- [ ] `NEXTAUTH_URL` 或 `VERCEL_URL` 環境變數正確設置
- [ ] Google OAuth 應用中已添加預覽部署的 redirect URI（或使用測試應用）
- [ ] `DATABASE_URL` 和其他環境變數在 Preview 環境中已設置
- [ ] 已檢查 Vercel 部署日誌確認沒有其他錯誤

### 常見問題

**Q: 為什麼預覽部署的 OAuth 會失敗，但生產環境正常？**

A: 因為預覽部署使用不同的域名，而 OAuth 提供商需要明確配置每個允許的 redirect URI。如果預覽部署的域名沒有在 OAuth 應用中配置，就會失敗。

**Q: 可以讓所有預覽部署共用同一個 redirect URI 嗎？**

A: 不可以。每個預覽部署都有唯一的域名，必須單獨配置。但您可以創建一個專門的測試 OAuth 應用來管理所有預覽部署的 redirect URI。

**Q: 如何避免為每個預覽部署手動配置 OAuth？**

A: 最佳實踐是：

1. 在開發階段，主要在本地環境測試 OAuth
2. 預覽部署主要用於測試非 OAuth 功能
3. OAuth 功能在合併到主分支後，在生產環境中測試
4. 或者使用專門的測試 OAuth 應用，並定期更新其 redirect URI 列表

---

## ⚠️ 問題：InvalidCheck: pkceCodeVerifier value could not be parsed

### 錯誤訊息

在 Vercel 日誌中看到以下錯誤：

```
[auth][error] InvalidCheck: pkceCodeVerifier value could not be parsed. Read more at https://errors.authjs.dev#invalidcheck
```

### 問題原因

這個錯誤表示 NextAuth.js 無法解析 PKCE (Proof Key for Code Exchange) cookie。常見原因包括：

1. **Cookie 的 secure 標誌設置不正確**

   - 在 HTTPS 環境中，cookie 必須設置 `secure: true`
   - 在 HTTP 環境中（localhost），cookie 必須設置 `secure: false`
   - 如果設置不匹配，瀏覽器會拒絕設置 cookie，導致無法讀取

2. **跨域或域名問題**

   - Cookie 的 domain 設置不正確
   - 預覽部署和生產部署使用不同域名，cookie 無法共享

3. **Cookie 被損壞或清除**

   - 瀏覽器清除了 cookie
   - Cookie 在傳輸過程中被修改

4. **NEXTAUTH_URL 配置錯誤**
   - `NEXTAUTH_URL` 與實際訪問的 URL 不匹配
   - 預覽部署使用不同的 URL，但 `NEXTAUTH_URL` 設置為生產 URL

### 快速修復步驟

#### 🔧 步驟 1：確認 NEXTAUTH_URL 設置正確

1. **檢查 Vercel 環境變數**

   - 前往 Vercel Dashboard → Settings → Environment Variables
   - 確認 `NEXTAUTH_URL` 的設置：
     - **生產環境**：`https://your-app.vercel.app`（無尾隨斜線）
     - **預覽環境**：應該**不設置**，讓代碼自動使用 `VERCEL_URL`

2. **確認代碼已更新**
   - 代碼已更新為自動檢測 `VERCEL_URL` 並設置正確的 `secure` 標誌
   - 確保您已部署最新版本的代碼

#### 🔧 步驟 2：清除瀏覽器 Cookie

1. **清除特定網站的 Cookie**

   - 打開 Chrome 開發者工具（F12）
   - 前往 **Application** 標籤
   - 展開 **Cookies**
   - 選擇您的域名（預覽部署或生產部署）
   - 刪除所有以 `next-auth.` 或 `authjs.` 開頭的 cookie
   - 特別是 `next-auth.pkce.code_verifier` cookie

2. **或使用無痕模式測試**
   - 打開無痕視窗（`Cmd+Shift+N` 或 `Ctrl+Shift+N`）
   - 在無痕視窗中測試登入

#### 🔧 步驟 3：確認 Cookie 配置

代碼已自動處理 cookie 的 `secure` 標誌：

```typescript
// 自動檢測是否為 HTTPS
const isSecure = baseUrl.startsWith("https://");
```

這確保：

- HTTPS 環境（生產/預覽）：`secure: true`
- HTTP 環境（localhost）：`secure: false`

#### 🔧 步驟 4：檢查 Vercel 部署日誌

1. **查看詳細錯誤**

   - 在 Vercel Dashboard → Functions → `api/auth/[...nextauth]`
   - 查找 `[OAuth]` 開頭的日誌
   - 確認 `NEXTAUTH_URL` 和 `VERCEL_URL` 的值

2. **確認環境變數**
   - 檢查日誌中的 `[OAuth] Environment:` 訊息
   - 確認 `NEXTAUTH_URL` 與實際訪問的 URL 匹配

### 驗證清單

完成以上步驟後，請確認：

- [ ] `NEXTAUTH_URL` 在生產環境中設置為完整的 HTTPS URL（無尾隨斜線）
- [ ] `NEXTAUTH_URL` 在預覽環境中**未設置**（讓代碼自動使用 `VERCEL_URL`）
- [ ] 已清除瀏覽器的所有 NextAuth cookie
- [ ] 代碼已更新並重新部署
- [ ] Cookie 的 `secure` 標誌根據 URL 協議自動設置（HTTPS = true, HTTP = false）

### 常見問題

**Q: 為什麼預覽部署會出現這個錯誤，但生產環境正常？**

A: 因為預覽部署使用不同的域名，如果 `NEXTAUTH_URL` 設置為生產 URL，會導致 cookie 的 `secure` 和 `domain` 設置不匹配。解決方案是讓預覽部署自動使用 `VERCEL_URL`。

**Q: 我已經清除了 cookie，但錯誤仍然存在？**

A: 請確認：

1. 代碼已更新並重新部署
2. `NEXTAUTH_URL` 設置正確（預覽環境應該不設置）
3. 嘗試使用無痕模式測試

**Q: 如何確認 cookie 設置是否正確？**

A: 在瀏覽器開發者工具中：

1. 打開 **Application** → **Cookies**
2. 找到 `next-auth.pkce.code_verifier` cookie
3. 檢查 `Secure` 標誌：
   - HTTPS 環境應該顯示 ✅ Secure
   - HTTP 環境（localhost）應該不顯示 Secure

---

## 問題：localhost 登入顯示「認證失敗，請重試」

### 可能原因

1. **Google OAuth 重新導向 URI 未設定 localhost**（最常見）
2. **NEXTAUTH_URL 環境變數設定錯誤**
3. **OAuth 客戶端 ID/Secret 設定問題**

---

## 解決方案

### 步驟 1：檢查 Google Cloud Console 設定

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案
3. 進入 **APIs & Services** → **Credentials**
4. 找到您的 OAuth 2.0 客戶端 ID（用於 Vercel 部署的那個）
5. 點擊編輯（鉛筆圖示）

6. **檢查「已授權的重新導向 URI」清單**，確保包含以下兩個 URI：

   ```
   http://localhost:3000/api/auth/callback/google
   https://your-vercel-domain.com/api/auth/callback/google
   ```

7. 如果缺少 localhost 的 URI，點擊 **+ 新增 URI**，新增：

   ```
   http://localhost:3000/api/auth/callback/google
   ```

8. 點擊 **儲存**

### 步驟 2：檢查本地環境變數

確保您的 `.env` 檔案包含以下設定：

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**重要提示**：

- `NEXTAUTH_URL` 必須設定為 `http://localhost:3000`（不是 https）
- 確保 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 與 Google Cloud Console 中的一致

### 步驟 3：重新啟動開發伺服器

修改環境變數或 Google Console 設定後，需要重新啟動開發伺服器：

```bash
# 停止目前伺服器（Ctrl+C）
# 然後重新啟動
yarn dev
```

### 步驟 4：清除瀏覽器快取和 Cookie

1. 清除瀏覽器快取
2. 清除 localhost:3000 的 Cookie
3. 或使用無痕模式重新測試

---

## 驗證設定

### 檢查 1：確認重新導向 URI 設定

在 Google Cloud Console 中，您的 OAuth 客戶端應該有以下重新導向 URI：

- ✅ `http://localhost:3000/api/auth/callback/google`（開發環境）
- ✅ `https://your-vercel-domain.com/api/auth/callback/google`（生產環境）

### 檢查 2：確認環境變數

執行以下命令檢查環境變數是否正確載入：

```bash
# 在專案根目錄
cat .env | grep -E "NEXTAUTH_URL|GOOGLE_CLIENT"
```

應該看到：

```
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-actual-client-id"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

### 檢查 3：查看伺服器日誌

啟動開發伺服器後，嘗試登入，查看終端輸出的錯誤訊息：

```bash
yarn dev
# 然後嘗試登入，觀察終端輸出
```

常見的錯誤訊息：

- `redirect_uri_mismatch` → 重新導向 URI 未設定
- `invalid_client` → 客戶端 ID/Secret 錯誤
- `access_denied` → 使用者拒絕了授權

---

## 常見錯誤對照表

| 錯誤訊息                                                   | 原因                                    | 解決方案                                                                |
| ---------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `redirect_uri_mismatch`                                    | 重新導向 URI 未在 Google Console 中設定 | 在 Google Console 新增 `http://localhost:3000/api/auth/callback/google` |
| `invalid_client`                                           | 客戶端 ID 或 Secret 錯誤                | 檢查 `.env` 檔案中的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`       |
| `access_denied`                                            | 使用者拒絕了 OAuth 授權                 | 重新登入，確保點擊「允許」                                              |
| `Configuration`                                            | NextAuth 設定錯誤                       | 檢查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET`                                |
| `Verification`                                             | OAuth 驗證失敗                          | 通常是重新導向 URI 或環境變數問題                                       |
| `InvalidCheck: pkceCodeVerifier value could not be parsed` | PKCE code verifier cookie 無法解析      | 已在 `src/lib/auth.ts` 中配置 cookie 設定，確保部署最新版本             |

---

## 如果問題仍然存在

### 選項 1：建立單獨的開發環境 OAuth 應用

如果不想修改生產環境的 OAuth 設定，可以建立一個新的 OAuth 客戶端專門用於開發：

1. 在 Google Cloud Console 建立新的 OAuth 2.0 客戶端 ID
2. 只新增 localhost 的重新導向 URI
3. 在本地 `.env` 檔案中使用新的客戶端 ID 和 Secret
4. 生產環境繼續使用原來的客戶端 ID 和 Secret

### 選項 2：檢查資料庫中的使用者記錄

確保使用者 "ric" 在資料庫中存在且已授權：

```bash
# 使用 Prisma Studio 查看
yarn db:studio

# 或使用腳本查看
./todo-add-user.sh list
```

確保：

- 使用者存在
- `provider` 欄位為 `google`
- `isAuthorized` 欄位為 `true`

### 選項 3：查看詳細錯誤日誌

在 `src/lib/auth.ts` 的 `signIn` callback 中新增更多日誌：

```typescript
async signIn({ user, account }) {
  console.log('SignIn callback:', { user, account })
  // ... 現有程式碼
}
```

---

## 快速檢查清單

- [ ] Google Cloud Console 中已新增 `http://localhost:3000/api/auth/callback/google` 重新導向 URI
- [ ] `.env` 檔案中 `NEXTAUTH_URL="http://localhost:3000"`
- [ ] `.env` 檔案中 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 正確
- [ ] 已重新啟動開發伺服器
- [ ] 已清除瀏覽器快取和 Cookie
- [ ] 資料庫中存在使用者 "ric" 且 `isAuthorized=true`

完成以上所有步驟後，問題應該就能解決了。

---

## PKCE 錯誤：`InvalidCheck: pkceCodeVerifier value could not be parsed`

### 問題描述

在 Vercel 部署環境中，可能會遇到以下錯誤：

```
[auth][error] InvalidCheck: pkceCodeVerifier value could not be parsed
```

這是 NextAuth 5 的 PKCE (Proof Key for Code Exchange) 驗證問題，通常發生在生產環境。

### 原因

1. **Cookie 配置問題**：PKCE code verifier 存儲在 cookie 中，如果 cookie 配置不正確，可能無法正確解析
2. **Cookie 大小限制**：某些環境下 cookie 可能超過大小限制
3. **環境差異**：開發環境和生產環境的 cookie 設定不一致

### 解決方案

已在 `src/lib/auth.ts` 中添加了完整的 cookie 配置，包括：

- `pkceCodeVerifier` cookie 的明確設定
- 適當的 `httpOnly`、`sameSite`、`secure` 設定
- 15 分鐘的過期時間（`maxAge: 900`）

### 驗證修復

1. **確保已部署最新版本**：

   ```bash
   git pull origin posthog
   git push origin posthog
   ```

2. **檢查 Vercel 環境變數**（非常重要）：

   在 Vercel Dashboard → Settings → Environment Variables 中確認：

   - ✅ `NEXTAUTH_SECRET` 已設置（使用 `openssl rand -base64 32` 生成）
   - ✅ `NEXTAUTH_URL` 設置為完整的 HTTPS URL，**必須包含 `https://` 前綴**
     - ✅ 正確：`https://todo-multi-users.vercel.app`
     - ❌ 錯誤：`todo-multi-users.vercel.app`（缺少協議）
     - ❌ 錯誤：`http://todo-multi-users.vercel.app`（使用 HTTP 而非 HTTPS）

3. **驗證 Cookie 設定**：

   最新的配置會根據 `NEXTAUTH_URL` 自動判斷是否使用 `secure: true`：

   - 如果 `NEXTAUTH_URL` 以 `https://` 開頭，所有 cookie 都會設置 `secure: true`
   - 這確保在 Vercel 的 HTTPS 環境中正確工作

4. **清除瀏覽器 Cookie**：

   - 清除與應用相關的所有 cookie（特別是 `next-auth.*` 開頭的 cookie）
   - 使用無痕模式重新測試
   - 或使用瀏覽器開發者工具 → Application → Cookies 手動清除

5. **查看 Vercel 日誌**：

   在 Vercel Dashboard → 選擇部署 → Functions 標籤中：

   - 查看 `/api/auth/callback/google` 的日誌
   - 查找 PKCE 相關的錯誤訊息
   - 檢查是否有其他認證錯誤

6. **測試 OAuth 流程**：

   - 訪問登入頁面
   - 點擊 Google 登入
   - 完成 OAuth 授權
   - 觀察是否成功重定向回應用

### 技術細節

PKCE 是 OAuth 2.0 的安全擴展，用於防止授權碼攔截攻擊。NextAuth 5 預設啟用 PKCE，code verifier 存儲在加密的 cookie 中。通過明確配置 cookie 選項，可以確保在不同環境中正確處理 PKCE 流程。

---

## 生產環境 OAuth Callback 錯誤診斷

### 問題描述

在 Vercel 生產環境中，OAuth callback (`/api/auth/callback/google`) 可能返回 302 重定向到 `/auth/error`，但沒有顯示完整的錯誤訊息，只有錯誤堆疊。

### 可能原因

1. **環境變數配置問題**：

   - `NEXTAUTH_URL` 未正確設置或格式錯誤
   - `NEXTAUTH_SECRET` 未設置或與開發環境不一致
   - OAuth 客戶端 ID/Secret 配置錯誤

2. **Cookie 配置問題**：

   - Cookie 的 `secure` 標誌設置不正確
   - Cookie 的 `sameSite` 設置導致跨域問題
   - Cookie 大小超過限制

3. **OAuth 提供者配置問題**：

   - Google OAuth 重新導向 URI 未正確配置
   - OAuth 客戶端 ID/Secret 與 Vercel 環境變數不一致

4. **NextAuth 配置問題**：
   - `trustHost` 設置不正確
   - 其他 NextAuth 配置選項問題

### 診斷步驟

#### 步驟 1：檢查 Vercel 環境變數

在 Vercel Dashboard → Settings → Environment Variables 中確認：

**Production 環境必須設置：**

- ✅ `NEXTAUTH_SECRET`：

  - 必須設置（使用 `openssl rand -base64 32` 生成）
  - 必須與開發環境不同（生產環境應使用獨立的 secret）
  - 長度應為 32 字元以上

- ✅ `NEXTAUTH_URL`：

  - 必須設置為完整的 HTTPS URL
  - ✅ 正確格式：`https://todo-multi-users.vercel.app`
  - ❌ 錯誤格式：`todo-multi-users.vercel.app`（缺少協議）
  - ❌ 錯誤格式：`http://todo-multi-users.vercel.app`（使用 HTTP）
  - ❌ 錯誤格式：`https://todo-multi-users.vercel.app/`（尾隨斜線）

- ✅ OAuth 客戶端配置：
  - `GOOGLE_CLIENT_ID` 必須設置
  - `GOOGLE_CLIENT_SECRET` 必須設置
  - 確保這些值與 Google Cloud Console 中的配置一致

#### 步驟 2：檢查 Google Cloud Console 配置

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案
3. 進入 **APIs & Services** → **Credentials**
4. 找到用於生產環境的 OAuth 2.0 客戶端 ID
5. 點擊編輯（鉛筆圖示）
6. **檢查「已授權的重新導向 URI」清單**，確保包含：
   ```
   https://todo-multi-users.vercel.app/api/auth/callback/google
   ```
7. 如果缺少，點擊 **+ 新增 URI**，新增上述 URI
8. 點擊 **儲存**

#### 步驟 3：檢查 Vercel 部署日誌

在 Vercel Dashboard → 選擇最新的部署 → Functions 標籤中：

1. 查找 `/api/auth/callback/google` 的函數日誌
2. 查找錯誤訊息，常見的錯誤包括：

   - `InvalidCheck: pkceCodeVerifier value could not be parsed`
   - `Configuration`
   - `Verification`
   - `OAuthCallback`
   - `redirect_uri_mismatch`

3. 查看完整的錯誤堆疊，尋找具體的錯誤原因

#### 步驟 4：檢查瀏覽器 Cookie

1. 打開瀏覽器開發者工具（F12）
2. 前往 **Application** → **Cookies**
3. 選擇 `https://todo-multi-users.vercel.app`
4. 查找以下 cookie：

   - `next-auth.pkce.code_verifier`
   - `next-auth.session_token`
   - `next-auth.callback-url`
   - `next-auth.csrf_token`

5. 檢查這些 cookie 的屬性：

   - **Secure**：應該為 `true`（在 HTTPS 環境中）
   - **SameSite**：應該為 `Lax`
   - **HttpOnly**：應該為 `true`（某些 cookie）

6. 如果發現問題，清除所有 `next-auth.*` 開頭的 cookie，然後重新測試

#### 步驟 5：測試 OAuth 流程

1. **清除瀏覽器狀態**：

   - 清除所有 cookie（或使用無痕模式）
   - 清除快取

2. **訪問登入頁面**：

   ```
   https://todo-multi-users.vercel.app/login
   ```

3. **點擊 Google 登入**：

   - 觀察是否正確重定向到 Google 授權頁面
   - 完成授權後，觀察是否正確重定向回應用

4. **檢查重定向結果**：
   - 如果重定向到 `/auth/error`，查看 URL 參數中的 `error` 值
   - 記錄具體的錯誤類型

#### 步驟 6：驗證 NextAuth 配置

檢查 `src/lib/auth.ts` 中的配置：

1. **確認 `trustHost: true`**：

   ```typescript
   export const { handlers, auth, signIn, signOut } = NextAuth({
     trustHost: true, // 必須設置為 true
     // ...
   });
   ```

2. **確認 Cookie 配置**：
   ```typescript
   cookies: {
     pkceCodeVerifier: {
       options: {
         secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
         // ...
       },
     },
     // ...
   }
   ```

### 常見錯誤對照表

| 錯誤類型                                                   | 可能原因                | 解決方案                                                                  |
| ---------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `InvalidCheck: pkceCodeVerifier value could not be parsed` | Cookie 配置問題         | 檢查 `NEXTAUTH_URL` 是否以 `https://` 開頭，確保 cookie `secure` 設置正確 |
| `Configuration`                                            | NextAuth 配置錯誤       | 檢查 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 是否正確設置                     |
| `Verification`                                             | OAuth 驗證失敗          | 檢查 OAuth 客戶端 ID/Secret 是否正確，檢查 Google Console 重新導向 URI    |
| `OAuthCallback`                                            | OAuth callback 處理失敗 | 檢查 `signIn` callback 邏輯，查看資料庫連接是否正常                       |
| `redirect_uri_mismatch`                                    | 重新導向 URI 不匹配     | 在 Google Cloud Console 中添加正確的重新導向 URI                          |
| `AccessDenied`                                             | 使用者未授權            | 檢查資料庫中使用者是否存在且 `isAuthorized=true`                          |

### 快速檢查清單

在排查生產環境 OAuth 錯誤時，請確認：

- [ ] `NEXTAUTH_SECRET` 在 Production 環境中已設置
- [ ] `NEXTAUTH_URL` 在 Production 環境中設置為 `https://todo-multi-users.vercel.app`（無尾隨斜線）
- [ ] `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 在 Production 環境中已設置
- [ ] Google Cloud Console 中已添加 `https://todo-multi-users.vercel.app/api/auth/callback/google` 重新導向 URI
- [ ] 已清除瀏覽器 cookie 並重新測試
- [ ] 已查看 Vercel 函數日誌，確認具體錯誤訊息
- [ ] `src/lib/auth.ts` 中 `trustHost: true` 已設置
- [ ] Cookie 配置中的 `secure` 選項根據 `NEXTAUTH_URL` 正確設置

### 如果問題仍然存在

1. **查看完整的 Vercel 函數日誌**：

   - 在 Vercel Dashboard 中查看最新的部署日誌
   - 查找所有與 `/api/auth/callback/google` 相關的錯誤
   - 記錄完整的錯誤堆疊

2. **檢查資料庫連接**：

   - 確認 `DATABASE_URL` 在 Production 環境中正確設置
   - 確認資料庫允許 Vercel 的 IP 連接（如果使用 IP 白名單）

3. **測試 Preview 環境**：

   - 如果 Preview 環境正常工作，比較 Preview 和 Production 的環境變數差異
   - 確保 Production 環境變數與 Preview 環境一致（除了 URL）

4. **聯繫支援**：
   - 如果以上步驟都無法解決問題，請提供：
     - 完整的 Vercel 函數日誌
     - 環境變數配置（隱藏敏感資訊）
     - 瀏覽器開發者工具的 Network 標籤截圖
     - 錯誤頁面的 URL（包含 `error` 參數）
