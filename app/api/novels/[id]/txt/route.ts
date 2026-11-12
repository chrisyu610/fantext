import fs from "node:fs";
import { Readable } from "node:stream";
import { findLibraryFile, getNovel } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: RouteContext<"/api/novels/[id]/txt">) {
  const { id } = await ctx.params;
  const novel = getNovel(id);
  if (!novel) return new Response("找不到這本小說", { status: 404 });
  const file = findLibraryFile(novel);
  if (!file) return new Response("本站尚未收錄這本書的授權全文", { status: 404 });

  const { size } = fs.statSync(file);
  const stream = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(novel.name)}.txt`,
    },
  });
}
