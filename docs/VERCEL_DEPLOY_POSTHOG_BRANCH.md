# 在 Vercel 部署 posthog 分支指南

本指南將協助您將 `posthog` 分支部署到 Vercel。

## 方法一：透過 Vercel Dashboard 設定（推薦）

### 步驟 1：推送 posthog 分支到 GitHub

首先確保 `posthog` 分支已推送到遠端：

```bash
# 確認目前在 posthog 分支
git branch --show-current

# 如果還沒推送，執行：
git push origin posthog
```

### 步驟 2：在 Vercel 中設定環境變數

**重要**：即使沒有看到 Production Branch 設定，只要推送分支並設定環境變數，Vercel 會自動部署。

1. **登入 Vercel Dashboard**

   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇您的專案

2. **進入專案設定**

   - 點擊專案名稱進入專案頁面
   - 點擊 **Settings**（設定）

3. **設定 Git 分支**

   - 在左側選單選擇 **Git**
   - 找到 **Production Branch**（生產分支）設定
   - 將 Production Branch 改為 `posthog`
   - 或保持 `main`，但確保 `posthog` 分支會被自動部署為 Preview

4. **設定環境變數**

   - 在左側選單選擇 **Environment Variables**（環境變數）
   - 新增以下 PostHog 相關環境變數：

   | 變數名稱                   | 值                        | 環境                             |
   | -------------------------- | ------------------------- | -------------------------------- |
   | `NEXT_PUBLIC_POSTHOG_KEY`  | 您的 Project API Key      | Production, Preview, Development |
   | `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | Production, Preview, Development |
   | `POSTHOG_API_KEY`          | 您的 Personal API Key     | Production, Preview, Development |
   | `POSTHOG_PROJECT_ID`       | 您的 Project ID           | Production, Preview, Development |

5. **觸發部署**

   推送分支後，Vercel 會自動偵測並建立 Preview 部署：

   ```bash
   # 推送 posthog 分支（如果還沒推送）
   git push origin posthog
   ```

   或者推送一個新的 commit 來觸發部署：

   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment for posthog branch"
   git push origin posthog
   ```

   **手動觸發部署（可選）**：

   - 進入專案的 **Deployments** 頁面
   - 找到之前的 `posthog` 分支部署（如果有的話）
   - 點擊該部署右側的 **...** 選單
   - 選擇 **Redeploy**（重新部署）

   **或者建立新的部署**：

   - 在 Deployments 頁面，點擊 **Create Deployment**
   - 選擇 `posthog` 分支
   - 點擊 **Deploy**

## 方法二：使用 Vercel CLI

### 步驟 1：安裝 Vercel CLI（如果還沒安裝）

```bash
npm i -g vercel
```

### 步驟 2：登入 Vercel

```bash
vercel login
```

### 步驟 3：連結專案（如果還沒連結）

```bash
cd /Users/ric/classes/WebProg/1141/Examples/todo-multi-users
vercel link
```

### 步驟 4：部署 posthog 分支

```bash
# 確保在 posthog 分支
git checkout posthog

# 部署到 Preview 環境
vercel --prod=false

# 或部署到 Production 環境（如果 posthog 是生產分支）
vercel --prod
```

## 方法三：設定自動部署（推薦）

### 設定 Vercel 自動部署所有分支

1. 進入 Vercel 專案設定
2. 前往 **Git** → **Production Branch**
3. 確保 **Automatic deployments from Git** 已啟用
4. 設定 **Production Branch** 為 `posthog`（如果要將 posthog 作為生產分支）
   - 或保持 `main`，`posthog` 會自動部署為 Preview

### 設定分支保護規則（可選）

如果您想將 `posthog` 分支部署為 Preview，但保持 `main` 為 Production：

1. 在 Vercel 設定中，`posthog` 分支會自動建立 Preview 部署
2. 每次推送到 `posthog` 分支時，Vercel 會自動建立新的 Preview 部署
3. Preview 部署會有獨立的 URL，例如：`todo-multi-users-git-posthog-username.vercel.app`

## 部署前檢查清單

### 1. 確認程式碼已提交

```bash
# 檢查是否有未提交的變更
git status

# 如果有變更，提交它們
git add .
git commit -m "Add PostHog integration"
```

