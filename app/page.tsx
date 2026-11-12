import Link from "next/link";
import { LiveResults } from "@/components/LiveResults";
import { NovelRow } from "@/components/NovelRow";
import { dateStr } from "@/components/format";
import { datasetInfo, getRanking, PERIODS, searchNovels } from "@/lib/data";
import type { Period } from "@/lib/types";

export default async function Home(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 50) ?? "";
  const periodParam = Array.isArray(sp.period) ? sp.period[0] : sp.period;
  const period: Period = PERIODS.some((p) => p.id === periodParam) ? (periodParam as Period) : "30d";

  const info = datasetInfo();
  const now = info.updatedAt;
  const results = q ? searchNovels(q) : null;
  const ranking = q ? [] : getRanking(period).slice(0, 100);
  const list = results ?? ranking;
  const max = Math.max(1, ...list.map((n) => n.score));

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
      <header className="pt-10 pb-6 sm:pt-14">
        <p className="text-sm font-medium tracking-widest text-accent">PTT · CFantasy</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">玄幻書庫</h1>
        <p className="mt-3 text-muted">
          統計玄幻小說板的推薦、嘗毒、實況與討論，依討論熱度排出小說榜單。
        </p>
        <form action="/" method="get" className="mt-6 flex gap-2" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="搜尋書名，例如：仙人消失之後"
            aria-label="搜尋小說"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90"
          >
            搜尋
          </button>
        </form>
      </header>

      {q ? (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              「{q}」的搜尋結果
              <span className="ml-2 text-sm font-normal text-muted">{list.length} 本</span>
            </h2>
            <Link href="/" className="text-sm text-accent hover:underline">
              返回排行榜
            </Link>
          </div>
          {list.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted">
              排行榜中沒有符合的小說。可以試試書名的部分字詞，或參考下方的看板即時搜尋結果。
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((n) => (
                <NovelRow key={n.id} novel={n} max={max} now={now} />
              ))}
            </ul>
          )}
          <LiveResults query={q} />
        </section>
      ) : (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">熱度排行榜</h2>
            <nav className="flex rounded-lg border border-border bg-card p-1 text-sm" aria-label="統計區間">
              {PERIODS.map((p) => (
                <Link
                  key={p.id}
                  href={`/?period=${p.id}`}
                  aria-current={p.id === period ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 transition ${
                    p.id === period ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </div>
          <ul className="space-y-3">
            {ranking.map((n, i) => (
              <NovelRow key={n.id} novel={n} rank={i + 1} max={max} now={now} />
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        <p>
          資料來源：PTT CFantasy 板公開文章標題與推文數，共 {info.postCount.toLocaleString()} 篇，最新到 {dateStr(info.updatedAt)}。
          熱度 = 各篇文章（推薦 ×3、嘗毒／討論 ×2、實況 ×1）以推文與回應數加權後加總。
        </p>
        <p className="mt-2">本站不存放未經授權的小說全文，請支持作者與正版平台。</p>
      </footer>
    </div>
  );
}
