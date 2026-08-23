"use client";

import { Converter } from "@/components/ui";
import { utf8ToBytes, bytesToUtf8, bytesToBase64, base64ToBytes, bytesToBase64Url, base64UrlToBytes } from "@/lib/utils";

export default function Base64Tool() {
  return (
    <Converter
      placeholder={"Base64 文本，或待编码的字符串…"}
      encode={(text, opts) => {
        const b64 = bytesToBase64(utf8ToBytes(text));
        return opts["variant"] === "url" ? bytesToBase64Url(utf8ToBytes(text)) : b64;
      }}
      decode={(text, opts) => {
        const bytes = opts["variant"] === "url" ? base64UrlToBytes(text) : base64ToBytes(text);
        if (!bytes) throw new Error("无效的 Base64 字符串");
        return bytesToUtf8(bytes);
      }}
      options={({ opts, set }) => (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
            checked={opts["variant"] === "url"}
            onChange={(e) => set({ variant: e.target.checked ? "url" : "std" })}
          />
          URL-safe 变体（- _ 无填充）
        </label>
      )}
    />
  );
}
