# PostHog 事件追蹤除錯指南

當您在 PostHog 中看不到預期的事件（例如 `todo_created`）時，請按照以下步驟進行排查。

## 🔍 快速檢查清單

### 1. 檢查瀏覽器 Console

1. **開啟開發者工具**

   - 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - 前往 **Console** 標籤

2. **檢查 PostHog 初始化訊息**

   - 應該看到：`✅ PostHog initialized successfully`
   - 如果看到：`⚠️ PostHog key not found`，表示環境變數未設定

3. **檢查事件發送日誌**
   - 新增 Todo 時，應該看到：`📊 PostHog: todo_created event sent`
   - 如果有錯誤，會顯示：`❌ PostHog: Failed to capture todo_created event`

### 2. 檢查環境變數

#### 本地開發環境

1. **檢查 `.env` 檔案**

   ```bash
   cat .env | grep POSTHOG
   ```

   應該看到：

   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

2. **確認環境變數已載入**
   - 重新啟動開發伺服器：`npm run dev`
   - 環境變數變更後必須重啟才會生效

#### Vercel 生產環境

1. **檢查 Vercel 環境變數**

   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇專案 → **Settings** → **Environment Variables**
   - 確認以下變數已設定：
     - `NEXT_PUBLIC_POSTHOG_KEY`
     - `NEXT_PUBLIC_POSTHOG_HOST`

2. **重新部署**
   - 環境變數變更後必須重新部署才會生效
   - 點擊 **Deployments** → 選擇最新部署 → **Redeploy**

### 3. 檢查 PostHog 設定

1. **確認 API Key 正確**

   - 前往 PostHog → **Project Settings**
   - 確認 **Project API Key** 與環境變數中的值一致
   - 注意：不要使用 Personal API Key（用於伺服器端），要使用 Project API Key

2. **確認專案正確**
   - 在 PostHog 中確認您查看的是正確的專案
   - 檢查 URL 中的 Project ID 是否正確

### 4. 檢查事件是否真的發送

#### 方法一：使用瀏覽器 Network 標籤

1. 開啟開發者工具 → **Network** 標籤
2. 過濾：輸入 `posthog` 或 `batch`
3. 新增一個 Todo
4. 應該會看到對 PostHog API 的請求：
   - URL: `https://app.posthog.com/batch/` 或類似
   - Status: `200` 或 `204`
   - 如果看到 `401` 或 `403`，表示 API Key 有問題

#### 方法二：使用 PostHog Live Events

1. 在 PostHog 中前往 **Live Events** 頁面
2. 保持頁面開啟
3. 在應用程式中新增 Todo
4. 應該會即時看到 `todo_created` 事件出現

### 5. 檢查事件延遲

PostHog 事件可能需要幾分鐘才會出現在 Activity 頁面：

- **即時事件**：在 **Live Events** 頁面可以立即看到
- **Activity 頁面**：可能需要 1-5 分鐘才會顯示
- **Events 頁面**：可能需要更長時間才會更新統計

**建議**：使用 **Live Events** 頁面進行即時測試。

### 6. 檢查事件名稱

確認事件名稱正確：

- ✅ 正確：`todo_created`
- ❌ 錯誤：`todo-created`、`TodoCreated`、`TODO_CREATED`

事件名稱必須完全匹配（區分大小寫）。

### 7. 檢查過濾條件

在 PostHog Activity 頁面：

1. **清除所有過濾條件**

   - 確認沒有設定時間範圍過濾
   - 確認沒有設定事件類型過濾
   - 確認沒有設定使用者過濾

2. **檢查時間範圍**
   - 選擇 **"Last 24 hours"** 或 **"All time"**
   - 確認事件發生的時間在選擇的範圍內

## 🐛 常見問題與解決方案

### 問題 1：Console 顯示 "PostHog key not found"

**原因**：環境變數未設定或未正確載入

**解決方案**：

