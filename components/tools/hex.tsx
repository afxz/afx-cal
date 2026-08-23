"use client";

import { Converter } from "@/components/ui";
import { utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes } from "@/lib/utils";

export default function HexTool() {
  return (
    <Converter
      placeholder={"文本或十六进制字符串…"}
      encode={(text, opts) => {
        const hex = bytesToHex(utf8ToBytes(text));
        if (opts["format"] === "space") return hex.match(/.{1,2}/g)?.join(" ") ?? "";
        if (opts["format"] === "0x") return "0x" + hex;
        return hex;
      }}
      decode={(text, opts) => {
        const bytes = hexToBytes(text);
        if (!bytes) throw new Error("无效的十六进制字符串（需为偶数个十六进制字符）");
        return bytesToUtf8(bytes);
      }}
      options={({ opts, set }) => (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          输出格式
          <select
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={opts["format"] ?? "plain"}
            onChange={(e) => set({ format: e.target.value })}
          >
            <option value="plain">连续（如 48656c6c6f）</option>
            <option value="space">空格分隔</option>
            <option value="0x">0x 前缀</option>
          </select>
        </label>
      )}
    />
  );
}
