"use client";

import { useState } from "react";
import { Input, Field, selectCls } from "@/components/ui";
import { formatNumber } from "@/lib/utils";

export default function PercentTool() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <PercentCard title="求百分比：X 的 Y% 是多少" compute={(x, y) => (x * y) / 100} xLabel="X" yLabel="Y（%）" />
      <PercentCard title="占比：X 是 Y 的百分之几" compute={(x, y) => (x / y) * 100} xLabel="X" yLabel="Y" />
      <PercentCard title="变化率：从 X 变到 Y" compute={(x, y) => ((y - x) / x) * 100} xLabel="X" yLabel="Y" suffix="%" />
      <PercentCard title="增减：X 增加 / 减少 Y%" compute={(x, y, mode) => x * (1 + (mode === "inc" ? y : -y) / 100)} xLabel="X" yLabel="Y（%）" toggle />
    </div>
  );
}

function PercentCard({
  title,
  compute,
  xLabel,
  yLabel,
  suffix = "",
  toggle = false,
}: {
  title: string;
  compute: (x: number, y: number, mode: string) => number;
  xLabel: string;
  yLabel: string;
  suffix?: string;
  toggle?: boolean;
}) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [mode, setMode] = useState("inc");

  const xv = parseFloat(x);
  const yv = parseFloat(y);
  const ok = Number.isFinite(xv) && Number.isFinite(yv);
  const out = ok ? compute(xv, yv, mode) : NaN;

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={xLabel}>
          <Input type="number" value={x} onChange={(e) => setX(e.target.value)} />
        </Field>
        <Field label={yLabel}>
          <Input type="number" value={y} onChange={(e) => setY(e.target.value)} />
        </Field>
      </div>
      {toggle && (
        <div className="mt-2 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {[["inc", "增加"], ["dec", "减少"]].map(([v, l]) => (
            <button
              key={v}
              type="button"
              className={
                "flex-1 rounded-md px-2 py-1 text-xs font-medium transition " +
                (mode === v ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400")
              }
              onClick={() => setMode(v)}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-950">
        <span className="text-zinc-400 dark:text-zinc-500">结果：</span>
        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
          {Number.isFinite(out) ? formatNumber(out, 6) + suffix : "—"}
        </span>
      </div>
    </div>
  );
}
