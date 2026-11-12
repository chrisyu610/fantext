import fs from "node:fs";
import path from "node:path";
import { postWeight } from "./aggregate";
import { normalizeKey } from "./normalize";
import type { Novel, Period, RankedNovel } from "./types";

interface Dataset {
  updatedAt: number;
  generatedAt: number;
  postCount: number;
  novels: Novel[];
}

const DAY = 86_400_000;
export const PERIODS: { id: Period; label: string; days: number | null }[] = [
  { id: "7d", label: "本週", days: 7 },
  { id: "30d", label: "本月", days: 30 },
  { id: "90d", label: "近三月", days: 90 },
  { id: "all", label: "全部", days: null },
];

const LIBRARY_DIR = path.join(process.cwd(), "library");

let cache: Dataset | null = null;
function dataset(): Dataset {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "novels.json"), "utf8")) as Dataset;
  }
  return cache;
}

export function datasetInfo() {
  const d = dataset();
  return { updatedAt: d.updatedAt, generatedAt: d.generatedAt, postCount: d.postCount, novelCount: d.novels.length };
}

function libraryFiles(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(LIBRARY_DIR)) return map;
  for (const f of fs.readdirSync(LIBRARY_DIR)) {
    if (!f.toLowerCase().endsWith(".txt")) continue;
    map.set(normalizeKey(f.replace(/\.txt$/i, "")), f);
  }
  return map;
}

export function findLibraryFile(novel: Novel): string | null {
  const lib = libraryFiles();
  for (const name of [novel.name, ...novel.aliases]) {
    const f = lib.get(normalizeKey(name));
    if (f) return path.join(LIBRARY_DIR, f);
  }
  return null;
}

function rankOne(n: Novel, since: number | null, lib: Map<string, string>): RankedNovel | null {
  const posts = since === null ? n.posts : n.posts.filter((p) => p.ts >= since);
  if (!posts.length) return null;
  let score = 0;
  let pushTotal = 0;
  let commentTotal = 0;
  let recommendCount = 0;
  for (const p of posts) {
    score += postWeight(p);
    pushTotal += Math.max(0, p.push);
    commentTotal += p.comments;
    if (p.tag === "推薦") recommendCount++;
  }
  const hasTxt = [n.name, ...n.aliases].some((x) => lib.has(normalizeKey(x)));
  return { ...n, posts, hasTxt, score, postCount: posts.length, pushTotal, commentTotal, recommendCount };
}

export function getRanking(period: Period): RankedNovel[] {
  const d = dataset();
  const days = PERIODS.find((p) => p.id === period)?.days ?? null;
  const since = days === null ? null : d.updatedAt - days * DAY;
  const lib = libraryFiles();
  return d.novels
    .map((n) => rankOne(n, since, lib))
    .filter((n): n is RankedNovel => n !== null)
    .sort((a, b) => b.score - a.score);
}

export function getNovel(rawId: string): RankedNovel | null {
  let id = rawId;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    /* keep raw */
  }
  const n = dataset().novels.find((x) => x.id === id || x.id === rawId);
  return n ? rankOne(n, null, libraryFiles()) : null;
}

export function searchNovels(query: string): RankedNovel[] {
  const q = normalizeKey(query);
  if (!q) return [];
  const lib = libraryFiles();
  const results: { n: RankedNovel; rel: number }[] = [];
  for (const novel of dataset().novels) {
    const names = [novel.name, ...novel.aliases].map(normalizeKey);
    let rel = 0;
    if (names.some((k) => k === q)) rel = 4;
    else if (names.some((k) => k.startsWith(q))) rel = 3;
    else if (names.some((k) => k.includes(q))) rel = 2;
    else if (novel.posts.some((p) => normalizeKey(p.title).includes(q))) rel = 1;
    if (!rel) continue;
    const ranked = rankOne(novel, null, lib);
    if (ranked) results.push({ n: ranked, rel });
  }
  return results.sort((a, b) => b.rel - a.rel || b.n.score - a.n.score).map((r) => r.n);
}

export function pttUrl(aid: string): string {
  return `https://www.ptt.cc/bbs/CFantasy/${aid}.html`;
}
