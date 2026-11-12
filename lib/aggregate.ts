import type { Novel, NovelPost, Post } from "./types";
import { extractName, isNameFirstTag, NOVEL_TAGS, parseTitle } from "./extract";
import { isTraditional, normalizeKey } from "./normalize";

interface Bucket {
  key: string;
  names: Map<string, number>;
  posts: NovelPost[];
}

const MIN_KEY_LEN_FOR_MATCH = 3;

export function aggregate(posts: Post[]): Novel[] {
  const buckets = new Map<string, Bucket>();
  const assigned = new Set<string>();

  const add = (key: string, name: string, p: Post, tag: string) => {
    let b = buckets.get(key);
    if (!b) {
      b = { key, names: new Map(), posts: [] };
      buckets.set(key, b);
    }
    b.names.set(name, (b.names.get(name) ?? 0) + 1);
    b.posts.push({
      aid: p.aid,
      tag,
      title: p.title.replace(/^(?:Re:\s*)+/i, ""),
      author: p.author,
      push: p.push,
      comments: p.comments,
      ts: p.ts,
    });
    assigned.add(p.aid);
  };

  for (const p of posts) {
    const parsed = parseTitle(p.title);
    if (!parsed) continue;
    const quoted = /[《〈「『].{2,30}?[》〉」』]/.test(parsed.body);
    if (!isNameFirstTag(parsed.tag) && !(parsed.tag === "討論" && quoted)) continue;
    const name = extractName(parsed.tag, parsed.body);
    if (!name) continue;
    const key = normalizeKey(name);
    if (key.length < 2) continue;
    add(key, name, p, parsed.tag);
  }

  const dictionary = [...buckets.values()]
    .filter((b) => b.key.length >= MIN_KEY_LEN_FOR_MATCH)
    .filter((b) => b.posts.length >= 2 || b.posts.some((x) => x.push >= 10))
    .map((b) => b.key)
    .sort((a, b) => b.length - a.length);

  const matchable = new Set(["討論", "閒聊", "情報", "求書", "新聞", "分享", "心得", "書評", "問題", "原創"]);
  for (const p of posts) {
    if (assigned.has(p.aid)) continue;
    const parsed = parseTitle(p.title);
    if (!parsed || !matchable.has(parsed.tag)) continue;
    const hay = normalizeKey(parsed.body);
    const hit = dictionary.find((k) => hay.includes(k));
    if (hit) add(hit, buckets.get(hit)!.names.keys().next().value as string, p, parsed.tag);
  }

  const novels: Novel[] = [];
  for (const b of buckets.values()) {
    const totalPush = b.posts.reduce((s, x) => s + Math.max(0, x.push), 0);
    if (b.posts.length < 2 && totalPush < 5) continue;
    const ranked = [...b.names.entries()].sort((a, c) => {
      const ta = isTraditional(a[0]) ? 1 : 0;
      const tc = isTraditional(c[0]) ? 1 : 0;
      return tc - ta || c[1] - a[1];
    });
    const name = ranked[0][0];
    const posts = b.posts.sort((x, y) => y.ts - x.ts);
    novels.push({
      id: b.key,
      name,
      aliases: ranked.slice(1).map((r) => r[0]),
      posts,
      firstTs: posts[posts.length - 1].ts,
      lastTs: posts[0].ts,
      hasTxt: false,
    });
  }
  return novels;
}

export function postWeight(p: NovelPost): number {
  const tagWeight = NOVEL_TAGS[p.tag] ?? 1;
  return tagWeight * (2 + Math.max(0, p.push) + 0.5 * p.comments);
}
