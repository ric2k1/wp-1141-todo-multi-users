# PostHog 使用者行為分析整合規劃

## 📋 專案概述

本文件規劃在已部署的 `todo-multi-users` 專案中整合 PostHog，以進行使用者行為分析與視覺化。

## 🎯 整合目標

1. **追蹤核心使用者行為**

   - Todo 的建立、編輯、刪除、完成
   - 標籤使用情況
   - 過濾器使用模式
   - 使用者登入/登出行為

2. **收集使用者屬性**

   - 使用者 ID（匿名化處理）
   - OAuth 提供者（Google/GitHub/Facebook）
   - 使用頻率

3. **建立分析儀表板**
   - 每日活躍使用者（DAU）
   - Todo 操作統計
   - 標籤熱度分析
   - 使用者留存率

## 📦 技術架構

### 技術棧

- **框架**: Next.js 16 (App Router)
- **分析工具**: PostHog
- **整合方式**: PostHog JavaScript SDK + Next.js Provider

### 整合方案選擇

**方案 A: PostHog Cloud（推薦）**

- ✅ 快速部署，無需自建基礎設施
- ✅ 免費方案適合中小型專案
- ✅ 自動更新與維護
- ⚠️ 需要註冊 PostHog 帳號

**方案 B: Self-hosted PostHog**

- ✅ 完全控制資料
- ✅ 無資料外流風險
- ⚠️ 需要額外的伺服器資源
- ⚠️ 需要維護成本

**建議**: 初期使用 PostHog Cloud，後續可視需求遷移至自託管。

## 🔧 實作步驟

### 階段一：環境設定與基礎整合

#### 1.1 安裝依賴

```bash
npm install posthog-js
# 或
yarn add posthog-js
```

#### 1.2 建立 PostHog Provider

- 建立 `src/lib/posthog.ts` - PostHog 客戶端初始化
- 建立 `src/components/PostHogProvider.tsx` - React Provider 組件

#### 1.3 環境變數設定

在 `.env` 和 Vercel 環境變數中新增：

