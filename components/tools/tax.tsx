"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, Table } from "@/components/ui";
import { incomeTax, TAX_BRACKETS_VIEW, formatMoney, formatNumber } from "@/lib/utils";

export default function TaxTool() {
  const [salary, setSalary] = useState("240000");
  const [social, setSocial] = useState("1000");
  const [special, setSpecial] = useState("24000");
  const [other, setOther] = useState("0");

  const result = useMemo(() => {
    const annual = parseFloat(salary);
    const socialMonthly = parseFloat(social) || 0;
    const specialAnnual = parseFloat(special) || 0;
    const otherAnnual = parseFloat(other) || 0;
    if (!Number.isFinite(annual) || annual <= 0) return null;
    const taxable = Math.max(0, annual - 60000 - socialMonthly * 12 - specialAnnual - otherAnnual);
    const { tax, rate, quick } = incomeTax(taxable);
    return {
      annual,
      socialAnnual: socialMonthly * 12,
      taxable,
      tax,
      rate,
      quick,
      monthlyTax: tax / 12,
      net: annual - tax - socialMonthly * 12,
      effectiveRate: annual > 0 ? (tax / annual) * 100 : 0,
    };
  }, [salary, social, special, other]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="年薪总额（税前，元）">
          <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </Field>
        <Field label="五险一金个人部分（每月，元）">
          <Input type="number" value={social} onChange={(e) => setSocial(e.target.value)} />
        </Field>
        <Field label="专项附加扣除（每年，元）">
          <Input type="number" value={special} onChange={(e) => setSpecial(e.target.value)} />
        </Field>
        <Field label="其他扣除（每年，元）">
          <Input type="number" value={other} onChange={(e) => setOther(e.target.value)} />
        </Field>
      </div>
      {result ? (
        <>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="应纳税所得额" v={formatMoney(result.taxable) + " 元"} />
              <KeyValue k="年度应纳个税" v={formatMoney(result.tax) + " 元"} />
              <KeyValue k="平均每月个税" v={formatMoney(result.monthlyTax) + " 元"} />
              <KeyValue k="适用税率" v={(result.rate * 100) + " %（速算扣除 " + formatMoney(result.quick) + " 元）"} />
              <KeyValue k="实际税负率" v={result.effectiveRate.toFixed(2) + " %"} />
              <KeyValue k="税后到手（不含五险一金）" v={formatMoney(result.net) + " 元"} />
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              综合所得税率表（年度，2024）
            </div>
            <Table
              head={["级数", "全年应纳税所得额", "税率", "速算扣除数"]}
              rows={TAX_BRACKETS_VIEW.map((b, i) => [
                i + 1,
                `${formatNumber(b.low)} ~ ${b.up === null ? "∞" : formatNumber(b.up)} 元`,
                (b.rate * 100) + " %",
                formatMoney(b.quick) + " 元",
              ])}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            按年度综合所得估算：应纳税所得额 = 年薪 − 60000 − 五险一金 − 专项附加扣除 − 其他扣除，再套用累进税率。未考虑年中换工作、年终奖单独计税等情形。
          </p>
        </>
      ) : (
        <div className="text-sm text-zinc-400">请输入有效年薪</div>
      )}
    </div>
  );
}
