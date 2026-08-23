"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, ErrorBox, selectCls, isErr } from "@/components/ui";
import {
  parseDateLocal, countBusinessDays, addBusinessDays, parseHolidayText,
  dateKey, formatInZone,
} from "@/lib/utils";

const MODES = [
  ["range", "区间统计"],
  ["calc", "推算日期"],
] as const;

export default function WorkdayTool() {
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("range");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [holidays, setHolidays] = useState("");
  const [extras, setExtras] = useState("");
  const [n, setN] = useState("10");

  const holidaysSet = useMemo(() => parseHolidayText(holidays), [holidays]);
  const extrasSet = useMemo(() => parseHolidayText(extras), [extras]);

  const range = useMemo(() => {
    const s = parseDateLocal(start);
    const e = parseDateLocal(end);
    if (!s || !e) return { error: "请输入有效日期" };
    if (s.getTime() > e.getTime()) return { error: "起始日期不能晚于结束日期" };
    const r = countBusinessDays(s, e, holidaysSet, extrasSet);
    return {
      ...r,
      startKey: dateKey(s),
      endKey: dateKey(e),
    };
  }, [start, end, holidaysSet, extrasSet]);

  const calc = useMemo(() => {
    const s = parseDateLocal(start);
    if (!s) return { error: "请输入有效起始日期" };
    const v = parseInt(n);
    if (!Number.isFinite(v)) return { error: "请输入有效工作日数量" };
    const out = addBusinessDays(s, v, holidaysSet, extrasSet);
    if (!out) return { error: "计算失败" };
    return {
      outKey: dateKey(out),
      weekday: formatInZone(out, "Asia/Shanghai", { weekday: "long" }),
      weekendsSkipped: 0,
    };
  }, [start, n, holidaysSet, extrasSet]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {MODES.map(([v, l]) => (
          <button
            key={v}
            type="button"
            className={
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (mode === v ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400")
            }
            onClick={() => setMode(v)}
          >
            {l}
          </button>
        ))}
      </div>
      {mode === "range" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">起始日期</span>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">结束日期</span>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                法定节假日（每行一个日期：2025-10-01 或 10-01）
              </span>
              <textarea
                rows={4}
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
                placeholder={"2025-10-01\n2025-10-02"}
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-[13px] text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">调休补班日（周末上班，每行一个日期）</span>
              <textarea
                rows={4}
                value={extras}
                onChange={(e) => setExtras(e.target.value)}
                placeholder={"2025-09-28"}
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-[13px] text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          {isErr(range) ? (
            <ErrorBox msg={range.error} />
          ) : range ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="px-4">
                <KeyValue k="区间" v={`${range.startKey} ~ ${range.endKey}`} mono />
                <KeyValue k="总天数" v={range.total + " 天"} mono />
                <KeyValue k="工作日（净）" v={range.workdays + " 天"} />
                <KeyValue k="周末" v={range.weekends + " 天"} />
                <KeyValue k="节假日排除" v={range.holidays + " 天"} />
                <KeyValue k="调休补班" v={range.extras + " 天"} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">起始日期</span>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">第 N 个工作日（含起始日，可负）</span>
              <Input type="number" value={n} onChange={(e) => setN(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">法定节假日 / 调休（可选，同上格式）</span>
            <textarea
              rows={3}
              value={holidays}
              onChange={(e) => setHolidays(e.target.value)}
              placeholder={"2025-10-01"}
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-[13px] text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          {isErr(calc) ? (
            <ErrorBox msg={calc.error} />
          ) : calc ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="px-4">
                <KeyValue k="结果日期" v={calc.outKey} mono />
                <KeyValue k="星期" v={calc.weekday} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
