import { load } from "cheerio";
import type { Post } from "./types";

function parseCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  if (t === "爆") return 100;
  if (/^X\d?$/i.test(t)) return -10;
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

export function parseListHtml(html: string): Post[] {
  const $ = load(html);
  const posts = new Map<string, Post>();
  $("a.e7-article-default").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    const m = href.match(/\/bbs\/CFantasy\/(M\.(\d+)\.A\.[0-9A-F]+)/);
    if (!m) return;
    const aid = m[1];
    if (posts.has(aid)) return;
    const title = $(a).find("span.e7-show-if-device-is-not-xs > span").first().text().trim();
    if (!title) return;
    const container = $(a).closest(".e7-container");
    const push = parseCount(container.find(".e7-recommendScore").text());
    const comments = parseCount(container.find(".e7-recommendCount").text());
    const author = container.find(".e7-meta-container a[href*='/user/']").first().text().trim();
    posts.set(aid, {
      aid,
      title,
      author,
      push,
      comments,
      ts: Number(m[2]) * 1000,
    });
  });
  return [...posts.values()];
}


export const PTT_BOARD_URL = "https://www.pttweb.cc/bbs/CFantasy";

export async function searchBoardTitles(keyword: string): Promise<Post[]> {
  const res = await fetch(`${PTT_BOARD_URL}/search/t/${encodeURIComponent(keyword)}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; cfantasy-rank/1.0)" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  return parseListHtml(await res.text());
}
