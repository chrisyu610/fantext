"use client";

import { useEffect, useState } from "react";

interface LivePost {
  aid: string;
  title: string;
  author: string;
  push: number;
  ts: number;
  url: string;
}

export function LiveResults({ query }: { query: string }) {
  const [state, setState] = useState<{ q: string; posts: LivePost[]; error?: string } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/live-search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setState({ q: query, posts: d.posts ?? [], error: d.error }))
      .catch((e) => {
        if (e.name !== "AbortError") setState({ q: query, posts: [], error: "即時搜尋暫時無法使用" });
      });
    return () => ctrl.abort();
  }, [query]);

  const loading = !state || state.q !== query;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">PTT 看板即時搜尋</h2>
      <p className="mt-1 text-sm text-muted">直接搜尋 CFantasy 板的文章標題，涵蓋尚未進入排行榜的新書。</p>
      {loading ? (
        <ul className="mt-4 space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-12 animate-pulse rounded-lg bg-border/60" />
          ))}
        </ul>
      ) : state.error ? (
        <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted">{state.error}</p>
      ) : state.posts.length === 0 ? (
        <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted">板上沒有標題含「{query}」的文章。</p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {state.posts.map((p) => (
            <li key={p.aid}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-accent-soft"
              >
                <span className="min-w-0 truncate">{p.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {p.push > 0 ? `${p.push} 推 · ` : ""}
                  {new Date(p.ts).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" })}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
