"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, selectCls } from "@/components/ui";
import { equalPayment, equalPrincipal, amortSchedule, formatMoney } from "@/lib/utils";

export default function LoanTool() {
  const [amount, setAmount] = useState("1000000");
  const [rate, setRate] = useState("3.5");
  const [years, setYears] = useState("30");
  const [months, setMonths] = useState("0");
  const [type, setType] = useState("equal-payment");

  const result = useMemo(() => {
    const p = parseFloat(amount);
    const r = parseFloat(rate);
    const totalMonths = Math.round(parseFloat(years) * 12 + (parseFloat(months) || 0));
    if (!Number.isFinite(p) || p <= 0) return null;
    if (!Number.isFinite(r) || r < 0) return null;
    if (!Number.isFinite(totalMonths) || totalMonths <= 0) return null;
    if (type === "equal-payment") {
      const ep = equalPayment(p, r, totalMonths);
      const schedule = amortSchedule(p, r, totalMonths, 360);
      return { ...ep, totalMonths, schedule, kind: "payment" as const };
    }
    const epr = equalPrincipal(p, r, totalMonths);
    return { ...epr, totalMonths, kind: "principal" as const };
  }, [amount, rate, years, months, type]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="贷款金额（元）">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="年利率（%）">
          <Input type="number" step={0.01} value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="还款方式">
          <select className={selectCls + " w-full"} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="equal-payment">等额本息</option>
            <option value="equal-principal">等额本金</option>
          </select>
        </Field>
        <Field label="期限（年）">
          <Input type="number" step={0.1} min={0} value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field label="额外月份">
          <Input type="number" min={0} value={months} onChange={(e) => setMonths(e.target.value)} />
        </Field>
      </div>
      {result ? (
        <>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue
                k="月供"
                v={
                  result.kind === "payment"
                    ? `${formatMoney(result.monthly)} 元 / 月`
                    : `首月 ${formatMoney(result.first)} 元，末月 ${formatMoney(result.last)} 元`
                }
              />
              <KeyValue k="总利息" v={formatMoney(result.totalInterest) + " 元"} />
              <KeyValue k="本息合计" v={formatMoney(result.totalPayment) + " 元"} />
              <KeyValue k="利息占比" v={((result.totalInterest / result.totalPayment) * 100).toFixed(1) + " %"} />
              <KeyValue k="总期数" v={result.totalMonths + " 期（" + (result.totalMonths / 12).toFixed(1) + " 年）"} />
            </div>
          </div>
          {result.kind === "payment" && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span>还款明细（等额本息）</span>
                <span>
                  {result.schedule.rows.length} 期
                  {result.schedule.truncated ? "（已截断，仅显示前 360 期）" : ""}
                </span>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">期数</th>
                      <th className="px-3 py-2 font-medium">月供</th>
                      <th className="px-3 py-2 font-medium">本金</th>
                      <th className="px-3 py-2 font-medium">利息</th>
                      <th className="px-3 py-2 font-medium">剩余本金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.rows.map((row) => (
                      <tr key={row.month} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="px-3 py-1.5 text-zinc-500">{row.month}</td>
                        <td className="px-3 py-1.5 font-mono">{formatMoney(row.payment)}</td>
                        <td className="px-3 py-1.5 font-mono">{formatMoney(row.principal)}</td>
                        <td className="px-3 py-1.5 font-mono">{formatMoney(row.interest)}</td>
                        <td className="px-3 py-1.5 font-mono">{formatMoney(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-zinc-400">请输入有效的金额、利率与期限</div>
      )}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">等额本息月供固定，等额本金月供逐月递减；均按等额分期（每月一期）计算，利率按年利率/12。</p>
    </div>
  );
}