```env
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### 1.4 整合到 Layout

- 在 `src/app/layout.tsx` 中包裹 PostHogProvider
- 確保只在客戶端載入

### 階段二：核心事件追蹤

#### 2.1 認證事件

- `user_logged_in` - 使用者登入
- `user_logged_out` - 使用者登出
- `oauth_provider_selected` - OAuth 提供者選擇

#### 2.2 Todo 操作事件

- `todo_created` - 建立 Todo
- `todo_updated` - 更新 Todo
- `todo_deleted` - 刪除 Todo
- `todo_completed` - 標記完成
- `todo_restored` - 恢復 Todo
- `todo_edited` - 開始編輯 Todo

#### 2.3 標籤事件

- `tag_added` - 新增標籤
- `tag_removed` - 移除標籤
- `tag_clicked` - 點擊標籤（用於過濾）
- `tag_suggestion_used` - 使用標籤建議

#### 2.4 過濾器事件

- `filter_applied` - 套用過濾器
- `filter_cleared` - 清除過濾器
- `filter_tag_added` - 新增標籤過濾
- `filter_done_toggled` - 切換完成狀態過濾

#### 2.5 頁面瀏覽事件

- `page_viewed` - 頁面瀏覽（自動追蹤）
- `todo_expanded` - 展開 Todo 詳情
- `todo_collapsed` - 收起 Todo 詳情

### 階段三：使用者屬性識別

#### 3.1 匿名化處理

- 使用 NextAuth session 的 user ID（經過 hash）
- 不追蹤個人識別資訊（PII）
- 僅追蹤 OAuth 提供者類型

#### 3.2 使用者屬性設定

- `user_id` - 匿名化使用者 ID
- `oauth_provider` - OAuth 提供者（google/github/facebook）
- `user_alias` - 使用者別名（可選，需確認隱私政策）

### 階段四：進階分析功能

#### 4.1 功能標誌（Feature Flags）

- 可用於 A/B 測試新功能
- 逐步推出功能

#### 4.2 會話錄製（Session Recording）

- 記錄使用者互動過程
- 用於除錯與 UX 優化
- ⚠️ 需注意隱私合規

#### 4.3 漏斗分析

- 登入 → 建立 Todo → 完成 Todo
- 識別使用者流失點

## 📊 建議追蹤的事件清單

### 高優先級事件（必須追蹤）

1. ✅ `todo_created` - 建立 Todo
2. ✅ `todo_completed` - 完成 Todo
3. ✅ `todo_deleted` - 刪除 Todo
4. ✅ `user_logged_in` - 使用者登入
5. ✅ `page_viewed` - 頁面瀏覽

### 中優先級事件（建議追蹤）

1. ⚠️ `todo_updated` - 更新 Todo
2. ⚠️ `tag_added` - 新增標籤
3. ⚠️ `filter_applied` - 套用過濾器
4. ⚠️ `tag_clicked` - 點擊標籤

### 低優先級事件（可選）

1. 📝 `todo_expanded` - 展開 Todo
2. 📝 `tag_suggestion_used` - 使用標籤建議
3. 📝 `filter_cleared` - 清除過濾器

## 🔒 隱私與合規考量

### 資料保護

1. **匿名化處理**

   - 使用者 ID 使用 hash 處理
   - 不追蹤真實姓名或 email

2. **資料最小化**

   - 僅追蹤必要的行為資料
   - 不追蹤 Todo 內容（僅追蹤操作）

3. **使用者同意**

   - 考慮加入 Cookie 同意橫幅
   - 提供退出追蹤選項（可選）

4. **GDPR 合規**
   - 提供資料匯出功能
   - 提供資料刪除功能

## 📈 預期分析指標

### 使用者指標

- **DAU (Daily Active Users)**: 每日活躍使用者數
- **MAU (Monthly Active Users)**: 每月活躍使用者數
- **使用者留存率**: 7 天、30 天留存率
- **平均會話時長**: 使用者平均使用時間

### 功能使用指標

- **Todo 建立率**: 每日建立的 Todo 數量
- **完成率**: Todo 完成比例
- **標籤使用率**: 使用標籤的 Todo 比例
- **過濾器使用率**: 使用過濾器的使用者比例

### 互動指標

- **平均 Todo 數量**: 每位使用者的平均 Todo 數
- **編輯頻率**: Todo 被編輯的頻率
- **標籤熱度**: 最常用的標籤排行

## 🚀 部署檢查清單

### 開發環境

- [ ] 安裝 PostHog SDK
- [ ] 建立 PostHog Provider
- [ ] 設定環境變數
- [ ] 整合到 Layout
- [ ] 實作核心事件追蹤
- [ ] 測試事件發送

### 生產環境

- [ ] 在 Vercel 設定環境變數
- [ ] 建立 PostHog 專案
- [ ] 取得 PostHog API Key
- [ ] 驗證事件追蹤正常運作
- [ ] 設定分析儀表板
- [ ] 測試使用者識別

### 後續優化

- [ ] 建立自訂儀表板
- [ ] 設定告警規則
- [ ] 定期檢視分析報告
- [ ] 根據資料優化 UX

## 📝 實作檔案清單

### 新增檔案

1. `src/lib/posthog.ts` - PostHog 客戶端初始化
2. `src/components/PostHogProvider.tsx` - PostHog React Provider
3. `src/hooks/usePostHog.ts` - PostHog Hook（可選）

### 修改檔案

1. `src/app/layout.tsx` - 加入 PostHogProvider
2. `src/app/page.tsx` - 加入事件追蹤
3. `src/components/AddTodo.tsx` - 追蹤 Todo 建立/更新
4. `src/components/TodoList.tsx` - 追蹤 Todo 操作
5. `src/components/FilterSection.tsx` - 追蹤過濾器使用
6. `src/app/login/page.tsx` - 追蹤登入事件
7. `package.json` - 新增依賴

### 環境變數

- `.env.example` - 新增 PostHog 相關變數
- Vercel 環境變數設定

## 🔍 測試策略

### 單元測試

- PostHog 初始化測試
- 事件發送測試（使用 mock）

### 整合測試

- 端對端事件追蹤測試
- 使用者識別測試

### 手動測試

- 在 PostHog 儀表板驗證事件
- 檢查事件屬性正確性
- 驗證使用者識別

## 📚 參考資源

- [PostHog 官方文件](https://posthog.com/docs)
- [PostHog Next.js 整合指南](https://posthog.com/docs/integrate/nextjs)
- [PostHog JavaScript SDK](https://posthog.com/docs/integrate/client/js)
- [GDPR 合規指南](https://posthog.com/docs/privacy/gdpr-compliance)

## ⏱️ 預估時程

- **階段一**: 2-3 小時（環境設定與基礎整合）
- **階段二**: 3-4 小時（核心事件追蹤）
- **階段三**: 1-2 小時（使用者屬性識別）
- **階段四**: 2-3 小時（進階功能，可選）

**總計**: 約 8-12 小時（不含進階功能）

## 🎯 成功標準

1. ✅ PostHog 成功追蹤所有核心事件
2. ✅ 使用者識別正常運作
3. ✅ 分析儀表板顯示正確資料
4. ✅ 不影響現有功能運作
5. ✅ 符合隱私合規要求

---

**最後更新**: 2025-01-XX
**狀態**: 規劃中
