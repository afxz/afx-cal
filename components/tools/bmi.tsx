"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, selectCls } from "@/components/ui";
import { bmiCalc, formatNumber } from "@/lib/utils";

const LEVEL_STYLE: Record<string, string> = {
  low: "text-sky-600 dark:text-sky-400",
  ok: "text-emerald-600 dark:text-emerald-400",
  high: "text-amber-600 dark:text-amber-400",
};

export default function BmiTool() {
  const [unit, setUnit] = useState("metric");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("70");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("9");
  const [lb, setLb] = useState("154");

  const result = useMemo(() => {
    const metric = unit === "metric";
    const h = metric ? parseFloat(cm) : parseFloat(ft) * 30.48 + parseFloat(inch) * 2.54;
    const w = metric ? parseFloat(kg) : parseFloat(lb) * 0.45359237;
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
    const r = bmiCalc(h, w);
    return {
      ...r,
      h,
      w,
      rangeMetric: `${formatNumber(r.healthyMin, 1)} ~ ${formatNumber(r.healthyMax, 1)} kg`,
      rangeImperial: `${formatNumber(r.healthyMin / 0.45359237, 1)} ~ ${formatNumber(r.healthyMax / 0.45359237, 1)} lb`,
      pos: Math.min(100, Math.max(0, ((r.bmi - 14) / (35 - 14)) * 100)),
    };
  }, [unit, cm, kg, ft, inch, lb]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {[["metric", "公制（cm / kg）"], ["imperial", "英制（ft / lb）"]].map(([v, l]) => (
          <button
            key={v}
            type="button"
            className={
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (unit === v ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400")
            }
            onClick={() => setUnit(v)}
          >
            {l}
          </button>
        ))}
      </div>
      {unit === "metric" ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="身高（cm）">
            <Input type="number" value={cm} onChange={(e) => setCm(e.target.value)} />
          </Field>
          <Field label="体重（kg）">
            <Input type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
          </Field>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="身高（英尺）">
              <Input type="number" value={ft} onChange={(e) => setFt(e.target.value)} />
            </Field>
            <Field label="身高（英寸）">
              <Input type="number" value={inch} onChange={(e) => setInch(e.target.value)} />
            </Field>
          </div>
          <Field label="体重（磅）">
            <Input type="number" value={lb} onChange={(e) => setLb(e.target.value)} />
          </Field>
        </div>
      )}
      {result ? (
        <>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">BMI</span>
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{formatNumber(result.bmi, 1)}</span>
            </div>
            <div className={`mt-1 text-right text-sm font-medium ${LEVEL_STYLE[result.level]}`}>{result.category}</div>
            <div className="relative mt-3 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500">
              <div
                className="absolute -top-1 h-4.5 w-1 rounded-full bg-zinc-900 shadow ring-2 ring-white dark:bg-white dark:ring-zinc-900"
                style={{ left: `calc(${result.pos}% - 2px)` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
              <span>14</span>
              <span>18.5</span>
              <span>24</span>
              <span>28</span>
              <span>35</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="健康体重范围（公制）" v={result.rangeMetric} />
              <KeyValue k="健康体重范围（英制）" v={result.rangeImperial} />
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">分类标准（中国）：&lt;18.5 偏瘦，18.5-23.9 正常，24-27.9 超重，≥28 肥胖。</p>
        </>
      ) : (
        <div className="text-sm text-zinc-400">请输入有效的身高与体重</div>
      )}
    </div>
  );
}
