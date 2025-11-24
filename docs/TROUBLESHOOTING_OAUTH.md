# OAuth 本地開發問題排查指南

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

| 錯誤訊息                | 原因                                    | 解決方案                                                                |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `redirect_uri_mismatch` | 重新導向 URI 未在 Google Console 中設定 | 在 Google Console 新增 `http://localhost:3000/api/auth/callback/google` |
| `invalid_client`        | 客戶端 ID 或 Secret 錯誤                | 檢查 `.env` 檔案中的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`       |
| `access_denied`         | 使用者拒絕了 OAuth 授權                 | 重新登入，確保點擊「允許」                                              |
| `Configuration`         | NextAuth 設定錯誤                       | 檢查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET`                                |
| `Verification`          | OAuth 驗證失敗                          | 通常是重新導向 URI 或環境變數問題                                       |

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
