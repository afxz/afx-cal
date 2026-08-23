"use client";

import { useState } from "react";
import { TextArea, Input, selectCls, Field, CopyButton } from "@/components/ui";
import { bytesToHex } from "@/lib/utils";

function uuidV4(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = bytesToHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default function UuidTool() {
  const [count, setCount] = useState("5");
  const [upper, setUpper] = useState(false);
  const [dashless, setDashless] = useState(false);
  const [items, setItems] = useState<string[]>(() => Array.from({ length: 5 }, uuidV4));

  const generate = () => {
    const n = Math.min(Math.max(parseInt(count) || 1, 1), 1000);
    const list = Array.from({ length: n }, uuidV4).map((u) => {
      let s = u;
      if (upper) s = s.toUpperCase();
      if (dashless) s = s.replace(/-/g, "");
      return s;
    });
    setItems(list);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="生成数量（1-1000）">
          <Input
            type="number"
            min={1}
            max={1000}
            className="w-28"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 accent-indigo-600" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          大写
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 accent-indigo-600" checked={dashless} onChange={(e) => setDashless(e.target.checked)} />
          去除连字符
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            onClick={generate}
          >
            生成
          </button>
          <CopyButton getText={() => items.join("\n")} label="复制全部" />
        </div>
      </div>
      <TextArea rows={Math.min(items.length, 12)} value={items.join("\n")} readOnly className="font-mono" />
      <p className="text-xs text-zinc-400 dark:text-zinc-500">基于 crypto.getRandomValues 的 UUID v4（版本位 4，变体位 10）。</p>
    </div>
  );
}
