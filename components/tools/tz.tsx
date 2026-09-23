"use client";

import { useEffect, useMemo, useState } from "react";
import { selectCls, Input, Field, btnGhost } from "@/components/ui";
import { getTimeZones, formatInZone, zoneOffsetMinutes, offsetLabel } from "@/lib/utils";

const WORLD_CLOCKS: { zone: string; city: string }[] = [
  { zone: "Asia/Shanghai", city: "北京" },
  { zone: "Asia/Tokyo", city: "东京" },
  { zone: "Asia/Singapore", city: "新加坡" },
  { zone: "Europe/London", city: "伦敦" },
  { zone: "Europe/Berlin", city: "柏林" },
  { zone: "America/New_York", city: "纽约" },
  { zone: "America/Los_Angeles", city: "洛杉矶" },
  { zone: "Australia/Sydney", city: "悉尼" },
];

export default function TzTool() {
  const zones = useMemo(() => getTimeZones(), []);
  const [dt, setDt] = useState("");
  const [from, setFrom] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Shanghai");
  const [to, setTo] = useState("America/New_York");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const parsed = useMemo(() => {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})$/.exec(dt);
    if (!m) return null;
    const [y, mo, d, h, mi] = m.slice(1).map(Number);
    return new Date(y, mo - 1, d, h, mi);
  }, [dt]);

  const useNow = () => {
    const d = new Date();
    const pad = (x: number) => String(x).padStart(2, "0");
    setDt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="日期时间（按本地时区输入）">
            <Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
          </Field>
          <button type="button" className={btnGhost} onClick={useNow}>
            🕐 用当前时间
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="源时区">
            <select className={selectCls + " w-full"} value={from} onChange={(e) => setFrom(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </Field>
          <Field label="目标时区">
            <select className={selectCls + " w-full"} value={to} onChange={(e) => setTo(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </Field>
        </div>
        {parsed ? (
          <div className="grid gap-3 md:grid-cols-2">
            <ZoneCard title="源时区" zone={from} date={parsed} highlight={false} />
            <ZoneCard title="目标时区" zone={to} date={parsed} highlight />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700">
            选择日期时间后显示换算结果
          </div>
        )}
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">世界时钟（实时）</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {WORLD_CLOCKS.map(({ zone, city }) => {
            const label = formatInZone(now, zone);
            const off = offsetLabel(zoneOffsetMinutes(now, zone));
            return (
              <div key={zone} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {city} <span className="font-mono">{off}</span>
                </div>
                <div className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ title, zone, date, highlight }: { title: string; zone: string; date: Date; highlight?: boolean }) {
  const offset = offsetLabel(zoneOffsetMinutes(date, zone));
  const time = formatInZone(date, zone);
  const utc = formatInZone(date, "UTC");
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (highlight
          ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30"
          : "border-zinc-200 dark:border-zinc-800")
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</span>
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{offset}</span>
      </div>
      <div className="mt-1 font-mono text-sm text-zinc-400 dark:text-zinc-500">{zone}</div>
      <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{time}</div>
      <div className="mt-1 font-mono text-xs text-zinc-400 dark:text-zinc-500">UTC {utc}</div>
    </div>
  );
}
