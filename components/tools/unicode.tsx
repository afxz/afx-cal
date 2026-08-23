"use client";

import { Converter } from "@/components/ui";
import { unicodeEscape, unicodeUnescape } from "@/lib/utils";

export default function UnicodeTool() {
  return (
    <Converter
      placeholder={"如：你好，世界！或 \\u4f60\\u597d"}
      encode={(text, opts) => unicodeEscape(text, opts["style"] === "brace" ? "brace" : "short")}
      decode={(text) => unicodeUnescape(text)}
      options={({ opts, set }) => (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          转义风格
          <select
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={opts["style"] ?? "short"}
            onChange={(e) => set({ style: e.target.value })}
          >
            <option value="short">\\uXXXX（代理对）</option>
            <option value="brace">{"\\u{...}（码点）"}</option>
          </select>
        </label>
      )}
    />
  );
}
