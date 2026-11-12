import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "玄幻書庫 | PTT CFantasy 小說熱度排行榜",
  description: "彙整 PTT CFantasy 玄幻小說板的推薦、嘗毒、實況與討論，依討論度排出小說排行榜，可用關鍵字搜尋。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
