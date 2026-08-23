"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, ErrorBox, selectCls, isErr } from "@/components/ui";
import { baseToBigInt, bigIntToBase, maskToBits, toSigned } from "@/lib/utils";

const WORDS = [
  ["0", "不限定"],
  ["8", "8 位"],
  ["16", "16 位"],
  ["32", "32 位"],
  ["64", "64 位"],
] as const;

export default function BaseConvTool() {
  const [fromBase, setFromBase] = useState("16");
  const [value, setValue] = useState("ff");
  const [toBase, setToBase] = useState("10");
  const [word, setWord] = useState("0");

  const result = useMemo(() => {
    const radix = parseInt(fromBase);
    const v = baseToBigInt(value, radix);
    if (v === null) return { error: `无效的 ${radix} 进制输入` };
    const bits = parseInt(word);
    const unsigned = bits > 0 ? maskToBits(v, bits) : null;
    const signed = bits > 0 ? toSigned(v, bits) : null;
    return {
      v,
      dec: bigIntToBase(v, 10),
      hex: bigIntToBase(v, 16),
      oct: bigIntToBase(v, 8),
      bin: bigIntToBase(v, 2),
      custom: bigIntToBase(v, parseInt(toBase) || 10),
      unsigned,
      signed,
      bitLength: (() => {
        const abs = v < 0n ? -v : v;
        return abs === 0n ? 1 : abs.toString(2).length;
      })(),
    };
  }, [fromBase, value, toBase, word]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="输入进制">
          <select className={selectCls + " w-full"} value={fromBase} onChange={(e) => setFromBase(e.target.value)}>
            {[2, 8, 10, 16, 36].map((b) => (
              <option key={b} value={b}>
                进制 {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="目标进制">
          <select className={selectCls + " w-full"} value={toBase} onChange={(e) => setToBase(e.target.value)}>
            {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
              <option key={b} value={b}>
                进制 {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="位宽（补码解释）">
          <select className={selectCls + " w-full"} value={word} onChange={(e) => setWord(e.target.value)}>
            {WORDS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={`数值（进制 ${fromBase}）`}>
        <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={fromBase === "16" ? "ff 或 -1a" : "输入数值"} spellCheck={false} className="font-mono" />
      </Field>
      {isErr(result) ? (
        <ErrorBox msg={result.error} />
      ) : result ? (
        <>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="二进制 (2)" v={result.bin} mono />
              <KeyValue k="八进制 (8)" v={result.oct} mono />
              <KeyValue k="十进制 (10)" v={result.dec} mono />
              <KeyValue k="十六进制 (16)" v={result.hex} mono />
              <KeyValue k={`自定义进制 (${parseInt(toBase)})`} v={result.custom} mono />
              <KeyValue k="二进制位长" v={result.bitLength + " 位"} mono />
              {result.unsigned !== null && result.signed !== null && (
                <>
                  <KeyValue k={`无符号（${word} 位）`} v={bigIntToBase(result.unsigned, 10)} mono />
                  <KeyValue k={`有符号（${word} 位）`} v={bigIntToBase(result.signed, 10)} mono />
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">使用 BigInt 精确计算，支持超大整数与前导负号。</p>
    </div>
  );
}
