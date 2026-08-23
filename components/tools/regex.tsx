"use client";

import { useMemo, useState } from "react";
import { TextArea, Input, selectCls, Field, isErr } from "@/components/ui";
import { escapeHtml } from "@/lib/utils";

export default function RegexTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const result = useMemo(() => {
    if (!pattern) return null;
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
    } catch (e) {
      return { error: "正则无效：" + (e instanceof Error ? e.message : String(e)) };
    }
    // 高亮用（始终全局）
    let hlRe: RegExp;
    try {
      hlRe = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    } catch {
      hlRe = re;
    }
    const matches: { index: number; text: string; groups: string[] }[] = [];
    let html = "";
    let last = 0;
    if (hlRe.global) {
      for (const m of text.matchAll(hlRe)) {
        html += escapeHtml(text.slice(last, m.index)) + '<mark class="bg-amber-200 px-0.5 rounded dark:bg-amber-500/40">' + escapeHtml(m[0]) + "</mark>";
        last = m.index! + m[0].length;
        matches.push({ index: m.index!, text: m[0], groups: m.slice(1) });
      }
    } else {
      const m = re.exec(text);
      if (m) {
        html += escapeHtml(text.slice(0, m.index)) + '<mark class="bg-amber-200 px-0.5 rounded dark:bg-amber-500/40">' + escapeHtml(m[0]) + "</mark>" + escapeHtml(text.slice(m.index! + m[0].length));
        matches.push({ index: m.index!, text: m[0], groups: m.slice(1) });
      } else {
        html = escapeHtml(text);
      }
    }
    html += escapeHtml(text.slice(last));
    return { html, matches };
  }, [pattern, flags, text]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
        <Field label="正则表达式">
          <Input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="如：(\d{4})-(\d{2})" spellCheck={false} />
        </Field>
        <Field label="标志">
          <Input type="text" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gimsu" spellCheck={false} />
        </Field>
      </div>
      <TextArea rows={6} placeholder={"输入要匹配的文本…"} value={text} onChange={(e) => setText(e.target.value)} />
      {result && !isErr(result) && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            匹配结果：{result.matches.length} 处
          </div>
          <div
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
          {result.matches.length > 0 && (
            <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-1.5 font-medium">#</th>
                    <th className="px-3 py-1.5 font-medium">位置</th>
                    <th className="px-3 py-1.5 font-medium">匹配内容</th>
                    <th className="px-3 py-1.5 font-medium">捕获组</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((m, i) => (
                    <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-3 py-1.5 text-zinc-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono text-xs text-zinc-500">{m.index}</td>
                      <td className="max-w-[260px] truncate px-3 py-1.5 font-mono text-xs">{m.text}</td>
                      <td className="px-3 py-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {m.groups.length ? m.groups.map((g, j) => `$${j + 1}=${g}`).join("  ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {isErr(result) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          ⚠ {result.error}
        </div>
      )}
    </div>
  );
}
