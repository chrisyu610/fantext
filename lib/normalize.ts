import * as OpenCC from "opencc-js";

const toTW = OpenCC.Converter({ from: "cn", to: "tw" });

/** Collapse simplified/traditional variants, punctuation, spacing and case so names compare equal. */
export function normalizeKey(input: string): string {
  return toTW(input)
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function isTraditional(input: string): boolean {
  return toTW(input) === input;
}
