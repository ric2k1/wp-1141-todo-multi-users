# Vercel 部署 posthog 分支快速指南

如果您的 Vercel Dashboard 中沒有看到 "Production Branch" 選項，請按照以下步驟操作：

## 最簡單的方法：推送分支即可

### 步驟 1：推送 posthog 分支

```bash
# 確認目前在 posthog 分支
git checkout posthog

# 確保所有變更已提交
git status

# 如果有未提交的變更，先提交
git add .
git commit -m "Ready for deployment"

# 推送到 GitHub
git push origin posthog
```

### 步驟 2：Vercel 會自動部署

推送完成後，Vercel 會自動：

- 偵測到新的分支推送
- 建立 Preview 部署
- 產生 Preview URL（例如：`your-project-git-posthog-username.vercel.app`）

### 步驟 3：設定環境變數

1. 前往 Vercel Dashboard → 您的專案
2. 進入 **Settings** → **Environment Variables**
3. 新增以下環境變數（套用到 **Production, Preview, Development**）：

   ```
   NEXT_PUBLIC_POSTHOG_KEY=您的 Project API Key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   POSTHOG_API_KEY=您的 Personal API Key
   POSTHOG_PROJECT_ID=您的 Project ID
   ```

4. 點擊 **Save**

### 步驟 4：重新部署以套用環境變數

環境變數設定後，需要重新部署：

1. 前往 **Deployments** 頁面
2. 找到最新的 `posthog` 分支部署
3. 點擊右側的 **...** 選單
4. 選擇 **Redeploy**
5. 確認環境變數已套用

## 手動建立部署（如果自動部署沒觸發）

如果推送後沒有自動部署，可以手動建立：

1. 前往 Vercel Dashboard → 您的專案
2. 進入 **Deployments** 頁面
3. 點擊右上角的 **Create Deployment** 按鈕
4. 選擇：
   - **Branch**: `posthog`
   - **Framework Preset**: Next.js（應該會自動偵測）
5. 點擊 **Deploy**

## 查看部署狀態

1. 在 **Deployments** 頁面可以看到所有部署
2. 每個部署會顯示：
   - 分支名稱（例如：`posthog`）
   - 部署狀態（Building, Ready, Error）
   - Preview URL
3. 點擊部署可以查看詳細日誌

## 將 posthog 分支設為 Production（可選）

如果您想將 `posthog` 分支的部署設為 Production：

1. 在 **Deployments** 頁面找到 `posthog` 分支的部署
2. 點擊該部署右側的 **...** 選單
3. 選擇 **Promote to Production**

或者：

1. 前往 **Settings** → **General**
2. 找到 **Production Branch** 或 **Git** 相關設定
3. 如果看到分支選擇器，選擇 `posthog`

## 常見問題

### Q: 推送後沒有自動部署？

**A:** 檢查：

1. Vercel 專案是否已連結到正確的 GitHub 倉庫
2. 在 Vercel Dashboard → Settings → Git 確認倉庫連結正確
3. 檢查 GitHub 是否有推送成功

### Q: 如何確認分支已連結？

**A:**

1. 前往 Settings → Git
2. 確認 **Repository** 顯示正確的 GitHub 倉庫
3. 確認 **Production Branch** 或分支設定正確

### Q: Preview 部署和 Production 部署的差別？

**A:**

- **Preview 部署**：每次推送分支時自動建立，URL 包含分支名稱
- **Production 部署**：只有 Production Branch 的推送會觸發，使用主要網域

## 快速檢查清單

- [ ] `posthog` 分支已推送到 GitHub
- [ ] Vercel 專案已連結到正確的 GitHub 倉庫
- [ ] 環境變數已在 Vercel 中設定
- [ ] 已重新部署以套用環境變數
- [ ] 部署狀態為 "Ready"
- [ ] 可以訪問 Preview URL 並測試功能

---

**提示**：即使沒有看到 "Production Branch" 選項，只要推送分支，Vercel 會自動建立 Preview 部署。這是正常行為！
