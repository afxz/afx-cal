"use client";

import { useMemo, useState } from "react";
import { Input, KeyValue, ErrorBox, isErr } from "@/components/ui";
import { parseDateLocal, ageAt, dateKey, formatInZone, startOfDay } from "@/lib/utils";

export default function AgeTool() {
  const [birth, setBirth] = useState("");
  const [at, setAt] = useState("");

  const result = useMemo(() => {
    const b = parseDateLocal(birth);
    if (!b) return { error: "请输入有效的出生日期" };
    const atDate = at ? parseDateLocal(at) : null;
    if (at && !atDate) return { error: "请输入有效的截止日期" };
    const target = atDate ?? new Date();
    if (startOfDay(b).getTime() > startOfDay(target).getTime()) return { error: "出生日期不能晚于截止日期" };
    const r = ageAt(b, target);
    const next = formatInZone(r.nextBirthday, "Asia/Shanghai", { weekday: "long" });
    return { ...r, next, todayKey: dateKey(target) };
  }, [birth, at]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">出生日期</span>
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">截止日期（留空为今天）</span>
          <Input type="date" value={at} onChange={(e) => setAt(e.target.value)} />
        </label>
      </div>
      {isErr(result) ? (
        <ErrorBox msg={result.error} />
      ) : result ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="周岁" v={`${result.y} 岁 ${result.m} 个月 ${result.d} 天`} />
            <KeyValue k="总存活天数" v={result.totalDays.toLocaleString() + " 天"} mono />
            <KeyValue k="下一个生日" v={dateKey(result.nextBirthday)} mono />
            <KeyValue k="距下一个生日" v={result.nextBirthdayDays + " 天"} />
            <KeyValue k="当天是" v={result.next} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
