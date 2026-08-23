"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, selectCls } from "@/components/ui";
import { compoundInterest, annuityFV, formatMoney } from "@/lib/utils";

export default function InterestTool() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("3");
  const [years, setYears] = useState("5");
  const [mode, setMode] = useState("compound");
  const [freq, setFreq] = useState("12");
  const [pmt, setPmt] = useState("1000");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    const n = parseInt(freq);
    const m = parseFloat(pmt);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(r) || r < 0 || !Number.isFinite(y) || y <= 0) return null;
    let total: number;
    if (mode === "simple") {
      total = p * (1 + (r / 100) * y);
    } else if (mode === "compound") {
      total = compoundInterest(p, r, y, n || 1);
    } else {
      if (!Number.isFinite(m) || m <= 0) return null;
      total = p + annuityFV(m, r, y, n || 12);
    }
    return {
      total,
      interest: total - (mode === "invest" ? p : p),
      principal: mode === "invest" ? p + m * (n || 12) * y : p,
      yieldPct: ((total - p) / p) * 100,
    };
  }, [principal, rate, years, mode, freq, pmt]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="本金（元）">
          <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="年利率（%）">
          <Input type="number" step={0.01} value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="期限（年）">
          <Input type="number" step={0.1} value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field label="计息方式">
          <select className={selectCls + " w-full"} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="simple">单利</option>
            <option value="compound">复利</option>
            <option value="invest">复利 + 定期定投</option>
          </select>
        </Field>
        {mode !== "simple" && (
          <Field label="计息频次">
            <select className={selectCls + " w-full"} value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="1">每年</option>
              <option value="2">每半年</option>
              <option value="4">每季度</option>
              <option value="12">每月</option>
            </select>
          </Field>
        )}
        {mode === "invest" && (
          <Field label="每月定投（元）">
            <Input type="number" value={pmt} onChange={(e) => setPmt(e.target.value)} />
          </Field>
        )}
      </div>
      {result ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="本息合计" v={formatMoney(result.total) + " 元"} />
            <KeyValue k="收益 / 利息" v={formatMoney(result.interest) + " 元"} />
            <KeyValue k="本金投入" v={formatMoney(result.principal) + " 元"} />
            <KeyValue k="收益率" v={result.yieldPct.toFixed(2) + " %"} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-zinc-400">请输入有效参数（定投模式下还需填写每月定投金额）</div>
      )}
    </div>
  );
}
