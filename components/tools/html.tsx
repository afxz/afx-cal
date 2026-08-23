"use client";

import { Converter } from "@/components/ui";
import { escapeHtml, escapeHtmlAll, unescapeHtml } from "@/lib/utils";

export default function HtmlTool() {
  return (
    <Converter
      placeholder={"HTML 文本…"}
      encode={(text, opts) => (opts["all"] === "1" ? escapeHtmlAll(text) : escapeHtml(text))}
      decode={(text) => unescapeHtml(text)}
      options={({ opts, set }) => (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
            checked={opts["all"] === "1"}
            onChange={(e) => set({ all: e.target.checked ? "1" : "0" })}
          />
          非 ASCII 全部转数字实体（如 &amp;#20320;）
        </label>
      )}
    />
  );
}
