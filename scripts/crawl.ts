import type { Post } from "../lib/types";
import fs from "node:fs";
import path from "node:path";
import { parseListHtml } from "../lib/pttweb";

const BASE = "https://www.pttweb.cc/bbs/CFantasy";
const PAGES = Number(process.env.PAGES ?? 400);
const CONCURRENCY = 3;
const OUT = path.join(process.cwd(), "data", "posts.json");

async function fetchUrl(url: string): Promise<Post[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; cfantasy-rank/1.0)" },
      });
      if (res.ok) return parseListHtml(await res.text());
      if (res.status === 404) return [];
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  console.warn(`${url} failed`);
  return [];
}

async function latestOffset(): Promise<number> {
  const res = await fetch(BASE, { headers: { "user-agent": "Mozilla/5.0 (compatible; cfantasy-rank/1.0)" } });
  const html = await res.text();
  const orders = [...html.matchAll(/sortOrder:(\d+)/g)].map((m) => Number(m[1]));
  if (!orders.length) throw new Error("cannot determine newest sortOrder");
  return Math.max(...orders);
}

async function main() {
  const max = await latestOffset();
  const all = new Map<string, Post>();
  if (fs.existsSync(OUT) && process.env.FRESH !== "1") {
    for (const p of JSON.parse(fs.readFileSync(OUT, "utf8")) as Post[]) all.set(p.aid, p);
  }
  for (const p of await fetchUrl(BASE)) all.set(p.aid, p);
  let next = 0;
  let done = 0;
  async function worker() {
    while (true) {
      const k = next++;
      if (k >= PAGES) return;
      const offset = max - 15 - 25 * k;
      if (offset < 0) return;
      const posts = await fetchUrl(`${BASE}/page?n=${offset}`);
      for (const p of posts) all.set(p.aid, p);
      done++;
      if (done % 20 === 0) console.log(`${done}/${PAGES} pages, ${all.size} posts`);
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const list = [...all.values()].sort((a, b) => b.ts - a.ts);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(list));
  const oldest = list.length ? new Date(list[list.length - 1].ts).toISOString() : "-";
  console.log(`saved ${list.length} posts, oldest ${oldest}`);
}

if (process.argv[1]?.endsWith("crawl.ts")) void main();
