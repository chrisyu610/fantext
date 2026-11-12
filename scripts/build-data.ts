import fs from "node:fs";
import path from "node:path";
import { aggregate } from "../lib/aggregate";
import type { Post } from "../lib/types";

const dir = path.join(process.cwd(), "data");
const posts = JSON.parse(fs.readFileSync(path.join(dir, "posts.json"), "utf8")) as Post[];
const novels = aggregate(posts);
const updatedAt = Math.max(...posts.map((p) => p.ts));
fs.writeFileSync(
  path.join(dir, "novels.json"),
  JSON.stringify({ updatedAt, generatedAt: Date.now(), postCount: posts.length, novels }),
);
console.log(`${novels.length} novels from ${posts.length} posts`);
const top = novels
  .map((n) => ({ n: n.name, c: n.posts.length, s: n.posts.reduce((a, p) => a + p.push, 0) }))
  .sort((a, b) => b.c - a.c)
  .slice(0, 40);
console.log(top.map((t) => `${t.n} posts=${t.c} push=${t.s}`).join("\n"));
