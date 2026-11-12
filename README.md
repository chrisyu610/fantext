# 玄幻書庫

統計 PTT CFantasy（玄幻小說板）的推薦、嘗毒、實況與討論文章，依討論熱度排出小說排行榜，支援關鍵字搜尋與全本 TXT 下載。

## 功能

- **排行榜**：本週 / 本月 / 近三月 / 全部。熱度 = 各篇文章（推薦 ×3、嘗毒與討論 ×2、實況 ×1）以推文與回應數加權後加總。
- **關鍵字搜尋**：先搜排行榜內的書（繁簡通用），再即時搜尋看板文章標題，涵蓋尚未進榜的新書。
- **全本 TXT 下載**：把已取得授權的檔案放進 `library/`（檔名為書名，如 `仙人消失之後.txt`），比對成功的書就會出現下載按鈕。本站不爬取或存放未經授權的小說全文。

## 執行

```bash
npm install
npm run dev        # http://localhost:4817
```

## 更新資料

```bash
npm run crawl                 # 預設抓最近 400 頁（約 1 萬篇），再重建排行榜資料
PAGES=800 npm run crawl       # 抓更久遠的文章
npm run build-data            # 只用現有 data/posts.json 重建 data/novels.json
```

資料來源為 PTT 網頁鏡像 pttweb.cc（ptt.cc 本站有 Cloudflare 驗證）。書名由文章標題擷取：`lib/extract.ts`；彙整與合併：`lib/aggregate.ts`。
