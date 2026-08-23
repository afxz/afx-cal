"use client";

import { useMemo, useState } from "react";
import { Input, Field, selectCls, Table } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import type { UnitSystem } from "@/lib/units";

export default function UnitConverter({ system }: { system: UnitSystem }) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(system.units[1]?.id ?? system.units[0]?.id);
  const [to, setTo] = useState(system.units[2]?.id ?? system.units[0]?.id);

  const v = parseFloat(value);
  const valid = Number.isFinite(v);

  const base = valid ? system.toBase(v, from) : NaN;
  const out = valid ? system.fromBase(base, to) : NaN;

  const table = useMemo(() => {
    if (!valid) return [];
    return system.units.map((u) => {
      const converted = system.fromBase(base, u.id);
      return [u.name, formatNumber(converted, 8)];
    });
  }, [system, base, valid]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_160px_160px_1fr]">
        <Field label="数值">
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="从">
          <select className={selectCls + " w-full"} value={from} onChange={(e) => setFrom(e.target.value)}>
            {system.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>
        <Field label="到">
          <select className={selectCls + " w-full"} value={to} onChange={(e) => setTo(e.target.value)}>
            {system.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end pb-1">
          <div className="w-full rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {valid ? `${formatNumber(out, 8)} ${system.units.find((u) => u.id === to)?.name.split(" ")[0] ?? ""}` : "—"}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">全部单位换算</div>
        {valid ? (
          <Table head={["单位", "数值"]} rows={table} className="rounded-xl border border-zinc-200 dark:border-zinc-800" />
        ) : (
          <div className="text-sm text-zinc-400">请输入有效数值</div>
        )}
      </div>
    </div>
  );
}
