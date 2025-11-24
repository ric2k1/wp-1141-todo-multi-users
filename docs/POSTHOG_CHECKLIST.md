# PostHog 整合快速檢查清單

## 🚀 快速開始

### 1. 建立 PostHog 帳號與專案

- [ ] 前往 [PostHog](https://posthog.com) 註冊帳號
- [ ] 建立新專案
- [ ] 取得 Project API Key（在專案設定中）

### 2. 安裝與設定

#### 2.1 安裝依賴

```bash
cd todo-multi-users
npm install posthog-js
# 或
yarn add posthog-js
```

#### 2.2 環境變數設定

在 `.env` 檔案中新增：

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

在 Vercel 專案設定中：

- [ ] 前往 Vercel Dashboard → Settings → Environment Variables
- [ ] 新增 `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] 新增 `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] 套用到 Production、Preview、Development 環境

### 3. 實作檢查清單

#### 核心檔案建立

- [ ] 建立 `src/lib/posthog.ts`
- [ ] 建立 `src/components/PostHogProvider.tsx`
- [ ] 修改 `src/app/layout.tsx` 加入 PostHogProvider

#### 事件追蹤實作

- [ ] 登入事件 (`user_logged_in`)
- [ ] 登出事件 (`user_logged_out`)
- [ ] Todo 建立 (`todo_created`)
- [ ] Todo 更新 (`todo_updated`)
- [ ] Todo 刪除 (`todo_deleted`)
- [ ] Todo 完成 (`todo_completed`)
- [ ] 標籤新增 (`tag_added`)
- [ ] 標籤點擊 (`tag_clicked`)
- [ ] 過濾器套用 (`filter_applied`)

#### 使用者識別

- [ ] 在登入時設定使用者 ID
- [ ] 設定 OAuth 提供者屬性

### 4. 測試驗證

#### 本地測試

- [ ] 啟動開發伺服器：`npm run dev`
- [ ] 執行主要操作（登入、建立 Todo、完成 Todo）
- [ ] 在 PostHog 儀表板檢查事件是否出現

#### 生產環境測試

- [ ] 部署到 Vercel
- [ ] 在生產環境執行操作
- [ ] 驗證事件正確追蹤
- [ ] 檢查使用者識別是否正常

### 5. 分析儀表板設定

- [ ] 建立「每日活躍使用者」圖表
- [ ] 建立「Todo 操作統計」圖表
- [ ] 建立「標籤使用分析」圖表
- [ ] 建立「使用者留存率」圖表

### 6. 隱私與合規

- [ ] 確認使用者 ID 已匿名化
- [ ] 確認未追蹤個人識別資訊
- [ ] 考慮加入 Cookie 同意橫幅（可選）
- [ ] 更新隱私政策（如適用）

## 📊 建議追蹤的事件屬性

### todo_created

```javascript
{
  todo_id: string,
  has_description: boolean,
  tag_count: number,
  tags: string[]
}
```

### todo_completed

```javascript
{
  todo_id: string,
  completion_time: number, // 建立到完成的時間（秒）
  had_tags: boolean
}
```

### filter_applied

```javascript
{
  filter_type: 'tag' | 'done' | 'both',
  tag_count: number,
  show_done_only: boolean
}
```

## 🔧 常見問題

### Q: 事件沒有出現在 PostHog？

- 檢查環境變數是否正確設定
- 確認 `NEXT_PUBLIC_` 前綴（Next.js 需要此前綴才能在客戶端使用）
- 檢查瀏覽器控制台是否有錯誤
- 確認 PostHog API Key 正確

### Q: 使用者識別不正確？

- 確認在登入後呼叫 `posthog.identify()`
- 檢查 session 是否正確取得使用者資訊
- 確認使用者 ID 格式正確

### Q: 在 Vercel 上無法追蹤？

- 確認 Vercel 環境變數已設定
- 重新部署以套用環境變數變更
- 檢查 Vercel 函數日誌是否有錯誤

## 📚 下一步

完成基本整合後，可以考慮：

1. 設定功能標誌（Feature Flags）進行 A/B 測試
2. 啟用會話錄製（Session Recording）進行 UX 分析
3. 建立自訂儀表板
4. 設定告警規則（如使用者數異常下降）

---

**參考**: 詳細規劃請見 `POSTHOG_INTEGRATION_PLAN.md`
