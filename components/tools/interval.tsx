"use client";

import { useMemo, useState } from "react";
import { Input, KeyValue, ErrorBox, selectCls, isErr } from "@/components/ui";
import { parseDateLocal, diffYMD, addDays, addMonths, dateKey, formatInZone } from "@/lib/utils";

const MODES = [
  ["diff", "日期间隔"],
  ["add", "日期加减"],
] as const;

export default function IntervalTool() {
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("diff");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [n, setN] = useState("30");
  const [unit, setUnit] = useState("day");

  const diff = useMemo(() => {
    const s = parseDateLocal(start);
    const e = parseDateLocal(end);
    if (!s || !e) return { error: "请输入有效日期" };
    if (s.getTime() > e.getTime()) return { error: "起始日期不能晚于结束日期" };
    const d = diffYMD(s, e);
    const hours = d.totalDays * 24;
    const minutes = hours * 60;
    const seconds = minutes * 60;
    return { ...d, hours, minutes, seconds, weekday: formatInZone(e, "Asia/Shanghai", { weekday: "long" }) };
  }, [start, end]);

  const added = useMemo(() => {
    const s = parseDateLocal(start);
    if (!s) return { error: "请输入有效日期" };
    const v = parseInt(n);
    if (!Number.isFinite(v)) return { error: "请输入有效天数" };
    const out = unit === "month" ? addMonths(s, v) : unit === "year" ? addMonths(s, v * 12) : addDays(s, v);
    return { out, key: dateKey(out), weekday: formatInZone(out, "Asia/Shanghai", { weekday: "long" }) };
  }, [start, n, unit]);

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
      {mode === "diff" ? (
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
          {isErr(diff) ? (
            <ErrorBox msg={diff.error} />
          ) : diff ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="px-4">
                <KeyValue k="相差" v={`${diff.y} 年 ${diff.m} 个月 ${diff.d} 天`} />
                <KeyValue k="总天数" v={diff.totalDays + " 天"} mono />
                <KeyValue k="总小时" v={diff.hours.toLocaleString() + " 小时"} mono />
                <KeyValue k="总分钟" v={diff.minutes.toLocaleString() + " 分钟"} mono />
                <KeyValue k="总秒数" v={diff.seconds.toLocaleString() + " 秒"} mono />
                <KeyValue k="整周数" v={Math.floor(diff.totalDays / 7) + " 周" + (diff.totalDays % 7 ? " " + (diff.totalDays % 7) + " 天" : "")} />
                <KeyValue k="结束日是" v={diff.weekday} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_120px_110px] items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">起始日期</span>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">数值（可负）</span>
              <Input type="number" value={n} onChange={(e) => setN(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">单位</span>
              <select className={selectCls + " w-full"} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="day">天</option>
                <option value="week">周</option>
                <option value="month">月</option>
                <option value="year">年</option>
              </select>
            </label>
          </div>
          {isErr(added) ? (
            <ErrorBox msg={added.error} />
          ) : added ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="px-4">
                <KeyValue k="结果日期" v={added.key} mono />
                <KeyValue k="星期" v={added.weekday} />
              </div>
            </div>
          ) : null}
        </div>
      )}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">注：跨月/跨年按日历计算；日期加减按日历月/年处理（月末溢出按 JS Date 语义）。</p>
    </div>
  );
}