### 2. 確認分支已推送

```bash
# 檢查遠端分支
git branch -r

# 如果 posthog 分支還沒推送
git push origin posthog
```

### 3. 確認環境變數已設定

在 Vercel Dashboard 中確認以下環境變數已設定：

- ✅ `NEXT_PUBLIC_POSTHOG_KEY`
- ✅ `NEXT_PUBLIC_POSTHOG_HOST`
- ✅ `POSTHOG_API_KEY`（用於分析儀表板）
- ✅ `POSTHOG_PROJECT_ID`（用於分析儀表板）
- ✅ 其他現有的環境變數（DATABASE_URL, NEXTAUTH_SECRET 等）

### 4. 確認建置設定正確

檢查 `vercel.json` 和 `package.json` 中的建置指令：

- `vercel-build` 指令應包含 Prisma 生成和遷移
- 已包含 `--webpack` 標誌（Next.js 16 需要）

## 部署後驗證

### 1. 檢查部署狀態

1. 在 Vercel Dashboard 的 **Deployments** 頁面查看部署狀態
2. 確認建置成功（綠色勾號）
3. 如果有錯誤，查看建置日誌

### 2. 驗證 PostHog 追蹤

1. 訪問部署的網站
2. 開啟瀏覽器開發者工具（F12）
3. 前往 **Console** 標籤
4. 應該看到 PostHog 相關的日誌（如果設定了 debug 模式）
5. 執行一些操作（登入、建立 Todo 等）
6. 在 PostHog Dashboard 的 **Activity** 頁面檢查事件是否出現

### 3. 驗證分析儀表板

1. 訪問 `https://your-deployment.vercel.app/analytics`
2. 確認頁面正常載入
3. 如果顯示 "PostHog API not configured"，檢查：
   - `POSTHOG_API_KEY` 是否正確設定
   - `POSTHOG_PROJECT_ID` 是否正確設定
   - 環境變數是否已套用到正確的環境

## 常見問題

### Q: 部署失敗，顯示 Prisma 錯誤？

**A:** 確認 `vercel-build` 指令包含：

```json
"vercel-build": "prisma generate --schema=./prisma/schema.prisma && prisma migrate deploy --schema=./prisma/schema.prisma && next build --webpack"
```

### Q: PostHog 事件沒有出現？

**A:** 檢查：

1. `NEXT_PUBLIC_POSTHOG_KEY` 是否正確設定
2. 環境變數是否已套用到 Production/Preview 環境
3. 是否已重新部署（環境變數變更需要重新部署）
4. 瀏覽器 Console 是否有錯誤

### Q: 分析儀表板顯示 "API not configured"？

**A:** 確認：

1. `POSTHOG_API_KEY` 和 `POSTHOG_PROJECT_ID` 已設定
2. 這些是伺服器端環境變數（不需要 `NEXT_PUBLIC_` 前綴）
3. 已重新部署以套用環境變數

### Q: 如何將 posthog 分支設為 Production？

**A:**

1. 在 Vercel Dashboard → Settings → Git
2. 將 **Production Branch** 改為 `posthog`
3. 下次推送到 `posthog` 分支時會自動部署到 Production

### Q: 如何同時部署 main 和 posthog 分支？

**A:**

- `main` 分支：設為 Production Branch，部署到 Production
- `posthog` 分支：自動部署為 Preview，URL 為 `project-git-posthog-username.vercel.app`

## 快速部署指令

如果您想快速部署，可以使用以下指令：

```bash
# 1. 確認在 posthog 分支
git checkout posthog

# 2. 確保所有變更已提交
git add .
git commit -m "Deploy PostHog integration"

# 3. 推送到遠端
git push origin posthog

# 4. 使用 Vercel CLI 部署（可選）
vercel --prod
```

## 下一步

部署完成後：

1. **測試事件追蹤**

   - 在生產環境執行操作
   - 在 PostHog Dashboard 驗證事件

2. **設定自訂儀表板**

   - 在 PostHog 中建立 Insights
   - 設定告警規則

3. **監控部署**
   - 定期檢查 Vercel 部署日誌
   - 監控 PostHog 事件流量

---

**最後更新**：2025-01-XX
