export function timeAgo(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const day = 86_400_000;
  if (diff < day) return "今天";
  const d = Math.floor(diff / day);
  if (d < 30) return `${d} 天前`;
  if (d < 365) return `${Math.floor(d / 30)} 個月前`;
  return `${Math.floor(d / 365)} 年前`;
}

export function dateStr(ts: number): string {
  return new Date(ts).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" });
}