1. 檢查 `.env` 檔案是否存在且包含 `NEXT_PUBLIC_POSTHOG_KEY`
2. 確認變數名稱正確（必須以 `NEXT_PUBLIC_` 開頭）
3. 重新啟動開發伺服器
4. 在 Vercel 上，確認環境變數已設定並重新部署

### 問題 2：Console 顯示錯誤但事件仍發送

**原因**：可能是非關鍵錯誤

**解決方案**：

1. 檢查錯誤訊息內容
2. 如果事件仍出現在 PostHog，可以暫時忽略
3. 如果事件未出現，請查看具體錯誤訊息

### 問題 3：Network 請求返回 401/403

**原因**：API Key 無效或過期

**解決方案**：

1. 前往 PostHog → **Project Settings**
2. 複製新的 **Project API Key**
3. 更新環境變數
4. 重新啟動/部署

### 問題 4：事件在 Live Events 看到但 Activity 看不到

**原因**：這是正常的，Activity 頁面有延遲

**解決方案**：

- 等待 1-5 分鐘
- 使用 **Live Events** 進行即時測試
- 使用 **Events** 頁面查看統計資料

### 問題 5：本地可以看到事件，但生產環境看不到

**原因**：Vercel 環境變數未設定或未重新部署

**解決方案**：

1. 檢查 Vercel 環境變數設定
2. 確認變數已套用到正確的環境（Production/Preview）
3. 重新部署專案
4. 清除瀏覽器快取後再測試

## 🔧 進階除錯技巧

### 啟用 PostHog Debug 模式

在開發環境中，PostHog 會自動啟用 debug 模式，您可以在 Console 看到詳細的日誌。

### 手動測試事件發送

在瀏覽器 Console 中執行：

```javascript
// 檢查 PostHog 是否已初始化
console.log("PostHog loaded:", typeof posthog !== "undefined");

// 手動發送測試事件
posthog.capture("test_event", {
  test_property: "test_value",
});

// 檢查 PostHog 配置
console.log("PostHog config:", posthog.config);
```

### 檢查 PostHog 實例狀態

```javascript
// 在瀏覽器 Console 中執行
if (typeof window !== "undefined" && window.posthog) {
  console.log("PostHog instance:", window.posthog);
  console.log("PostHog config:", window.posthog.config);
  console.log("PostHog persistence:", window.posthog.persistence);
}
```

## 📊 驗證事件追蹤的步驟

1. **開啟瀏覽器開發者工具**（F12）
2. **前往 Console 標籤**
3. **確認看到**：`✅ PostHog initialized successfully`
4. **新增一個 Todo**
5. **確認看到**：`📊 PostHog: todo_created event sent`
6. **前往 PostHog Live Events 頁面**
7. **應該看到**：`todo_created` 事件即時出現

## 🆘 仍然無法解決？

如果按照以上步驟仍無法解決問題，請檢查：

1. **PostHog 帳號狀態**

   - 確認帳號未過期
   - 確認專案未暫停

2. **網路連線**

   - 確認可以連接到 `https://app.posthog.com`
   - 檢查是否有防火牆或代理設定阻擋

3. **瀏覽器擴充功能**

   - 嘗試使用無痕模式
   - 停用廣告阻擋器（可能阻擋 PostHog 請求）

4. **程式碼版本**
   - 確認已部署最新版本的程式碼
   - 確認事件追蹤程式碼已包含在部署中

## 📝 除錯檢查表

- [ ] 瀏覽器 Console 沒有錯誤
- [ ] 看到 "PostHog initialized successfully" 訊息
- [ ] 看到 "todo_created event sent" 訊息
- [ ] Network 標籤中有 PostHog 請求（狀態 200）
- [ ] 環境變數已正確設定
- [ ] 已重新啟動/部署應用程式
- [ ] 在 PostHog Live Events 中可以看到事件
- [ ] 等待足夠時間（1-5 分鐘）後檢查 Activity 頁面

---

**最後更新**：2025-01-XX
