# PostHog 設定指南

本指南將協助您完成 PostHog 的設定，包括建立專案、取得 API Key，以及設定環境變數。

## 步驟一：註冊 PostHog 帳號

1. 前往 [PostHog 官網](https://posthog.com)
2. 點擊右上角的 **"Sign up"** 或 **"Get started"**
3. 選擇註冊方式：
   - 使用 Email 註冊
   - 使用 Google/GitHub 帳號快速註冊
4. 完成註冊流程

## 步驟二：建立新專案

1. 登入後，PostHog 會自動引導您建立第一個專案
2. 如果沒有自動引導，點擊右上角的 **"Create project"** 按鈕
3. 填寫專案資訊：
   - **專案名稱**：例如 "Todo Multi-Users"
   - **時區**：選擇您的時區（例如 Asia/Taipei）
4. 點擊 **"Create project"** 完成建立

## 步驟三：取得 Project API Key（用於前端追蹤）

1. 進入專案後，點擊左側選單的 **"Project Settings"**（專案設定）
   - 或直接訪問：`https://app.posthog.com/project/settings`
2. 在 **"Project API Key"** 區塊中，您會看到：
   - **Project API Key**：這是要設定在 `NEXT_PUBLIC_POSTHOG_KEY` 的值
   - 點擊 **"Copy"** 按鈕複製 API Key
3. 這個 Key 用於前端 JavaScript SDK 追蹤事件

## 步驟四：取得 Personal API Key（用於分析儀表板）

1. 點擊右上角的個人頭像
2. 選擇 **"Personal API Keys"** 或 **"API Keys"**
   - 或直接訪問：`https://app.posthog.com/personal-api-keys`
3. 點擊 **"Create personal API key"**
4. 填寫資訊：
   - **Label**：例如 "Todo Analytics Dashboard"
   - **Description**：可選，描述此 Key 的用途
5. 點擊 **"Create key"**
6. **重要**：複製顯示的 API Key，因為之後無法再次查看
   - 這個 Key 要設定在 `POSTHOG_API_KEY` 環境變數中

## 步驟五：取得 Project ID

1. 回到專案設定頁面：`https://app.posthog.com/project/settings`
2. 在頁面頂部或 URL 中可以看到 Project ID
   - URL 格式：`https://app.posthog.com/project/[PROJECT_ID]/settings`
   - 例如：如果 URL 是 `https://app.posthog.com/project/12345/settings`，則 Project ID 是 `12345`
3. 複製這個 Project ID，用於設定 `POSTHOG_PROJECT_ID` 環境變數

## 步驟六：設定環境變數

### 本地開發環境

1. 在專案根目錄找到 `.env` 檔案（如果沒有，複製 `.env.example` 建立）
2. 新增以下環境變數：

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_your_project_api_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# PostHog API credentials for analytics dashboard (server-side only)
POSTHOG_API_KEY="pkey_your_personal_api_key_here"
POSTHOG_PROJECT_ID="your_project_id_here"
```

3. 將上述值替換為您從 PostHog 取得的實際值

### Vercel 部署環境

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 進入 **Settings** → **Environment Variables**
4. 新增以下環境變數：

| 變數名稱                   | 值                        | 環境                             |
| -------------------------- | ------------------------- | -------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | 您的 Project API Key      | Production, Preview, Development |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | Production, Preview, Development |
| `POSTHOG_API_KEY`          | 您的 Personal API Key     | Production, Preview, Development |
| `POSTHOG_PROJECT_ID`       | 您的 Project ID           | Production, Preview, Development |

5. 點擊 **"Save"** 儲存
6. **重要**：新增環境變數後，需要重新部署專案才能生效
   - 可以點擊 **"Redeploy"** 或推送新的 commit 觸發部署

## 步驟七：驗證設定

### 驗證前端追蹤

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
2. 開啟瀏覽器開發者工具（F12）
3. 前往 **Console** 標籤
4. 如果看到 PostHog 相關的日誌，表示初始化成功
5. 執行一些操作（登入、建立 Todo 等）
6. 在 PostHog 儀表板中：
   - 前往 **"Activity"** 或 **"Events"** 頁面
   - 應該可以看到事件開始出現

### 驗證分析儀表板

1. 確保已設定 `POSTHOG_API_KEY` 和 `POSTHOG_PROJECT_ID`
2. 訪問 `http://localhost:3000/analytics`
3. 如果設定正確，應該可以看到：
   - Daily Active Users 圖表
   - Registration Funnel 圖表
   - Todo Operations 統計
4. 如果看到 "PostHog API not configured" 訊息，請檢查：
   - 環境變數是否正確設定
   - 是否已重新啟動開發伺服器
   - API Key 和 Project ID 是否正確

## 常見問題

### Q: 找不到 Project API Key？

**A:** 確保您已經：

1. 建立了專案
2. 在專案設定頁面（Project Settings）
3. 如果還是找不到，嘗試重新整理頁面或登出再登入

### Q: Personal API Key 建立後找不到？

**A:** Personal API Key 只會在建立時顯示一次。如果忘記了：

1. 刪除舊的 Key
2. 建立新的 Key
3. 立即複製並妥善保存

### Q: 事件沒有出現在 PostHog？

**A:** 檢查以下項目：

1. `NEXT_PUBLIC_POSTHOG_KEY` 是否正確設定
2. 瀏覽器 Console 是否有錯誤訊息
3. 是否在正確的 PostHog 專案中查看
4. 等待幾分鐘，事件可能需要時間才會出現

### Q: 分析儀表板顯示 "API not configured"？

**A:** 確認：

1. `POSTHOG_API_KEY` 和 `POSTHOG_PROJECT_ID` 都已設定
2. 這些是**伺服器端**環境變數，不需要 `NEXT_PUBLIC_` 前綴
3. 已重新啟動開發伺服器或重新部署

### Q: 在 Vercel 上環境變數不生效？

**A:**

1. 確認環境變數已套用到正確的環境（Production/Preview/Development）
2. 重新部署專案
3. 檢查 Vercel 部署日誌是否有錯誤

## 安全注意事項

1. **不要將 API Key 提交到 Git**

   - 確保 `.env` 檔案在 `.gitignore` 中
   - 不要在程式碼中硬編碼 API Key

2. **區分不同環境的 Key**

   - 開發環境和生產環境可以使用不同的 PostHog 專案
   - 或使用同一個專案但透過環境變數區分

3. **定期輪換 API Key**
   - 如果 Key 洩露，立即在 PostHog 中刪除並建立新的

## 下一步

設定完成後，您可以：

1. **查看即時事件**

   - 在 PostHog 的 "Activity" 頁面查看即時事件流

2. **建立自訂儀表板**

   - 在 PostHog 中建立自訂的 Insights 和 Dashboards

3. **設定告警**

   - 當特定事件發生時收到通知

4. **分析使用者行為**
   - 使用 Funnels、Retention 等功能深入分析

## 參考資源

- [PostHog 官方文件](https://posthog.com/docs)
- [PostHog JavaScript SDK 文件](https://posthog.com/docs/integrate/client/js)
- [PostHog API 文件](https://posthog.com/docs/api)
- [Next.js 整合指南](https://posthog.com/docs/integrate/nextjs)

---

**最後更新**：2025-01-XX
