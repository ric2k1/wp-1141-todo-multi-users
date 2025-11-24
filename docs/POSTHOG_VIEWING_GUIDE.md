# PostHog 事件記錄與 Dashboard 查看指南

本指南將協助您了解如何在 PostHog 中查看事件記錄、建立 Dashboard，以及進行資料分析。

## 📊 快速導覽

### 登入 PostHog

1. 前往 [PostHog 官網](https://app.posthog.com)
2. 使用您的帳號登入
3. 選擇對應的專案（例如 "Todo Multi-Users"）

---

## 🔍 查看事件記錄

### 方法一：Activity 頁面（即時事件流）

1. **進入 Activity 頁面**

   - 點擊左側選單的 **"Activity"** 或 **"活動"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/activity`

2. **查看即時事件**

   - 頁面會顯示即時發生的事件
   - 每個事件包含：
     - **事件名稱**（例如：`todo_created`、`user_logged_in`）
     - **使用者**（匿名化 ID）
     - **時間戳記**
     - **事件屬性**（點擊事件可展開查看詳細資訊）

3. **過濾事件**
   - 使用頂部的搜尋框搜尋特定事件
   - 使用時間範圍選擇器（右上角）查看不同時段的事件
   - 點擊事件名稱可過濾該類型的事件

### 方法二：Events 頁面（事件總覽）

1. **進入 Events 頁面**

   - 點擊左側選單的 **"Events"** 或 **"事件"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/events`

2. **查看事件統計**

   - 可以看到所有事件類型的列表
   - 每個事件顯示：
     - **事件名稱**
     - **總發生次數**
     - **趨勢圖表**（顯示事件隨時間的變化）
     - **最後發生時間**

3. **深入分析單一事件**
   - 點擊事件名稱進入詳細頁面
   - 可以查看：
     - 事件發生的時間序列圖
     - 觸發該事件的使用者列表
     - 事件屬性分佈
     - 相關的其他事件

### 方法三：Live Events（即時監控）

1. **進入 Live Events**

   - 點擊左側選單的 **"Live Events"** 或 **"即時事件"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/live`

2. **即時監控**
   - 可以看到正在發生的事件（即時更新）
   - 適合用於：
     - 測試事件追蹤是否正常運作
     - 監控特定使用者的行為
     - 除錯事件發送問題

---

## 📈 建立與使用 Dashboard

### 建立新的 Dashboard

1. **進入 Dashboards**

   - 點擊左側選單的 **"Dashboards"** 或 **"儀表板"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/dashboard`

2. **建立新 Dashboard**
   - 點擊右上角的 **"New dashboard"** 或 **"新建儀表板"**
   - 輸入 Dashboard 名稱（例如："Todo App Analytics"）
   - 選擇是否設為預設 Dashboard
   - 點擊 **"Create"** 建立

### 新增 Insights 到 Dashboard

#### 方法一：從 Insights 頁面新增

1. **建立 Insight**

   - 點擊左側選單的 **"Insights"** 或 **"洞察"**
   - 點擊 **"New insight"** 建立新的分析

2. **選擇分析類型**

   - **Trends（趨勢）**：查看事件隨時間的變化
   - **Funnels（漏斗）**：分析使用者轉換流程
   - **Retention（留存）**：分析使用者留存率
   - **Paths（路徑）**：分析使用者行為路徑
   - **Stickiness（黏性）**：分析使用者回訪頻率

3. **設定 Insight**

   - **Trends 範例**：
     - 選擇事件：`todo_created`
     - 選擇時間範圍：過去 7 天
     - 選擇圖表類型：折線圖或柱狀圖
     - 點擊 **"Save"** 儲存

4. **新增到 Dashboard**
   - 儲存後，點擊 Insight 右上角的 **"Add to dashboard"**
   - 選擇要新增到的 Dashboard
   - 或建立新的 Dashboard

#### 方法二：直接在 Dashboard 中新增

1. **開啟 Dashboard**

   - 進入您要編輯的 Dashboard

2. **新增 Insight**
   - 點擊 Dashboard 中的 **"Add insight"** 或 **"新增洞察"**
   - 選擇要新增的 Insight 類型
   - 設定並儲存

### 常用的 Dashboard 配置範例

#### 範例 1：核心指標 Dashboard

包含以下 Insights：

1. **每日活躍使用者（DAU）**

   - 類型：Trends
   - 事件：`$pageview` 或 `user_logged_in`
   - 分組：按天
   - 圖表：折線圖

2. **Todo 操作統計**

   - 類型：Trends
   - 事件：`todo_created`、`todo_completed`、`todo_deleted`
   - 分組：按天
   - 圖表：堆疊柱狀圖

3. **使用者登入趨勢**
   - 類型：Trends
   - 事件：`user_logged_in`
   - 分組：按天
   - 圖表：折線圖

#### 範例 2：使用者行為 Dashboard

包含以下 Insights：

1. **註冊漏斗**

   - 類型：Funnels
   - 步驟：
     1. `user_logged_in`（登入）
     2. `todo_created`（建立第一個 Todo）
     3. `todo_completed`（完成第一個 Todo）

2. **標籤使用情況**

   - 類型：Trends
   - 事件：`tag_added`
   - 分組：按標籤名稱（使用事件屬性）

3. **過濾器使用頻率**
   - 類型：Trends
   - 事件：`filter_applied`
   - 分組：按過濾器類型

---

## 🔎 進階查詢與分析

### 使用 Query Builder（查詢建構器）

1. **進入 Insights**

   - 點擊 **"Insights"** → **"New insight"**

2. **使用 Query Builder**

   - 選擇事件
   - 新增過濾條件：
     - **事件屬性**：例如 `tag_name = "work"`
     - **使用者屬性**：例如 `oauth_provider = "google"`
     - **時間範圍**：例如過去 30 天

3. **分組與聚合**
   - 可以按事件屬性分組
   - 可以計算總數、平均值、唯一使用者數等

### 使用 SQL 查詢（進階）

1. **進入 SQL 查詢**

   - 在 Insights 頁面，選擇 **"SQL"** 標籤
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/insights/new?insight=SQL`

2. **撰寫 SQL 查詢**

   ```sql
   SELECT
     event,
     count() as count,
     uniq(user_id) as unique_users
   FROM events
   WHERE timestamp >= now() - INTERVAL 7 DAY
   GROUP BY event
   ORDER BY count DESC
   LIMIT 10
   ```

3. **執行查詢**
   - 點擊 **"Run query"** 執行
   - 結果會以表格或圖表形式顯示

---

## 👥 查看使用者資料

### 使用者列表

1. **進入 Persons 頁面**

   - 點擊左側選單的 **"Persons"** 或 **"使用者"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/persons`

2. **查看使用者**

   - 可以看到所有使用者的列表
   - 每個使用者顯示：
     - **使用者 ID**（匿名化）
     - **首次出現時間**
     - **最後活動時間**
     - **事件總數**
     - **使用者屬性**

3. **查看單一使用者詳情**
   - 點擊使用者進入詳細頁面
   - 可以查看：
     - 該使用者的所有事件
     - 使用者屬性
     - 行為時間線
     - 相關的 Sessions

### 使用者屬性

在 PostHog 中，使用者屬性可能包括：

- `user_id`：匿名化使用者 ID
- `oauth_provider`：OAuth 提供者（google/github/facebook）
- `$initial_referrer`：首次來源
- `$initial_referring_domain`：首次來源網域

---

## 📅 時間範圍選擇

### 預設時間範圍

- **過去 24 小時**
- **過去 7 天**
- **過去 30 天**
- **過去 90 天**
- **自專案建立以來**

### 自訂時間範圍

1. 點擊右上角的時間選擇器
2. 選擇 **"Custom"** 或 **"自訂"**
3. 選擇開始和結束日期
4. 點擊 **"Apply"** 套用

---

## 🔔 設定告警

### 建立告警規則

1. **進入 Alerts**

   - 點擊左側選單的 **"Alerts"** 或 **"告警"**
   - 或直接訪問：`https://app.posthog.com/project/[PROJECT_ID]/alerts`

2. **建立新告警**
   - 點擊 **"New alert"** 或 **"新建告警"**
   - 設定條件：
     - 例如：當 `todo_created` 事件在過去 1 小時內少於 10 次時觸發
   - 選擇通知方式：
     - Email
     - Slack
     - Webhook
   - 儲存告警規則

---

## 💡 實用技巧

### 1. 儲存常用查詢

- 建立 Insight 後，記得儲存以便日後使用
- 可以將 Insight 加入 Dashboard 方便查看

### 2. 使用書籤

- 將常用的 Dashboard 或 Insight 加入書籤
- 可以快速訪問重要分析

### 3. 匯出資料

- 在 Insights 頁面，點擊 **"Export"** 可以匯出資料
- 支援 CSV、JSON 等格式

### 4. 分享 Dashboard

- 點擊 Dashboard 右上角的 **"Share"**
- 可以產生分享連結或嵌入碼
- 可以設定權限（公開或僅限團隊成員）

### 5. 使用快捷鍵

- `Ctrl/Cmd + K`：快速搜尋
- `Ctrl/Cmd + /`：顯示所有快捷鍵

---

## 🐛 除錯與問題排查

### 事件沒有出現？

1. **檢查事件是否已發送**

   - 前往 **"Live Events"** 查看即時事件
   - 在瀏覽器 Console 檢查是否有錯誤

2. **檢查時間範圍**

   - 確認選擇的時間範圍包含事件發生的時間
   - 事件可能需要幾分鐘才會出現在 PostHog

3. **檢查過濾條件**
   - 確認沒有設定過於嚴格的過濾條件
   - 嘗試清除所有過濾條件

### 資料不準確？

1. **檢查事件屬性**

   - 在 Events 頁面查看事件的實際屬性
   - 確認屬性名稱和值是否正確

2. **檢查重複事件**
   - 確認事件沒有被重複發送
   - 檢查程式碼中是否有重複的 `posthog.capture()` 呼叫

### 效能問題？

1. **限制查詢範圍**

   - 使用較短的時間範圍
   - 減少事件數量或過濾條件

2. **使用快取**
   - PostHog 會自動快取常用查詢
   - 避免頻繁重新整理 Dashboard

---

## 📚 相關資源

- [PostHog 官方文件](https://posthog.com/docs)
- [PostHog Dashboard 指南](https://posthog.com/docs/user-guides/dashboards)
- [PostHog Insights 指南](https://posthog.com/docs/user-guides/insights)
- [PostHog 查詢指南](https://posthog.com/docs/data/querying-events)

---

## 🎯 下一步

1. **建立您的第一個 Dashboard**

   - 從核心指標開始
   - 逐步新增更多 Insights

2. **設定告警**

   - 監控重要指標
   - 及時發現異常

3. **深入分析**

   - 使用 Funnels 分析轉換率
   - 使用 Retention 分析留存率
   - 使用 Paths 分析使用者行為路徑

4. **定期檢視**
   - 每週或每月檢視 Dashboard
   - 根據資料優化產品功能

---

**最後更新**：2025-01-XX
