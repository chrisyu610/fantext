export const NOVEL_TAGS: Record<string, number> = {
  推薦: 3,
  嘗毒: 2,
  嚐毒: 2,
  劇毒: 2,
  有毒: 2,
  毒發: 2,
  心得: 2,
  書評: 2,
  討論: 2,
  實況: 1,
};

/** Tags whose title is expected to be "[tag] <novel name> ..." */
const NAME_FIRST_TAGS = new Set(["推薦", "嘗毒", "嚐毒", "劇毒", "有毒", "毒發", "實況", "心得", "書評"]);

export function parseTitle(raw: string): { tag: string; body: string } | null {
  const m = raw.replace(/^(?:Re:\s*)+/i, "").match(/^\s*\[([^\]]+)\]\s*(.*)$/);
  if (!m) return null;
  return { tag: m[1].trim(), body: m[2].trim() };
}

const NOT_A_NAME =
  /書單|推薦|求書|有人|請問|大家|最近|分享|心得|哪些|有沒有|[？?！!]|起點|晉江|番茄|活動|公告|新書|作者們|各位|版友|小說|好書|榜單|完結|完本書/;

/** Extract a candidate novel name from the body of an [推薦]/[實況]-style title. */
export function extractName(tag: string, body: string): string | null {
  let s = body.replace(/^\s*\[[^\]]*\]\s*/, "").trim();
  const quoted = s.match(/[《〈「『](.{2,30}?)[》〉」』]/);
  if (quoted) {
    s = quoted[1];
  } else {
    s = s
      .replace(/[,，、\s]*(?:作者|作家|著)\s*[:：].*$/, "")
      .replace(/\s+(?:by|BY)\s.*$/, "")
      .replace(/[（(][^）)]*[）)]\s*$/g, "")
      .trim();
    if (NAME_FIRST_TAGS.has(tag) && tag === "實況") {
      s = s.split(/\s+/)[0] ?? "";
    } else {
      s = s
        .replace(/\s+(?:第?\s*\d+\s*[-~]?\s*\d*\s*[章回卷集話]?|番外|終章|尾聲|序章|完).*$/, "")
        .replace(/\s{2,}.*$/, "")
        .trim();
    }
    s = s
      .replace(/(?:第[\d一二三四五六七八九十百千零兩]+[章回卷集話]).*$/, "")
      .replace(/\s*[\d]+(?:[-~]\d+)?$/, "")
      .replace(/[（(][^）)]*$/, "")
      .replace(/[（(]?(?:完本?|完結|全)[)）]?$/, "")
      .trim();
  }
  s = s.replace(/^[\s:：\-–—~、，,.。]+|[\s:：\-–—~、，,.。]+$/g, "");
  if (s.length < 2 || s.length > 26) return null;
  if (NOT_A_NAME.test(s)) return null;
  if (/^[\d\s\p{P}]+$/u.test(s)) return null;
  return s;
}

export function isNameFirstTag(tag: string): boolean {
  return NAME_FIRST_TAGS.has(tag);
}
