"use client";

import { useMemo, useState } from "react";
import { Input, Field } from "@/components/ui";

export default function PxRemTool() {
  const [base, setBase] = useState("16");
  const [px, setPx] = useState("16");
  const [rem, setRem] = useState("1");

  const baseNum = useMemo(() => {
    const n = parseFloat(base);
    return Number.isFinite(n) && n > 0 ? n : 16;
  }, [base]);

  const pxNum = parseFloat(px);
  const remNum = parseFloat(rem);

  const common = useMemo(
    () => [4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64],
    [],
  );

  return (
    <div className="space-y-3">
      <Field label="基准字号（浏览器默认 16px）">
        <Input
          type="number"
          min={1}
          className="w-32"
          value={base}
          onChange={(e) => setBase(e.target.value)}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="像素 px">
          <Input type="number" value={px} onChange={(e) => setPx(e.target.value)} />
        </Field>
        <Field label="rem（= px / 基准字号）">
          <Input
            type="number"
            step={0.01}
            value={Number.isFinite(pxNum) ? (pxNum / baseNum).toFixed(4) : ""}
            readOnly
          />
        </Field>
        <Field label="rem → px">
          <Input
            type="number"
            step={0.01}
            value={Number.isFinite(remNum) ? (remNum * baseNum).toFixed(2) : ""}
            readOnly
          />
        </Field>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">常用值速查（基准 {baseNum}px）</div>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <th className="px-3 py-2 font-medium">px</th>
                <th className="px-3 py-2 font-medium">rem</th>
                <th className="px-3 py-2 font-medium">px</th>
                <th className="px-3 py-2 font-medium">rem</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(common.length / 2) }, (_, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  {[0, 1].map((col) => {
                    const p = common[i * 2 + col];
                    return p === undefined ? (
                      <td key={col} className="px-3 py-1.5" colSpan={2} />
                    ) : (
                      [
                        <td key="a" className="px-3 py-1.5 font-mono text-zinc-700 dark:text-zinc-300">{p}px</td>,
                        <td key="b" className="px-3 py-1.5 font-mono text-zinc-500 dark:text-zinc-400">{(p / baseNum).toFixed(3)}rem</td>,
                      ]
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
