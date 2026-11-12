export interface Post {
  aid: string;
  title: string;
  author: string;
  push: number;
  comments: number;
  ts: number;
}

export interface NovelPost {
  aid: string;
  tag: string;
  title: string;
  author: string;
  push: number;
  comments: number;
  ts: number;
}

export interface Novel {
  id: string;
  name: string;
  aliases: string[];
  posts: NovelPost[];
  firstTs: number;
  lastTs: number;
  hasTxt: boolean;
}

export interface RankedNovel extends Novel {
  score: number;
  postCount: number;
  pushTotal: number;
  commentTotal: number;
  recommendCount: number;
}

export type Period = "7d" | "30d" | "90d" | "all";
