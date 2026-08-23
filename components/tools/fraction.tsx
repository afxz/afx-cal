"use client";

import { useState } from "react";
import { Input, Field, KeyValue, ErrorBox, selectCls } from "@/components/ui";
import {
  fracFromDecimal, fracToDecimal, fracToString, fracAdd, fracSub, fracMul, fracDiv,
  type Frac,
} from "@/lib/utils";

const MODES = [
  ["dec2frac", "小数 → 分数"],
  ["frac2dec", "分数 → 小数"],
  ["arith", "分数运算"],
] as const;

export default function FractionTool() {
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("dec2frac");

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
      {mode === "dec2frac" && <DecToFrac />}
      {mode === "frac2dec" && <FracToDec />}
      {mode === "arith" && <FracArith />}
    </div>
  );
}

function DecToFrac() {
  const [dec, setDec] = useState("0.333333");
  const [maxDen, setMaxDen] = useState("100000");

  const n = parseFloat(dec);
  const max = parseInt(maxDen) || 100000;
  let frac: Frac | null = null;
  if (Number.isFinite(n)) frac = fracFromDecimal(n, max);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="小数">
          <Input type="number" value={dec} onChange={(e) => setDec(e.target.value)} />
        </Field>
        <Field label="最大分母">
          <Input type="number" min={1} value={maxDen} onChange={(e) => setMaxDen(e.target.value)} />
        </Field>
      </div>
      {frac ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="最简分数" v={fracToString(frac, false)} mono />
            <KeyValue k="带分数" v={fracToString(frac, true)} mono />
            <KeyValue k="数值校验" v={String(fracToDecimal(frac))} mono />
          </div>
        </div>
      ) : (
        <ErrorBox msg="请输入有效的小数" />
      )}
    </div>
  );
}

function FracToDec() {
  const [num, setNum] = useState("1");
  const [den, setDen] = useState("3");

  const n = parseFloat(num);
  const d = parseFloat(den);
  const ok = Number.isFinite(n) && Number.isFinite(d) && d !== 0;
  const frac: Frac | null = ok ? { num: n, den: d } : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="分子">
          <Input type="number" value={num} onChange={(e) => setNum(e.target.value)} />
        </Field>
        <Field label="分母（不能为 0）">
          <Input type="number" value={den} onChange={(e) => setDen(e.target.value)} />
        </Field>
      </div>
      {frac ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="小数" v={String(fracToDecimal(frac))} mono />
            <KeyValue k="最简分数" v={fracToString(frac, false)} mono />
          </div>
        </div>
      ) : (
        <ErrorBox msg="请输入有效分数（分母不为 0）" />
      )}
    </div>
  );
}

function FracArith() {
  const [a1, setA1] = useState("1");
  const [a2, setA2] = useState("2");
  const [op, setOp] = useState("+");
  const [b1, setB1] = useState("1");
  const [b2, setB2] = useState("3");

  const parse = (x: string) => {
    const v = parseFloat(x);
    return Number.isFinite(v) ? v : NaN;
  };

  const fa: Frac = { num: parse(a1), den: parse(a2) };
  const fb: Frac = { num: parse(b1), den: parse(b2) };
  const valid = Number.isFinite(fa.num) && Number.isFinite(fa.den) && Number.isFinite(fb.num) && Number.isFinite(fb.den) && fa.den !== 0 && fb.den !== 0;

  let out: Frac | null = null;
  if (valid) {
    switch (op) {
      case "+": out = fracAdd(fa, fb); break;
      case "-": out = fracSub(fa, fb); break;
      case "×": out = fracMul(fa, fb); break;
      case "÷": out = fracDiv(fa, fb); break;
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_56px_1fr] items-end gap-2">
        <Field label="分子 A">
          <Input type="number" value={a1} onChange={(e) => setA1(e.target.value)} />
        </Field>
        <Field label="分母 A">
          <Input type="number" value={a2} onChange={(e) => setA2(e.target.value)} />
        </Field>
        <Field label="运算符">
          <select className={selectCls + " w-full"} value={op} onChange={(e) => setOp(e.target.value)}>
            {["+", "-", "×", "÷"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="分子 B">
          <Input type="number" value={b1} onChange={(e) => setB1(e.target.value)} />
        </Field>
        <Field label="分母 B">
          <Input type="number" value={b2} onChange={(e) => setB2(e.target.value)} />
        </Field>
      </div>
      {out ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="结果（分数）" v={fracToString(out, false)} mono />
            <KeyValue k="结果（带分数）" v={fracToString(out, true)} mono />
            <KeyValue k="结果（小数）" v={String(fracToDecimal(out))} mono />
          </div>
        </div>
      ) : (
        <ErrorBox msg="请输入有效分数（分母不为 0）" />
      )}
    </div>
  );
}
