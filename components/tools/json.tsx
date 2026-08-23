"use client";

import { useState } from "react";
import { TextArea, ResultBox, ErrorBox, selectCls } from "@/components/ui";

export default function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState("2");
  const [sort, setSort] = useState(false);

  const run = (minify: boolean) => {
    try {
      const obj = JSON.parse(input);
      const ind = minify ? 0 : indent === "tab" ? "\t" : Number(indent);
      const out = JSON.stringify(obj, sort ? (k, v) => (Array.isArray(v) ? v : sortKeys(v)) : undefined, ind);
      setOutput(out);
      setError("");
    } catch (e) {
      setOutput("");
      setError("JSON 解析失败：" + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          缩进
          <select className={selectCls} value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
            checked={sort}
            onChange={(e) => setSort(e.target.checked)}
          />
          键排序
        </label>
      </div>
      <TextArea rows={8} placeholder={"粘贴 JSON…"} value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          onClick={() => run(false)}
        >
          格式化
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => run(true)}
        >
          压缩
        </button>
      </div>
      <ErrorBox msg={error} />
      <ResultBox value={output} rows={8} />
    </div>
  );
}

function sortKeys(v: unknown): unknown {
  if (v !== null && typeof v === "object" && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) out[k] = obj[k];
    return out;
  }
  return v;
}
