import Link from "next/link";
import { notFound } from "next/navigation";
import { dateStr } from "@/components/format";
import { datasetInfo, getNovel, pttUrl } from "@/lib/data";

export default async function NovelPage(props: PageProps<"/novel/[id]">) {
  const { id } = await props.params;
  const novel = getNovel(id);
  if (!novel) notFound();
  const { updatedAt } = datasetInfo();
  const q = encodeURIComponent(novel.name);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
      <header className="pt-8 pb-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 返回排行榜
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{novel.name}</h1>
        {novel.aliases.length > 0 && (
          <p className="mt-1 text-sm text-muted">又名／寫法：{novel.aliases.join("、")}</p>
        )}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["熱度", Math.round(novel.score)],
            ["討論文章", novel.postCount],
            ["推薦文", novel.recommendCount],
            ["總推文", novel.pushTotal],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-muted">
          板上首次出現 {dateStr(novel.firstTs)} · 最近討論 {dateStr(novel.lastTs)}
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">全本 TXT</h2>
        {novel.hasTxt ? (
          <>
            <p className="mt-1 text-sm text-muted">本站已收錄這本書的全文檔案，可直接下載。</p>
            <a
              href={`/api/novels/${encodeURIComponent(novel.id)}/txt`}
              download
              className="mt-4 inline-flex rounded-xl bg-accent px-5 py-2.5 font-medium text-white transition hover:opacity-90"
            >
              下載全本 TXT
            </a>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              這本書尚未收錄授權全文。你可以從下列管道閱讀正版，或請站長把已取得授權的 TXT 放進 library 資料夾後即可提供下載。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {[
                ["起點中文網", `https://www.qidian.com/so/${q}.html`],
                ["晉江文學城", `https://www.jjwxc.net/search.php?kw=${q}`],
                ["Readmoo", `https://readmoo.com/search/keyword?q=${q}`],
                ["Google 搜尋", `https://www.google.com/search?q=${q}+小說`],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 transition hover:border-accent hover:text-accent"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">PTT 相關討論</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
          {novel.posts.slice(0, 50).map((p) => (
            <li key={p.aid}>
              <a
                href={pttUrl(p.aid)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent-soft"
              >
                <span className="shrink-0 rounded bg-border px-1.5 py-0.5 text-xs">{p.tag}</span>
                <span className="min-w-0 flex-1 truncate">{p.title.replace(/^\[[^\]]+\]\s*/, "")}</span>
                <span className="shrink-0 text-xs text-muted">
                  {p.push > 0 ? `${p.push} 推 · ` : ""}
                  {dateStr(p.ts)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {novel.posts.length > 50 && (
          <p className="mt-2 text-xs text-muted">僅顯示最新 50 篇，共 {novel.posts.length} 篇。</p>
        )}
        <p className="mt-4 text-xs text-muted">資料截至 {dateStr(updatedAt)}。</p>
      </section>
    </div>
  );
}
