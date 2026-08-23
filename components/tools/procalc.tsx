"use client";

import { useMemo, useState } from "react";
import { Input, Field, KeyValue, ErrorBox, selectCls, isErr } from "@/components/ui";
import { baseToBigInt, bigIntToBase, maskToBits, toSigned } from "@/lib/utils";

const BASES = [
  ["16", "HEX"],
  ["10", "DEC"],
  ["8", "OCT"],
  ["2", "BIN"],
] as const;

const OPS = ["AND", "OR", "XOR", "NOT", "NEG", "<<", ">>"] as const;

export default function ProCalcTool() {
  const [a, setA] = useState("ff");
  const [aBase, setABase] = useState("16");
  const [b, setB] = useState("0f");
  const [bBase, setBBase] = useState("16");
  const [op, setOp] = useState<(typeof OPS)[number]>("AND");
  const [word, setWord] = useState("32");

  const result = useMemo(() => {
    const bits = parseInt(word);
    const mask = (1n << BigInt(bits)) - 1n;
    const av = baseToBigInt(a, parseInt(aBase));
    if (av === null) return { error: `操作数 A 不是有效的 ${aBase} 进制数` };
    if (op !== "NOT" && op !== "NEG") {
      const bv = baseToBigInt(b, parseInt(bBase));
      if (bv === null) return { error: `操作数 B 不是有效的 ${bBase} 进制数` };
      let v: bigint;
      switch (op) {
        case "AND": v = av & bv; break;
        case "OR": v = av | bv; break;
        case "XOR": v = av ^ bv; break;
        case "<<":
          if (bv < 0n || bv > BigInt(bits)) return { error: `移位量超出范围（0-${bits}）` };
          v = av << bv;
          break;
        case ">>":
          if (bv < 0n || bv > BigInt(bits)) return { error: `移位量超出范围（0-${bits}）` };
          v = av >> bv;
          break;
        default: v = 0n;
      }
      const masked = v & mask;
      return buildResult(masked, bits, word);
    }
    const masked = (op === "NOT" ? mask ^ av : (-av) & mask);
    return buildResult(masked, bits, word);
  }, [a, aBase, b, bBase, op, word]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="操作数 A">
          <div className="flex gap-2">
            <Input type="text" value={a} onChange={(e) => setA(e.target.value)} className="font-mono" spellCheck={false} />
            <select className={selectCls + " shrink-0"} value={aBase} onChange={(e) => setABase(e.target.value)}>
              {BASES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="操作数 B">
          <div className="flex gap-2">
            <Input type="text" value={b} onChange={(e) => setB(e.target.value)} className="font-mono" spellCheck={false} disabled={op === "NOT" || op === "NEG"} />
            <select className={selectCls + " shrink-0"} value={bBase} onChange={(e) => setBBase(e.target.value)}>
              {BASES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="运算">
          <select className={selectCls + " w-full"} value={op} onChange={(e) => setOp(e.target.value as never)}>
            {OPS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="字长">
          <select className={selectCls + " w-full"} value={word} onChange={(e) => setWord(e.target.value)}>
            {[["8", "8 位"], ["16", "16 位"], ["32", "32 位"], ["64", "64 位"]].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
      {isErr(result) ? (
        <ErrorBox msg={result.error} />
      ) : result ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4">
            <KeyValue k="HEX" v={result.hex} mono />
            <KeyValue k="DEC（无符号）" v={result.unsigned} mono />
            <KeyValue k="DEC（有符号）" v={result.signed} mono />
            <KeyValue k="OCT" v={result.oct} mono />
            <KeyValue k="BIN" v={result.bin} mono />
          </div>
        </div>
      ) : null}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        NOT 为按位取反（^ 全 1 掩码），NEG 为补码取负，移位为逻辑移位。结果按字长截断。
      </p>
    </div>
  );
}

function buildResult(masked: bigint, bits: number, word: string) {
  return {
    hex: bigIntToBase(masked, 16).toUpperCase().padStart(Math.ceil(bits / 4), "0"),
    unsigned: masked.toString(),
    signed: toSigned(masked, bits).toString(),
    oct: bigIntToBase(masked, 8),
    bin: bigIntToBase(masked, 2).padStart(bits, "0"),
  };
}
