"use client";

import { useState } from "react";
import { Input, KeyValue, ErrorBox, selectCls, Field, isErr } from "@/components/ui";
import { relativeTime } from "@/lib/utils";

export default function TimestampTool() {
  const [ts, setTs] = useState("");
  const [dt, setDt] = useState("");
  const [zone, setZone] = useState("local");

  const tsResult = (() => {
    const t = ts.trim();
    if (!t) return null;
    let ms: number;
    const n = Number(t);
    if (!Number.isFinite(n)) return { error: "请输入数字时间戳" };
    ms = Math.abs(n) > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { error: "无效的时间戳" };
    const fmt = (opts: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat("zh-CN", { hour12: false, ...opts }).format(d);
    return {
      ms: d.getTime(),
      sec: Math.floor(d.getTime() / 1000),
      local: fmt({ dateStyle: "full", timeStyle: "long" }),
      utc: fmt({ timeZone: "UTC", dateStyle: "full", timeStyle: "long" }),
      iso: d.toISOString(),
      rel: relativeTime(d),
    };
  })();

  const dtResult = (() => {
    const t = dt.trim();
    if (!t) return null;
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return null;
    const [y, mo, d, h, mi] = m.slice(1).map(Number);
    const isUtc = zone === "utc";
    const ms = isUtc ? Date.UTC(y, mo - 1, d, h, mi) : new Date(y, mo - 1, d, h, mi).getTime();
    return { sec: Math.floor(ms / 1000), ms };
  })();

  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">当前时间</div>
        <KeyValue k="Unix 秒" v={nowSec} mono />
        <KeyValue k="Unix 毫秒" v={Date.now()} mono />
      </div>
      <div>
        <Field label="时间戳（秒或毫秒，自动识别）">
          <Input type="text" value={ts} onChange={(e) => setTs(e.target.value)} placeholder={"如 " + nowSec} spellCheck={false} />
        </Field>
        {isErr(tsResult) ? (
          <ErrorBox msg={tsResult.error} />
        ) : tsResult ? (
          <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="本地时间" v={tsResult.local} />
              <KeyValue k="UTC 时间" v={tsResult.utc} />
              <KeyValue k="ISO 8601" v={tsResult.iso} mono />
              <KeyValue k="相对时间" v={tsResult.rel} />
              <KeyValue k="毫秒值" v={tsResult.ms} mono />
            </div>
          </div>
        ) : null}
      </div>
      <div>
        <div className="grid grid-cols-[1fr_140px] gap-3">
          <Field label="日期时间 → 时间戳">
            <Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
          </Field>
          <Field label="时区">
            <select className={selectCls + " w-full"} value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="local">本地</option>
              <option value="utc">UTC</option>
            </select>
          </Field>
        </div>
        {dtResult && !isErr(dtResult) ? (
          <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="Unix 秒" v={dtResult.sec} mono />
              <KeyValue k="Unix 毫秒" v={dtResult.ms} mono />
            </div>
          </div>
        ) : null}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">注意：datetime-local 输入框以浏览器本地时区解析。</p>
    </div>
  );
}
