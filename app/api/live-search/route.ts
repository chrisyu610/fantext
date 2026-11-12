import { NextRequest, NextResponse } from "next/server";
import { searchBoardTitles } from "@/lib/pttweb";
import { pttUrl } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 50);
  if (!q) return NextResponse.json({ posts: [] });
  try {
    const posts = await searchBoardTitles(q);
    return NextResponse.json({
      posts: posts
        .filter((p) => !/^\[公告\]/.test(p.title))
        .slice(0, 20)
        .map((p) => ({ ...p, url: pttUrl(p.aid) })),
    });
  } catch {
    return NextResponse.json({ posts: [], error: "即時搜尋暫時無法使用" }, { status: 502 });
  }
}
