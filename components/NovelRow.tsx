import Link from "next/link";
import type { RankedNovel } from "@/lib/types";
import { timeAgo } from "./format";

export function NovelRow({ novel, rank, max, now }: { novel: RankedNovel; rank?: number; max: number; now: number }) {
  const pct = Math.max(4, Math.round((novel.score / max) * 100));
  return (
    <li>
      <Link
        href={`/novel/${encodeURIComponent(novel.id)}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition hover:border-accent hover:shadow-sm sm:gap-5 sm:px-5"
      >
        {rank !== undefined && (
          <span
            className={`w-8 shrink-0 text-center text-xl font-bold tabular-nums ${
              rank <= 3 ? "text-accent" : "text-muted"
            }`}
          >
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate text-base font-semibold group-hover:text-accent sm:text-lg">{novel.name}</h3>
            {novel.hasTxt && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent">可下載 TXT</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {novel.recommendCount > 0 && <>推薦 {novel.recommendCount} · </>}
            {novel.postCount} 篇討論 · {novel.pushTotal} 推 · 最近 {timeAgo(novel.lastTs, now)}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="hidden w-16 shrink-0 text-right sm:block">
          <div className="text-lg font-bold tabular-nums">{Math.round(novel.score)}</div>
          <div className="text-xs text-muted">熱度</div>
        </div>
      </Link>
    </li>
  );
}
