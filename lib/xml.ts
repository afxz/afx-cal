/** XML 缩进美化（纯函数，可独立测试） */
export function formatXml(input: string): string {
  const tokens = input.matchAll(/(<\/?[^>]+>|[^<]+)/g);
  let out = "";
  let depth = 0;
  for (const m of tokens) {
    const tok = m[0];
    if (tok.startsWith("<")) {
      const isClose = /^<\/\s*/.test(tok);
      const isSelfOrSpecial = /\/\s*>$/.test(tok) || /^<[!?]/.test(tok) || /^<!\[CDATA\[/.test(tok);
      if (isClose) depth = Math.max(0, depth - 1);
      out += (out ? "\n" : "") + "  ".repeat(isClose ? depth : depth) + tok;
      if (!isClose && !isSelfOrSpecial) depth++;
    } else {
      const t = tok.trim();
      if (!t) continue;
      out += (out ? "\n" : "") + "  ".repeat(depth) + t;
    }
  }
  return out;
}
