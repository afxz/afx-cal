"use client";

import { Converter } from "@/components/ui";

export default function UrlTool() {
  return (
    <Converter
      placeholder={"URL / 需要编码的字符串…"}
      encode={(text, opts) => {
        const out = encodeURIComponent(text);
        return opts["space"] === "plus" ? out.replace(/%20/g, "+") : out;
      }}
      decode={(text, opts) => {
        const t = opts["space"] === "plus" ? text.replace(/\+/g, " ") : text;
        try {
          return decodeURIComponent(t);
        } catch {
          throw new Error("无效的百分号编码");
        }
      }}
      options={({ opts, set }) => (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
            checked={opts["space"] === "plus"}
            onChange={(e) => set({ space: e.target.checked ? "plus" : "pct" })}
          />
          空格编码为 +（表单风格）
        </label>
      )}
    />
  );
}
